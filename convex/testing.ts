import { internalMutation } from "./_generated/server";

// ── Test: Multi-level chain commission ──────────────────────────────────────
// Verifies: direct commission, chain depth limits, Growth Partner check,
// chain percentage based on position, and purchase-amount-based chain calc.
//
// Chain rules:
// 1. Direct referrer gets direct commission (capped by lower_program_rule)
// 2. Chain commission only activates if the DIRECT referrer is a Growth Partner
// 3. Each upline in the chain must be a Growth Partner to earn chain commission
// 4. Chain depth is limited by each upline's maxChainDepth (per position)
// 5. Chain commission = chainPct% of the ACTUAL purchase amount
//
// Run with: npx convex run testing:testChainCommission

const CHAIN_EMAIL_DOMAIN = "chaintest.zetagrow";

function hashPw(pw: string): { hash: string; salt: string } {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (h * 31 + pw.charCodeAt(i)) | 0;
  }
  return { hash: `test_${Math.abs(h).toString(36)}`, salt: "testsalt" };
}

async function cleanupTestUsers(ctx: any) {
  const users = await ctx.db.query("users").collect();
  const testUsers = users.filter((u: any) => u.email?.endsWith(CHAIN_EMAIL_DOMAIN));
  for (const u of testUsers) {
    const sales = await ctx.db
      .query("affiliateSales")
      .withIndex("by_referrerUserId", (q: any) => q.eq("referrerUserId", u._id))
      .collect();
    for (const s of sales) await ctx.db.delete(s._id);

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q: any) => q.eq("userId", u._id))
      .collect();
    for (const p of purchases) await ctx.db.delete(p._id);

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrerUserId", (q: any) => q.eq("referrerUserId", u._id))
      .collect();
    for (const r of referrals) await ctx.db.delete(r._id);

    const wallets = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q: any) => q.eq("userId", u._id))
      .collect();
    for (const w of wallets) await ctx.db.delete(w._id);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q: any) => q.eq("userId", u._id))
      .collect();
    for (const n of notifications) await ctx.db.delete(n._id);

    await ctx.db.delete(u._id);
  }
}

async function createTestUser(
  ctx: any,
  name: string,
  index: number,
  referredById?: string,
  positionName?: string,
  partnerTier?: string
) {
  const email = `${name.toLowerCase().replace(/\s/g, "")}${index}@${CHAIN_EMAIL_DOMAIN}`;
  const pw = hashPw(email);
  const now = Date.now();

  let positionId: any = undefined;
  if (positionName) {
    const pos = await ctx.db
      .query("positions")
      .filter((q: any) => q.eq(q.field("name"), positionName))
      .first();
    if (pos) positionId = pos._id;
  }

  const userId = await ctx.db.insert("users", {
    name,
    email,
    passwordHash: pw.hash,
    salt: pw.salt,
    role: "user",
    status: "active",
    referralCode: `TEST${name.toUpperCase().replace(/\s/g, "")}${index}`,
    referredBy: referredById || undefined,
    positionId,
    partnerTier: partnerTier || undefined,
    partnerSince: partnerTier ? now : undefined,
    kycStatus: "verified",
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.insert("wallets", {
    userId,
    availableBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    workEarnings: 0,
    affiliateEarnings: 0,
    updatedAt: now,
  });

  if (referredById) {
    await ctx.db.insert("referrals", {
      referrerUserId: referredById,
      referredUserId: userId,
      referralCode: `TEST${index}`,
      status: "completed",
      createdAt: now,
    });
  }

  return { userId, email };
}

async function setupAffiliateSettings(ctx: any) {
  const now = Date.now();
  const positions = await ctx.db.query("positions").collect();
  const posMap: Record<string, string> = {};
  for (const p of positions) {
    posMap[p.name] = p._id.toString();
  }

  const chainLevels: Record<string, number> = {};
  const maxChainDepth: Record<string, number> = {};
  const positionMultipliers: Record<string, number> = {};

  if (posMap["Associate Specialist"]) {
    chainLevels[posMap["Associate Specialist"]] = 5;
    maxChainDepth[posMap["Associate Specialist"]] = 1;
    positionMultipliers[posMap["Associate Specialist"]] = 1;
  }
  if (posMap["Growth Lead"]) {
    chainLevels[posMap["Growth Lead"]] = 10;
    maxChainDepth[posMap["Growth Lead"]] = 2;
    positionMultipliers[posMap["Growth Lead"]] = 1;
  }
  if (posMap["Senior Project Manager"]) {
    chainLevels[posMap["Senior Project Manager"]] = 20;
    maxChainDepth[posMap["Senior Project Manager"]] = 3;
    positionMultipliers[posMap["Senior Project Manager"]] = 1;
  }

  const existing = await ctx.db
    .query("adminSettings")
    .withIndex("by_key", (q: any) => q.eq("key", "affiliate"))
    .first();

  const settings = {
    enabled: true,
    commissionMethod: "lower_program_rule",
    defaultPercentage: 50,
    holdingPeriodDays: 0,
    minimumPurchaseAmount: 100,
    perSaleCap: 50000,
    dailyCommissionCap: 0,
    monthlyCommissionCap: 0,
    chainEnabled: true,
    chainLevels,
    maxChainDepth,
    positionMultipliers,
  };

  if (existing) {
    await ctx.db.patch(existing._id, { value: settings, updatedAt: now });
  } else {
    await ctx.db.insert("adminSettings", {
      key: "affiliate",
      value: settings,
      updatedAt: now,
    });
  }

  return { posMap, settings };
}

async function createTestProgram(ctx: any, name: string, price: number) {
  const now = Date.now();
  return await ctx.db.insert("programs", {
    name,
    slug: name.toLowerCase().replace(/\s/g, "-"),
    description: `Test program: ${name}`,
    shortDescription: name,
    category: "Testing",
    price,
    status: "published",
    affiliateEnabled: true,
    certificateEnabled: true,
    accessDuration: "lifetime",
    duration: "4 weeks",
    thumbnail: "",
    sortOrder: 0,
    faqs: [],
    outcomes: [],
    whatIncluded: [],
    createdAt: now,
    updatedAt: now,
  });
}

async function simulatePurchase(ctx: any, buyerId: string, programId: string, programPrice: number) {
  const now = Date.now();
  const buyer: any = await ctx.db.get(buyerId);

  const purchaseId = await ctx.db.insert("purchases", {
    userId: buyerId,
    programId,
    amount: programPrice,
    status: "completed",
    paymentId: `PAY_TEST_${now}`,
    paymentMethod: "razorpay",
    createdAt: now,
  });

  if (!buyer.referredBy) return { purchaseId, sales: [] };

  const referrer: any = await ctx.db.get(buyer.referredBy);
  if (!referrer || referrer.status !== "active") return { purchaseId, sales: [] };

  const settingsRecord = await ctx.db
    .query("adminSettings")
    .withIndex("by_key", (q: any) => q.eq("key", "affiliate"))
    .first();
  const affiliateSettings = settingsRecord?.value;
  if (!affiliateSettings?.enabled) return { purchaseId, sales: [] };

  if (programPrice < affiliateSettings.minimumPurchaseAmount) return { purchaseId, sales: [] };

  const createdSales: any[] = [];

  // Direct commission
  const referrerPurchases = await ctx.db
    .query("purchases")
    .withIndex("by_userId", (q: any) => q.eq("userId", referrer._id))
    .filter((q: any) => q.eq(q.field("status"), "completed"))
    .collect();

  let referrerMaxProgramPrice = 0;
  for (const rp of referrerPurchases) {
    const rpProg = rp.programId ? await ctx.db.get(rp.programId) : null;
    if (rpProg && rpProg.price > referrerMaxProgramPrice) {
      referrerMaxProgramPrice = rpProg.price;
    }
  }

  let commissionBasis = programPrice;
  if (affiliateSettings.commissionMethod === "lower_program_rule" && referrerPurchases.length > 0) {
    commissionBasis = Math.min(programPrice, referrerMaxProgramPrice);
  }

  const commissionPercentage = affiliateSettings.defaultPercentage || 50;
  let commissionAmount = Math.round((commissionBasis * commissionPercentage) / 100);

  if (commissionAmount > 0) {
    const holdingPeriodEndsAt = now;
    const directSaleId = await ctx.db.insert("affiliateSales", {
      purchaseId,
      buyerUserId: buyerId,
      referrerUserId: referrer._id,
      programId,
      saleAmount: programPrice,
      commissionAmount,
      status: "pending",
      awaitingConsumption: true,
      ruleUsed: "Test direct sale",
      holdingPeriodEndsAt,
      createdAt: now,
      updatedAt: now,
      kind: "direct",
    });

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q: any) => q.eq("userId", referrer._id))
      .first();
    if (wallet) {
      await ctx.db.patch(wallet._id, {
        pendingBalance: wallet.pendingBalance + commissionAmount,
      });
    }

    createdSales.push({
      kind: "direct",
      referrerId: referrer._id.toString(),
      referrerName: referrer.name,
      commissionAmount,
      saleAmount: programPrice,
    });

    // Chain commissions — only if DIRECT referrer is a Growth Partner
    if (affiliateSettings.chainEnabled && referrer.referredBy && referrer.partnerTier === "growth_partner") {
      let currentReferrer = referrer;
      let chainLevel = 1;
      let parentSaleId = directSaleId;

      while (currentReferrer.referredBy) {
        const upline = await ctx.db.get(currentReferrer.referredBy);
        if (
          !upline ||
          upline._id.toString() === currentReferrer._id.toString() ||
          upline._id.toString() === buyerId ||
          upline.status !== "active"
        ) {
          break;
        }

        if (upline.partnerTier !== "growth_partner") break;

        const chainPct =
          upline.positionId && affiliateSettings.chainLevels
            ? affiliateSettings.chainLevels[String(upline.positionId)] || 0
            : 0;

        if (chainPct <= 0) break;

        const maxDepth =
          upline.positionId && affiliateSettings.maxChainDepth
            ? affiliateSettings.maxChainDepth[String(upline.positionId)] || 1
            : 1;
        if (chainLevel > maxDepth) break;

        let chainAmount = Math.round((programPrice * chainPct) / 100);

        if (affiliateSettings.perSaleCap > 0 && chainAmount > affiliateSettings.perSaleCap) {
          chainAmount = affiliateSettings.perSaleCap;
        }

        if (chainAmount > 0) {
          const chainSaleId = await ctx.db.insert("affiliateSales", {
            purchaseId,
            buyerUserId: buyerId,
            referrerUserId: upline._id,
            programId,
            saleAmount: programPrice,
            commissionAmount: chainAmount,
            status: "pending",
            awaitingConsumption: true,
            ruleUsed: `Test chain level ${chainLevel}`,
            holdingPeriodEndsAt,
            createdAt: now,
            updatedAt: now,
            kind: "chain",
            parentSaleId,
            chainLevel,
            baseCommissionAmount: programPrice,
          });

          const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_userId", (q: any) => q.eq("userId", upline._id))
            .first();
          if (wallet) {
            await ctx.db.patch(wallet._id, {
              pendingBalance: wallet.pendingBalance + chainAmount,
            });
          }

          createdSales.push({
            kind: "chain",
            chainLevel,
            referrerId: upline._id.toString(),
            referrerName: upline.name,
            commissionAmount: chainAmount,
            saleAmount: programPrice,
            chainPct,
          });

          parentSaleId = chainSaleId;
        } else {
          break;
        }

        currentReferrer = upline;
        chainLevel++;
      }
    }
  }

  return { purchaseId, sales: createdSales };
}

// ── Main test ───────────────────────────────────────────────────────────────
export const testChainCommission = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: string[] = [];
    const pass = (msg: string) => results.push(`✅ PASS: ${msg}`);
    const fail = (msg: string, expected: string, got: string) =>
      results.push(`❌ FAIL: ${msg}\n   Expected: ${expected}\n   Got: ${got}`);

    try {
      await cleanupTestUsers(ctx);
      const { posMap } = await setupAffiliateSettings(ctx);
      const programId = await createTestProgram(ctx, "Test Program", 14000);

      // ══════════════════════════════════════════════════════════════════════
      // SCENARIO 1: A(Senior PM,GP) → B(Growth Lead,GP) → C(Assoc Spec,GP) → D(regular) → E(buyer)
      //
      // Chain config:
      //   Senior PM:     20% chain, depth 3
      //   Growth Lead:   10% chain, depth 2
      //   Assoc Spec:     5% chain, depth 1
      //
      // When E buys ₹14,000:
      //   D gets direct (lower_program_rule: min(14000, 14000)=14000 × 50% = ₹7,000)
      //   C gets chain L1 (5% of ₹14,000 = ₹700) — C is GP with depth 1
      //   B gets chain L2 (10% of ₹14,000 = ₹1,400) — B is GP with depth 2
      //   A gets chain L3 (20% of ₹14,000 = ₹2,800) — A is GP with depth 3
      // ══════════════════════════════════════════════════════════════════════
      results.push("\n═══ SCENARIO 1: Full chain E buys — all GPs, depth limits apply ═══");

      const a = await createTestUser(ctx, "Alice", 1, undefined, "Senior Project Manager", "growth_partner");
      const b = await createTestUser(ctx, "Bob", 2, a.userId, "Growth Lead", "growth_partner");
      const c = await createTestUser(ctx, "Carol", 3, b.userId, "Associate Specialist", "growth_partner");
      const d = await createTestUser(ctx, "Dave", 4, c.userId); // NOT a GP
      const e = await createTestUser(ctx, "Eve", 5, d.userId);

      const ePurchase = await simulatePurchase(ctx, e.userId, programId, 14000);
      results.push(`\nE buys ₹14,000:`);
      for (const s of ePurchase.sales) {
        results.push(`  ${s.kind === "direct" ? "Direct" : `Chain L${s.chainLevel}`} → ${s.referrerName}: ₹${s.commissionAmount}`);
      }

      // D gets direct (D referred E)
      const dDirect = ePurchase.sales.find((s: any) => s.kind === "direct");
      if (dDirect && dDirect.commissionAmount === 7000) {
        pass("D gets direct ₹7,000");
      } else {
        fail("D direct", "₹7,000", `₹${dDirect?.commissionAmount || "not found"}`);
      }

      // C gets chain L1 (C is GP, depth 1) — but wait, C's referrer is D (not GP)
      // Chain: D(referrer of E) → C → B → A
      // D is NOT a GP, so chain should NOT activate!
      // The direct referrer (D) is not a Growth Partner → no chain at all
      const cChain = ePurchase.sales.find((s: any) => s.kind === "chain" && s.referrerName === "Carol");
      const bChain = ePurchase.sales.find((s: any) => s.kind === "chain" && s.referrerName === "Bob");
      const aChain = ePurchase.sales.find((s: any) => s.kind === "chain" && s.referrerName === "Alice");

      if (!cChain && !bChain && !aChain) {
        pass("No chain commissions (direct referrer D is not a Growth Partner)");
      } else {
        fail("No chain commissions", "none", `${ePurchase.sales.filter((s: any) => s.kind === "chain").length} chain sales found`);
      }

      // ══════════════════════════════════════════════════════════════════════
      // SCENARIO 2: A(Senior PM,GP) → B(Growth Lead,GP) → C(buyer)
      // All GPs in chain. C buys ₹14,000.
      //
      // B gets direct: min(14000, B's max purchased program price)
      //   B hasn't purchased anything yet → referrerMaxProgramPrice = 0
      //   So commissionBasis = 14000 (no lower_program_rule applies when no purchases)
      //   commissionAmount = 14000 × 50% = ₹7,000
      //
      // A gets chain L1: 20% of ₹14,000 = ₹2,800 (Senior PM, depth 3, chainLevel 1 ≤ 3)
      // ══════════════════════════════════════════════════════════════════════
      results.push("\n═══ SCENARIO 2: A(GP)→B(GP)→C(buyer) — chain activates ═══");

      const a2 = await createTestUser(ctx, "Alice2", 6, undefined, "Senior Project Manager", "growth_partner");
      const b2 = await createTestUser(ctx, "Bob2", 7, a2.userId, "Growth Lead", "growth_partner");
      const c2 = await createTestUser(ctx, "Carol2", 8, b2.userId);

      const c2Purchase = await simulatePurchase(ctx, c2.userId, programId, 14000);
      results.push(`\nC buys ₹14,000:`);
      for (const s of c2Purchase.sales) {
        results.push(`  ${s.kind === "direct" ? "Direct" : `Chain L${s.chainLevel}`} → ${s.referrerName}: ₹${s.commissionAmount}`);
      }

      const b2Direct = c2Purchase.sales.find((s: any) => s.kind === "direct");
      if (b2Direct && b2Direct.commissionAmount === 7000) {
        pass("B2 gets direct ₹7,000");
      } else {
        fail("B2 direct", "₹7,000", `₹${b2Direct?.commissionAmount || "not found"}`);
      }

      const a2Chain = c2Purchase.sales.find((s: any) => s.kind === "chain" && s.referrerName === "Alice2");
      if (a2Chain && a2Chain.commissionAmount === 2800) {
        pass("A2 gets chain L1 ₹2,800 (20% of ₹14,000)");
      } else {
        fail("A2 chain L1", "₹2,800", `₹${a2Chain?.commissionAmount || "not found"}`);
      }

      // ══════════════════════════════════════════════════════════════════════
      // SCENARIO 3: A(GP) → B(NOT GP) → C(buyer)
      // Direct referrer B is NOT a Growth Partner → chain should NOT activate
      // ══════════════════════════════════════════════════════════════════════
      results.push("\n═══ SCENARIO 3: A(GP)→B(NOT GP)→C(buyer) — no chain ═══");

      const a3 = await createTestUser(ctx, "Alice3", 9, undefined, "Senior Project Manager", "growth_partner");
      const b3 = await createTestUser(ctx, "Bob3", 10, a3.userId); // NOT a GP
      const c3 = await createTestUser(ctx, "Carol3", 11, b3.userId);

      const c3Purchase = await simulatePurchase(ctx, c3.userId, programId, 14000);
      results.push(`\nC buys ₹14,000:`);
      for (const s of c3Purchase.sales) {
        results.push(`  ${s.kind === "direct" ? "Direct" : `Chain L${s.chainLevel}`} → ${s.referrerName}: ₹${s.commissionAmount}`);
      }

      const b3Direct = c3Purchase.sales.find((s: any) => s.kind === "direct");
      if (b3Direct && b3Direct.commissionAmount === 7000) {
        pass("B3 gets direct ₹7,000");
      } else {
        fail("B3 direct", "₹7,000", `₹${b3Direct?.commissionAmount || "not found"}`);
      }

      const a3Chain = c3Purchase.sales.find((s: any) => s.kind === "chain");
      if (!a3Chain) {
        pass("A3 gets NO chain commission (direct referrer B3 is not a GP)");
      } else {
        fail("A3 chain", "₹0 (no chain)", `₹${a3Chain.commissionAmount}`);
      }

      // ══════════════════════════════════════════════════════════════════════
      // SCENARIO 4: Depth limit enforcement
      // A(Growth Lead,GP,depth 2) → B(Assoc Spec,GP,depth 1) → C(GP) → D(buyer)
      //
      // When D buys:
      //   C gets direct: ₹7,000
      //   B gets chain L1: 5% of ₹14,000 = ₹700 (depth 1, chainLevel 1 ≤ 1) ✓
      //   A gets chain L2: 10% of ₹14,000 = ₹1,400 (depth 2, chainLevel 2 ≤ 2) ✓
      //
      // When E buys (E→D→C→B→A):
      //   D gets direct: ₹7,000
      //   C gets chain L1: 5% = ₹700
      //   B gets chain L2: 10% = ₹1,400
      //   A gets chain L3: would be 10% but chainLevel 3 > maxDepth 2 → STOP
      // ══════════════════════════════════════════════════════════════════════
      results.push("\n═══ SCENARIO 4: Depth limit — A(depth 2) → B(depth 1) → C → D → E ═══");

      const a4 = await createTestUser(ctx, "Alice4", 12, undefined, "Growth Lead", "growth_partner");
      const b4 = await createTestUser(ctx, "Bob4", 13, a4.userId, "Associate Specialist", "growth_partner");
      const c4 = await createTestUser(ctx, "Carol4", 14, b4.userId, "Associate Specialist", "growth_partner");
      const d4 = await createTestUser(ctx, "Dave4", 15, c4.userId);
      const e4 = await createTestUser(ctx, "Eve4", 16, d4.userId);

      // D buys: C direct, B chain L1, A chain L2
      const d4Purchase = await simulatePurchase(ctx, d4.userId, programId, 14000);
      results.push(`\nD buys ₹14,000:`);
      for (const s of d4Purchase.sales) {
        results.push(`  ${s.kind === "direct" ? "Direct" : `Chain L${s.chainLevel}`} → ${s.referrerName}: ₹${s.commissionAmount}`);
      }

      const c4Direct = d4Purchase.sales.find((s: any) => s.kind === "direct");
      if (c4Direct && c4Direct.commissionAmount === 7000) {
        pass("C4 gets direct ₹7,000");
      } else {
        fail("C4 direct", "₹7,000", `₹${c4Direct?.commissionAmount || "not found"}`);
      }

      const b4ChainL1 = d4Purchase.sales.find((s: any) => s.kind === "chain" && s.chainLevel === 1);
      if (b4ChainL1 && b4ChainL1.commissionAmount === 700) {
        pass("B4 gets chain L1 ₹700 (5% of ₹14,000)");
      } else {
        fail("B4 chain L1", "₹700", `₹${b4ChainL1?.commissionAmount || "not found"}`);
      }

      const a4ChainL2 = d4Purchase.sales.find((s: any) => s.kind === "chain" && s.chainLevel === 2);
      if (a4ChainL2 && a4ChainL2.commissionAmount === 1400) {
        pass("A4 gets chain L2 ₹1,400 (10% of ₹14,000)");
      } else {
        fail("A4 chain L2", "₹1,400", `₹${a4ChainL2?.commissionAmount || "not found"}`);
      }

      // E buys: D is direct referrer, D is NOT a GP → chain should NOT activate
      const e4Purchase = await simulatePurchase(ctx, e4.userId, programId, 14000);
      results.push(`\nE buys ₹14,000:`);
      for (const s of e4Purchase.sales) {
        results.push(`  ${s.kind === "direct" ? "Direct" : `Chain L${s.chainLevel}`} → ${s.referrerName}: ₹${s.commissionAmount}`);
      }

      const d4Direct = e4Purchase.sales.find((s: any) => s.kind === "direct");
      if (d4Direct && d4Direct.commissionAmount === 7000) {
        pass("D4 gets direct ₹7,000");
      } else {
        fail("D4 direct", "₹7,000", `₹${d4Direct?.commissionAmount || "not found"}`);
      }

      // D4 is NOT a Growth Partner → chain should NOT activate
      const e4ChainSales = e4Purchase.sales.filter((s: any) => s.kind === "chain");
      if (e4ChainSales.length === 0) {
        pass("No chain commissions (direct referrer D4 is not a Growth Partner)");
      } else {
        fail("No chain for E purchase", "0 chain sales", `${e4ChainSales.length} chain sales found`);
      }

      // ══════════════════════════════════════════════════════════════════════
      // SCENARIO 5: Depth limit — all GPs
      // A(Senior PM,GP,depth 3) → B(Growth Lead,GP,depth 2) → C(Assoc Spec,GP,depth 1) → D(GP) → E(buyer)
      //
      // When E buys:
      //   D gets direct: ₹7,000
      //   C gets chain L1: 5% = ₹700 (C's depth 1, chainLevel 1 ≤ 1) ✓
      //   B gets chain L2: 10% = ₹1,400 (B's depth 2, chainLevel 2 ≤ 2) ✓
      //   A gets chain L3: 20% = ₹2,800 (A's depth 3, chainLevel 3 ≤ 3) ✓
      //
      // When F buys (F→E→D→C→B→A):
      //   E gets direct: ₹7,000
      //   D gets chain L1: 5% = ₹700
      //   C gets chain L2: 10% = ₹1,400
      //   B gets chain L3: chainLevel 3 > B's depth 2 → STOP
      // ══════════════════════════════════════════════════════════════════════
      results.push("\n═══ SCENARIO 5: Depth limit — all GPs A(depth3)→B(depth2)→C(depth1)→D→E→F ═══");

      const a5 = await createTestUser(ctx, "Alice5", 20, undefined, "Senior Project Manager", "growth_partner");
      const b5 = await createTestUser(ctx, "Bob5", 21, a5.userId, "Growth Lead", "growth_partner");
      const c5 = await createTestUser(ctx, "Carol5", 22, b5.userId, "Associate Specialist", "growth_partner");
      const d5 = await createTestUser(ctx, "Dave5", 23, c5.userId, "Associate Specialist", "growth_partner");
      const e5 = await createTestUser(ctx, "Eve5", 24, d5.userId, "Associate Specialist", "growth_partner");
      const f5 = await createTestUser(ctx, "Fay5", 25, e5.userId);

      // E buys: D direct, C chain L1, B chain L2, A chain L3
      const e5Purchase = await simulatePurchase(ctx, e5.userId, programId, 14000);
      results.push(`\nE buys ₹14,000:`);
      for (const s of e5Purchase.sales) {
        results.push(`  ${s.kind === "direct" ? "Direct" : `Chain L${s.chainLevel}`} → ${s.referrerName}: ₹${s.commissionAmount}`);
      }

      const d5Direct = e5Purchase.sales.find((s: any) => s.kind === "direct");
      if (d5Direct && d5Direct.commissionAmount === 7000) {
        pass("D5 gets direct ₹7,000");
      } else {
        fail("D5 direct", "₹7,000", `₹${d5Direct?.commissionAmount || "not found"}`);
      }

      const c5ChainL1 = e5Purchase.sales.find((s: any) => s.kind === "chain" && s.chainLevel === 1);
      if (c5ChainL1 && c5ChainL1.commissionAmount === 700) {
        pass("C5 gets chain L1 ₹700 (5% of ₹14,000)");
      } else {
        fail("C5 chain L1", "₹700", `₹${c5ChainL1?.commissionAmount || "not found"}`);
      }

      const b5ChainL2 = e5Purchase.sales.find((s: any) => s.kind === "chain" && s.chainLevel === 2);
      if (b5ChainL2 && b5ChainL2.commissionAmount === 1400) {
        pass("B5 gets chain L2 ₹1,400 (10% of ₹14,000)");
      } else {
        fail("B5 chain L2", "₹1,400", `₹${b5ChainL2?.commissionAmount || "not found"}`);
      }

      const a5ChainL3 = e5Purchase.sales.find((s: any) => s.kind === "chain" && s.chainLevel === 3);
      if (a5ChainL3 && a5ChainL3.commissionAmount === 2800) {
        pass("A5 gets chain L3 ₹2,800 (20% of ₹14,000)");
      } else {
        fail("A5 chain L3", "₹2,800", `₹${a5ChainL3?.commissionAmount || "not found"}`);
      }

      // F buys: E direct (GP), D chain L1 (depth 1), chain stops at C (depth 1, L2 > 1)
      const f5Purchase = await simulatePurchase(ctx, f5.userId, programId, 14000);
      results.push(`\nF buys ₹14,000:`);
      for (const s of f5Purchase.sales) {
        results.push(`  ${s.kind === "direct" ? "Direct" : `Chain L${s.chainLevel}`} → ${s.referrerName}: ₹${s.commissionAmount}`);
      }

      const e5Direct = f5Purchase.sales.find((s: any) => s.kind === "direct");
      if (e5Direct && e5Direct.commissionAmount === 7000) {
        pass("E5 gets direct ₹7,000");
      } else {
        fail("E5 direct", "₹7,000", `₹${e5Direct?.commissionAmount || "not found"}`);
      }

      const d5ChainL1 = f5Purchase.sales.find((s: any) => s.kind === "chain" && s.chainLevel === 1);
      if (d5ChainL1 && d5ChainL1.commissionAmount === 700) {
        pass("D5 gets chain L1 ₹700");
      } else {
        fail("D5 chain L1", "₹700", `₹${d5ChainL1?.commissionAmount || "not found"}`);
      }

      // C5 has depth 1, chainLevel would be 2 → exceeds C5's depth → stops
      const c5ChainL2 = f5Purchase.sales.find((s: any) => s.kind === "chain" && s.referrerName === "Carol5");
      if (!c5ChainL2) {
        pass("C5 gets NO chain L2 (exceeds depth 1 limit)");
      } else {
        fail("C5 chain L2", "₹0 (depth limit)", `₹${c5ChainL2.commissionAmount}`);
      }

      // ══════════════════════════════════════════════════════════════════════
      // SCENARIO 6: lower_program_rule — referrer's max plan caps commission
      // A(GP) → B(GP) → C(buyer)
      // B owns a ₹8,000 program. C buys ₹14,000.
      // B's direct commission: min(14000, 8000) = 8000 × 50% = ₹4,000
      // A's chain L1: 20% of ₹14,000 = ₹2,800 (chain uses purchase amount, not commission)
      // ══════════════════════════════════════════════════════════════════════
      results.push("\n═══ SCENARIO 6: lower_program_rule — B owns ₹8K, C buys ₹14K ═══");

      const a6 = await createTestUser(ctx, "Alice6", 26, undefined, "Senior Project Manager", "growth_partner");
      const b6 = await createTestUser(ctx, "Bob6", 27, a6.userId, "Growth Lead", "growth_partner");
      const c6 = await createTestUser(ctx, "Carol6", 28, b6.userId);

      // B purchases an ₹8,000 program first
      const cheapProgram = await createTestProgram(ctx, "Cheap Program", 8000);
      await simulatePurchase(ctx, b6.userId, cheapProgram, 8000);

      // Now C buys ₹14,000
      const c6Purchase = await simulatePurchase(ctx, c6.userId, programId, 14000);
      results.push(`\nC buys ₹14,000 (B owns ₹8K program):`);
      for (const s of c6Purchase.sales) {
        results.push(`  ${s.kind === "direct" ? "Direct" : `Chain L${s.chainLevel}`} → ${s.referrerName}: ₹${s.commissionAmount}`);
      }

      // B's direct: min(14000, 8000) = 8000 × 50% = ₹4,000
      const b6Direct = c6Purchase.sales.find((s: any) => s.kind === "direct");
      if (b6Direct && b6Direct.commissionAmount === 4000) {
        pass("B6 gets direct ₹4,000 (lower_program_rule: 50% of ₹8,000)");
      } else {
        fail("B6 direct", "₹4,000", `₹${b6Direct?.commissionAmount || "not found"}`);
      }

      // A's chain: 20% of ₹14,000 = ₹2,800 (purchase amount, not commission)
      const a6Chain = c6Purchase.sales.find((s: any) => s.kind === "chain");
      if (a6Chain && a6Chain.commissionAmount === 2800) {
        pass("A6 gets chain L1 ₹2,800 (20% of ₹14,000 purchase)");
      } else {
        fail("A6 chain L1", "₹2,800", `₹${a6Chain?.commissionAmount || "not found"}`);
      }

      // ══════════════════════════════════════════════════════════════════════
      // SUMMARY
      // ══════════════════════════════════════════════════════════════════════
      const passed = results.filter((r) => r.startsWith("✅")).length;
      const failed = results.filter((r) => r.startsWith("❌")).length;
      results.push(`\n═══ SUMMARY: ${passed} passed, ${failed} failed ═══`);

      await cleanupTestUsers(ctx);
      return results.join("\n");
    } catch (err: any) {
      results.push(`\n💥 ERROR: ${err.message}\n${err.stack}`);
      return results.join("\n");
    }
  },
});

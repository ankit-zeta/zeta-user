import { v } from "convex/values";
import { query } from "./_generated/server";

export const getUserCertificates = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    return certificates;
  },
});

export const verifyCertificate = query({
  args: { certificateId: v.string() },
  handler: async (ctx, args) => {
    const cert = await ctx.db
      .query("certificates")
      .withIndex("by_certificateId", (q) => q.eq("certificateId", args.certificateId.trim().toUpperCase()))
      .first();

    if (!cert) return null;

    const program = await ctx.db.get(cert.programId);

    // CEO signature image lives in Convex storage (never in the public
    // bundle). The storage URL is unguessable; the signature is displayed on
    // every issued certificate by design.
    let signatureUrl: string | null = null;
    const setting = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", "certificate"))
      .first();
    const sigId = setting?.value?.signatureStorageId;
    if (sigId) {
      signatureUrl = (await ctx.storage.getUrl(sigId as any)) || null;
    }

    return {
      isValid: true,
      certificateId: cert.certificateId,
      recipientName: cert.recipientName,
      programName: cert.programName,
      issueDate: cert.issueDate,
      programDuration: program?.duration || "Complete",
      issuer: "ZetaGrow Credential Registry",
      signatureUrl,
    };
  },
});

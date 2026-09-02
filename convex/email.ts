import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { Resend } from "resend";

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured in Convex environment");
  }
  return new Resend(apiKey);
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zetagrow.in").trim();
const LOGO_URL = `${SITE_URL}/email-logo.png`;

const BRAND = {
  name: "ZetaGrow",
  tagline: "Learn. Work. Grow.",
  supportEmail: "hey@zetagrow.in",
  primaryColor: "#176B4D",
  primaryHover: "#13573E",
  bgColor: "#FAFAF7",
  textColor: "#202522",
  textMuted: "#69736D",
};

function emailWrapper({ title, preheader, content, cta, ctaText, ctaUrl, footerNote }: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND.bgColor};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color: #FFFFFF; border-bottom: 1px solid #E4E8E5; padding: 28px 40px; text-align: center;">
              <img
                src="${LOGO_URL}"
                alt="${BRAND.name}"
                width="180"
                style="display: block; margin: 0 auto; height: auto; max-width: 200px;"
              />
              <p style="margin: 10px 0 0; font-size: 11px; color: ${BRAND.primaryColor}; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">${BRAND.tagline}</p>
            </td>
          </tr>
          ${preheader ? `<tr><td style="padding: 24px 40px 0; text-align: center;"><p style="margin: 0; font-size: 14px; color: ${BRAND.textMuted}; line-height: 1.5;">${preheader}</p></td></tr>` : ''}
          <tr>
            <td style="padding: 32px 40px 24px;">
              ${content}
            </td>
          </tr>
          ${cta && ctaText && ctaUrl ? `
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.primaryHover} 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px; padding: 16px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(23,107,77,0.3); transition: transform 0.2s;">
                ${ctaText}
              </a>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="background-color: ${BRAND.bgColor}; padding: 24px 40px; border-top: 1px solid #E4E8E5; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 12px; color: ${BRAND.textMuted}; line-height: 1.6;">
                ${footerNote || `You're receiving this because you have an account with ${BRAND.name}.`}
              </p>
              <p style="margin: 0; font-size: 11px; color: ${BRAND.textMuted};">
                ${BRAND.name} &copy; ${new Date().getFullYear()} &bull; <a href="https://zetagrow.in/privacy" style="color: ${BRAND.primaryColor}; text-decoration: none;">Privacy Policy</a> &bull; <a href="https://zetagrow.in/terms" style="color: ${BRAND.primaryColor}; text-decoration: none;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export const sendVerificationEmail = internalAction({
  args: { email: v.string(), token: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const verificationUrl = `${SITE_URL}/verify-email?token=${args.token}&email=${encodeURIComponent(args.email)}`;
    
    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Welcome to <strong>${BRAND.name}</strong>! We're excited to have you start your learning journey with us.
      </p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Please verify your email address to activate your account and unlock access to all courses, certificates, and work opportunities.
      </p>
    `;

    const html = emailWrapper({
      title: "Verify your email - ZetaGrow",
      preheader: "Complete your registration and start learning",
      content,
      cta: true,
      ctaText: "Verify Email Address",
      ctaUrl: verificationUrl,
      footerNote: "This link expires in 24 hours. If you didn't create an account, you can safely ignore this email."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: "Verify your email address - ZetaGrow",
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send verification email:", err);
      return { success: false, error: String(err) };
    }
  },
});

export const sendPasswordResetEmail = internalAction({
  args: { email: v.string(), token: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const resetUrl = `${SITE_URL}/reset-password?token=${args.token}`;
    
    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        You requested to reset your password for your <strong>${BRAND.name}</strong> account.
      </p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Click the button below to create a new password. This link is valid for 1 hour.
      </p>
      <div style="background: #FEF3F2; border: 1px solid #FED7D7; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #C53030; font-weight: 500;">If you didn't request this, please ignore this email or contact support.</p>
      </div>
    `;

    const html = emailWrapper({
      title: "Reset your password - ZetaGrow",
      preheader: "Create a new password for your account",
      content,
      cta: true,
      ctaText: "Reset Password",
      ctaUrl: resetUrl,
      footerNote: "This link expires in 1 hour. If you didn't request a password reset, please ignore this email or contact support."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: "Reset your password - ZetaGrow",
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send password reset email:", err);
      return { success: false, error: String(err) };
    }
  },
});

export const sendWelcomeEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Your email is now verified! Welcome to <strong>${BRAND.name}</strong>. 🎉
      </p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        You now have full access to explore our verified programs, earn certificates, and qualify for real work opportunities.
      </p>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; font-size: 15px; color: ${BRAND.primaryColor}; font-weight: 700;">What's next?</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${BRAND.textColor}; line-height: 2;">
          <li>Browse <a href="https://zetagrow.in/plans" style="color: ${BRAND.primaryColor};">learning plans</a> that match your goals</li>
          <li>Start a free preview lesson to see our teaching style</li>
          <li>Complete courses to earn <strong>verified certificates</strong></li>
          <li>Unlock <strong>curated work opportunities</strong> after qualifying</li>
        </ul>
      </div>
    `;

    const html = emailWrapper({
      title: "Welcome to ZetaGrow!",
      preheader: "Your email is verified - start learning today",
      content,
      cta: true,
      ctaText: "Explore Plans",
      ctaUrl: "https://zetagrow.in/plans",
      footerNote: "Need help? Reply to this email or visit our Help Center."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: "Welcome to ZetaGrow! Your email is verified",
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send welcome email:", err);
      return { success: false, error: String(err) };
    }
  },
});

export const sendReferralNotification = internalAction({
  args: { referrerEmail: v.string(), referrerName: v.string(), referredName: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.referrerName},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Great news! <strong>${args.referredName}</strong> just joined ${BRAND.name} using your referral link.
      </p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        When they purchase a plan, you'll earn a commission — up to 50% of the lower-priced program they choose.
      </p>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.textMuted};">Your referral code</p>
        <p style="margin: 0; font-size: 24px; font-weight: 800; color: ${BRAND.primaryColor}; letter-spacing: 2px;">${args.referrerName.slice(0,4).toUpperCase()}XXXX</p>
      </div>
    `;

    const html = emailWrapper({
      title: "New Referral - ZetaGrow",
      preheader: `${args.referredName} joined using your link`,
      content,
      cta: true,
      ctaText: "View Referrals",
      ctaUrl: "https://zetagrow.in/dashboard/referrals",
      footerNote: "Track all your referrals and earnings in your Affiliate Center."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.referrerEmail,
        subject: `🎉 ${args.referredName} joined via your referral link!`,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send referral notification:", err);
      return { success: false, error: String(err) };
    }
  },
});

// ── Transactional emails (purchases, work, withdrawals, affiliate sales) ────

function inr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// Course / Plan purchase confirmation (sent to buyer)
export const sendPurchaseConfirmationEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    itemName: v.string(),
    itemType: v.string(), // "course" | "plan"
    amount: v.number(),
    coursesIncluded: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const isPlan = args.itemType === "plan";
    const courseList = args.coursesIncluded && args.coursesIncluded.length > 0
      ? `
      <div style="background: #F8FAF9; border: 1px solid #E4E8E5; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; font-size: 14px; color: ${BRAND.primaryColor}; font-weight: 700;">Courses included (${args.coursesIncluded.length})</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${BRAND.textColor}; line-height: 2;">
          ${args.coursesIncluded.map((c) => `<li>${c}</li>`).join("")}
        </ul>
      </div>`
      : "";

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Your payment was successful! You're now enrolled in the ${isPlan ? "plan" : "course"} below.
      </p>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size: 14px; color: ${BRAND.textMuted}; padding-bottom: 6px;">${isPlan ? "Plan" : "Course"}</td>
            <td style="font-size: 14px; color: ${BRAND.textColor}; font-weight: 600; text-align: right; padding-bottom: 6px;">${args.itemName}</td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: ${BRAND.textMuted}; padding-bottom: 6px;">Amount paid</td>
            <td style="font-size: 14px; color: ${BRAND.primaryColor}; font-weight: 700; text-align: right; padding-bottom: 6px;">${inr(args.amount)}</td>
          </tr>
        </table>
      </div>
      ${courseList}
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        You can start learning right away from your dashboard. Your certificate will unlock once you complete all lessons.
      </p>
    `;

    const html = emailWrapper({
      title: "Purchase Confirmed - ZetaGrow",
      preheader: `You're enrolled in ${args.itemName}`,
      content,
      cta: true,
      ctaText: "Start Learning",
      ctaUrl: `${SITE_URL}/dashboard/programs`,
      footerNote: "Keep this email as your purchase receipt. For any billing questions, reply to this email."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: `Purchase confirmed: ${args.itemName} - ZetaGrow`,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send purchase confirmation email:", err);
      return { success: false, error: String(err) };
    }
  },
});

// Affiliate commission earned on a referral's purchase (sent to referrer)
export const sendAffiliateSaleEmail = internalAction({
  args: {
    referrerEmail: v.string(),
    referrerName: v.string(),
    buyerName: v.string(),
    itemName: v.string(),
    saleAmount: v.number(),
    commissionAmount: v.number(),
    holdingPeriodDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const holdDays = args.holdingPeriodDays ?? 7;

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.referrerName},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        💰 <strong>${args.buyerName}</strong>, who joined through your referral, just purchased <strong>${args.itemName}</strong>!
      </p>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.textMuted};">Your commission</p>
        <p style="margin: 0 0 4px; font-size: 32px; font-weight: 800; color: ${BRAND.primaryColor};">${inr(args.commissionAmount)}</p>
        <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">on a sale of ${inr(args.saleAmount)}</p>
      </div>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Your commission moves from <strong>pending</strong> to <strong>available</strong> after the ${holdDays}-day holding period, then you can withdraw it anytime.
      </p>
    `;

    const html = emailWrapper({
      title: "Commission Earned! - ZetaGrow",
      preheader: `You earned ${inr(args.commissionAmount)} commission`,
      content,
      cta: true,
      ctaText: "View My Earnings",
      ctaUrl: `${SITE_URL}/partner`,
      footerNote: "Commissions are held for the configured period before becoming withdrawable."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.referrerEmail,
        subject: `💰 You earned ${inr(args.commissionAmount)} — new referral sale!`,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send affiliate sale email:", err);
      return { success: false, error: String(err) };
    }
  },
});

// Work/freelancing application status update (sent to applicant)
export const sendApplicationStatusEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    jobTitle: v.string(),
    status: v.string(), // accepted | rejected | completed
    payoutAmount: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    let heading = "";
    let message = "";
    let subject = "";
    let boxBg = "#F0FDF4";
    let boxBorder = "#BBF7D0";
    let boxColor = BRAND.primaryColor;
    let ctaText = "Open Dashboard";
    let ctaUrl = `${SITE_URL}/dashboard/work`;

    if (args.status === "accepted") {
      heading = "You've been selected!";
      message = `Great news, <strong>${args.name}</strong>! Your application for <strong>${args.jobTitle}</strong> has been <strong>accepted</strong>. The client/admin will guide you through the next steps.`;
      subject = `🎉 Selected for work: ${args.jobTitle}`;
    } else if (args.status === "completed") {
      const payout = args.payoutAmount && args.payoutAmount > 0
        ? `<div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.textMuted};">Payout credited to your wallet</p>
            <p style="margin: 0; font-size: 32px; font-weight: 800; color: ${BRAND.primaryColor};">${inr(args.payoutAmount)}</p>
          </div>`
        : "";
      heading = "Work completed";
      message = `Your work on <strong>${args.jobTitle}</strong> has been marked <strong>completed</strong>.${payout}`;
      subject = `Work completed: ${args.jobTitle}${args.payoutAmount ? ` — ${inr(args.payoutAmount)} credited` : ""}`;
      ctaUrl = `${SITE_URL}/dashboard/wallet`;
    } else {
      heading = "Application update";
      message = `Thank you for applying to <strong>${args.jobTitle}</strong>. Unfortunately, your application was <strong>not selected</strong> this time.${args.adminNotes ? `<br/><br/><em>Feedback: ${args.adminNotes}</em>` : ""}<br/><br/>Don't be discouraged — new opportunities are posted regularly, and we encourage you to apply again.`;
      subject = `Update on your application: ${args.jobTitle}`;
      boxBg = "#FEF3F2";
      boxBorder = "#FED7D7";
      boxColor = "#C53030";
      ctaText = "Browse More Jobs";
      ctaUrl = `${SITE_URL}/jobs`;
    }

    const content = `
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        <span style="font-size: 18px; font-weight: 700; color: ${boxColor}; display: block; margin-bottom: 12px;">${heading}</span>
        ${message}
      </p>
    `;

    const html = emailWrapper({
      title: `Work update - ZetaGrow`,
      preheader: args.jobTitle,
      content,
      cta: true,
      ctaText,
      ctaUrl,
      footerNote: "Manage all your applications from your dashboard."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send application status email:", err);
      return { success: false, error: String(err) };
    }
  },
});

// Withdrawal outcome (sent to user): completed or rejected
export const sendWithdrawalStatusEmail = internalAction({  args: {
    email: v.string(),
    name: v.string(),
    amount: v.number(),
    status: v.string(), // completed | rejected
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const approved = args.status === "completed";

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <div style="background: ${approved ? "#F0FDF4" : "#FEF3F2"}; border: 1px solid ${approved ? "#BBF7D0" : "#FED7D7"}; border-radius: 8px; padding: 20px; margin: 0 0 24px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.textMuted};">Withdrawal ${approved ? "successful" : "rejected"}</p>
        <p style="margin: 0 0 4px; font-size: 32px; font-weight: 800; color: ${approved ? BRAND.primaryColor : "#C53030"};">${inr(args.amount)}</p>
        ${approved ? `<p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">The amount has been sent to your payout account.</p>` : `<p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">The amount has been refunded to your ZetaGrow wallet.</p>`}
      </div>
      ${approved
        ? `<p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">It may take a few minutes to a couple of hours (depending on your bank/UPI) for the money to reflect in your account.</p>`
        : `<p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">${args.adminNote ? `Reason: <em>${args.adminNote}</em><br/><br/>` : ""}You can request the withdrawal again once the issue is fixed. The full amount is back in your available balance.</p>`}
    `;

    const html = emailWrapper({
      title: `Withdrawal ${approved ? "Successful" : "Rejected"} - ZetaGrow`,
      preheader: `${inr(args.amount)} withdrawal ${approved ? "completed" : "rejected"}`,
      content,
      cta: true,
      ctaText: approved ? "View Wallet" : "Go To Wallet",
      ctaUrl: `${SITE_URL}/dashboard/wallet`,
      footerNote: "Withdrawal queries? Reply to this email with your transaction details."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: approved
          ? `✅ Withdrawal of ${inr(args.amount)} successful`
          : `⚠️ Withdrawal of ${inr(args.amount)} rejected & refunded`,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send withdrawal status email:", err);
      return { success: false, error: String(err) };
    }
  },
});

// Withdrawal request acknowledgment (sent instantly when user requests a withdrawal)
export const sendWithdrawalRequestEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    amount: v.number(),
    netAmount: v.number(),
    fee: v.number(),
    payoutMethod: v.string(),
    tdsAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        We've received your withdrawal request. It's now <strong>under review</strong> by our team.
      </p>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size: 14px; color: ${BRAND.textMuted}; padding-bottom: 6px;">Requested amount</td>
            <td style="font-size: 14px; color: ${BRAND.textColor}; font-weight: 600; text-align: right; padding-bottom: 6px;">${inr(args.amount)}</td>
          </tr>
          ${args.tdsAmount && args.tdsAmount > 0 ? `
          <tr>
            <td style="font-size: 14px; color: ${BRAND.textMuted}; padding-bottom: 6px;">TDS (Income Tax)</td>
            <td style="font-size: 14px; color: ${BRAND.textMuted}; text-align: right; padding-bottom: 6px;">- ${inr(args.tdsAmount)}</td>
          </tr>` : ""}
          <tr>
            <td style="font-size: 14px; color: ${BRAND.textMuted}; padding-bottom: 6px;">Processing fee</td>
            <td style="font-size: 14px; color: ${BRAND.textMuted}; text-align: right; padding-bottom: 6px;">- ${inr(args.fee)}</td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: ${BRAND.textMuted}; padding-bottom: 6px;">Payout method</td>
            <td style="font-size: 14px; color: ${BRAND.textColor}; text-align: right; padding-bottom: 6px;">${args.payoutMethod.replace("_", " ").toUpperCase()}</td>
          </tr>
          <tr>
            <td style="font-size: 15px; color: ${BRAND.primaryColor}; font-weight: 700;">You'll receive</td>
            <td style="font-size: 18px; color: ${BRAND.primaryColor}; font-weight: 800; text-align: right;">${inr(args.netAmount)}</td>
          </tr>
        </table>
      </div>
      ${args.tdsAmount && args.tdsAmount > 0 ? `<p style="margin: 0 0 16px; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">TDS is deducted as per Income Tax rules and reported against your PAN — you can claim credit for it when filing your income tax return.</p>` : ""}
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        You'll get another email as soon as the transfer is completed — usually within 24-48 hours.
      </p>
    `;

    const html = emailWrapper({
      title: "Withdrawal Request Received - ZetaGrow",
      preheader: `${inr(args.amount)} withdrawal is under review`,
      content,
      cta: true,
      ctaText: "View Withdrawals",
      ctaUrl: `${SITE_URL}/dashboard/withdrawals`,
      footerNote: "You don't need to do anything — we'll notify you when it's done."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: `📥 Withdrawal request received — ${inr(args.amount)}`,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send withdrawal request email:", err);
      return { success: false, error: String(err) };
    }
  },
});

// Certificate earned (sent when user completes 100% of a certificate-enabled course)
export const sendCertificateEarnedEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    programName: v.string(),
    certificateId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const certUrl = `${SITE_URL}/certificate/${args.certificateId}`;

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: ${BRAND.primaryColor};">🎓 Congratulations!</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        You've completed <strong>${args.programName}</strong> and earned your verified ZetaGrow certificate.
      </p>
      <div style="background: #F0FDF4; border: 2px dashed ${BRAND.primaryColor}; border-radius: 12px; padding: 28px; margin: 0 0 24px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 13px; color: ${BRAND.textMuted}; text-transform: uppercase; letter-spacing: 2px;">Certificate ID</p>
        <p style="margin: 0 0 4px; font-size: 22px; font-weight: 800; color: ${BRAND.primaryColor}; letter-spacing: 1px;">${args.certificateId}</p>
        <p style="margin: 8px 0 0; font-size: 14px; color: ${BRAND.textColor};">Awarded to <strong>${args.name}</strong> for completing<br/><strong>${args.programName}</strong></p>
      </div>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Add it to your résumé, share it on LinkedIn, or show it off — anyone can verify its authenticity with the ID above.
      </p>
    `;

    const html = emailWrapper({
      title: "Certificate Earned! - ZetaGrow",
      preheader: `Your certificate for ${args.programName} is ready`,
      content,
      cta: true,
      ctaText: "View My Certificate",
      ctaUrl: certUrl,
      footerNote: "Certificates are publicly verifiable via their unique verification link."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: `🎓 Certificate earned: ${args.programName}`,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send certificate email:", err);
      return { success: false, error: String(err) };
    }
  },
});

// Onboarding nudge (signed up but never purchased)
export const sendOnboardingNudgeEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Your ZetaGrow account is ready — but your learning journey hasn't started yet!
      </p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Here's what's waiting for you once you enroll in your first course:
      </p>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${BRAND.textColor}; line-height: 2;">
          <li>🎓 A <strong>verified certificate</strong> employers can check online</li>
          <li>💼 Access to real <strong>freelancing work opportunities</strong></li>
           <li>💰 The chance to earn through our <strong>partner program</strong></li>
        </ul>
      </div>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Not sure where to start? Explore our most popular learning plans — there's something for every career goal.
      </p>
    `;

    const html = emailWrapper({
      title: "Your journey starts here - ZetaGrow",
      preheader: "Pick your first course and start learning today",
      content,
      cta: true,
      ctaText: "Explore Learning Plans",
      ctaUrl: `${SITE_URL}/plans`,
      footerNote: `You're receiving this because you created a ${BRAND.name} account.`
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: `👋 ${args.name.split(" ")[0]}, your first course awaits…`,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send onboarding nudge email:", err);
      return { success: false, error: String(err) };
    }
  },
});

// ── KYC emails ───────────────────────────────────────────────────────────────

// Account created on the member's behalf by the ZetaGrow team (Admin Panel).
export const sendAdminCreatedAccountEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        A <strong>ZetaGrow account has been created for you</strong> by our team. Your login email is
        <strong>${args.email}</strong> — our team member who set this up will share your temporary password with you privately.
      </p>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${BRAND.textColor}; line-height: 2;">
          <li>🎓 Access courses, certificates and work opportunities</li>
          <li>🔐 We recommend changing your password after first login</li>
          <li>💬 Questions? Just reply to this email — we're happy to help</li>
        </ul>
      </div>
    `;

    const html = emailWrapper({
      title: "Your ZetaGrow account is ready",
      preheader: "Welcome to the ZetaGrow family",
      content,
      cta: true,
      ctaText: "Log In to Your Account",
      ctaUrl: `${SITE_URL}/login`,
      footerNote: `You're receiving this because an account was created for ${args.email} on ${BRAND.name}.`
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: "👋 Welcome to ZetaGrow — your account is ready",
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send admin-created account email:", err);
      return { success: false, error: String(err) };
    }
  },
});

// Instant acknowledgment right after submission
export const sendKycReceivedEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        We've received your <strong>KYC documents</strong> (PAN &amp; Aadhaar) along with your address details.
      </p>
      <div style="background: #FFFbeb; border: 1px solid #FDE68A; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${BRAND.textColor}; line-height: 2;">
          <li>🔍 Our team will <strong>manually verify</strong> your details</li>
          <li>📧 We'll notify you by email as soon as it's confirmed</li>
          <li>⏱️ Verification usually completes within <strong>24&ndash;48 hours</strong></li>
        </ul>
      </div>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Until your KYC is verified, partner payouts and withdrawals stay on hold. Everything else on the platform remains fully available.
      </p>
      <p style="margin: 0 0 24px; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">
        Your privacy matters to us: your document images are automatically and permanently deleted from our servers 90 days after approval.
      </p>
    `;

    const html = emailWrapper({
      title: "KYC documents received - ZetaGrow",
      preheader: "We'll notify you once we confirm your KYC",
      content,
      cta: true,
      ctaText: "View KYC Status",
      ctaUrl: `${SITE_URL}/dashboard/kyc`,
      footerNote: "You're receiving this because you submitted KYC documents on your ZetaGrow account."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: "✅ KYC documents received — verification in progress",
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send KYC received email:", err);
      return { success: false, error: String(err) };
    }
  },
});

export const sendKycApprovedEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 0 0 24px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.textMuted};">Your identity verification is complete</p>
        <p style="margin: 0; font-size: 30px; font-weight: 800; color: ${BRAND.primaryColor};">KYC Verified 🎉</p>
      </div>
      <p style="margin: 0 0 16px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">Here's what's now unlocked for you:</p>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${BRAND.textColor}; line-height: 2;">
          <li>💰 Affiliate commissions release to your wallet automatically</li>
          <li>🏧 Withdrawals are enabled on your account</li>
          <li>💼 Work earnings flow without any holds</li>
        </ul>
      </div>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        TDS deductions (if applicable) will be handled against your verified PAN automatically at year-end.
      </p>
    `;

    const html = emailWrapper({
      title: "KYC Verified - ZetaGrow",
      preheader: "Earnings and withdrawals are now unlocked",
      content,
      cta: true,
      ctaText: "Open Affiliate Center",
      ctaUrl: `${SITE_URL}/dashboard/wallet`,
      footerNote: "KYC queries? Reply to this email and our team will help."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: "🎉 Your ZetaGrow KYC is verified — earnings unlocked!",
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send KYC approved email:", err);
      return { success: false, error: String(err) };
    }
  },
});

export const sendKycRejectedEmail = internalAction({
  args: { email: v.string(), name: v.string(), reason: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: false, reason: "RESEND_API_KEY not configured" };
    }

    const content = `
      <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.5;">Hi ${args.name},</p>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        Unfortunately we could not verify your KYC this time.
      </p>
      <div style="background: #FEF3F2; border: 1px solid #FED7D7; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #C53030; text-transform: uppercase; letter-spacing: 1px;">Reason</p>
        <p style="margin: 0; font-size: 14px; color: ${BRAND.textColor}; line-height: 1.6;">${args.reason}</p>
      </div>
      <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6;">
        You can fix the issue and resubmit your documents from your dashboard — e.g. a clearer photo of the card, correct spelling of your name as printed on the PAN, or the right last 4 digits of your Aadhaar.
      </p>
    `;

    const html = emailWrapper({
      title: "KYC verification failed - ZetaGrow",
      preheader: "Resubmit your documents to unlock earnings",
      content,
      cta: true,
      ctaText: "Resubmit KYC",
      ctaUrl: `${SITE_URL}/dashboard/kyc`,
      footerNote: "Need help? Reply to this email and our team will guide you."
    });

    try {
      const resend = getResend();
      await resend.emails.send({
        from: `${BRAND.name} <noreply@zetagrow.in>`,
        to: args.email,
        subject: "⚠️ Action needed: your KYC could not be verified",
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to send KYC rejected email:", err);
      return { success: false, error: String(err) };
    }
  },
});
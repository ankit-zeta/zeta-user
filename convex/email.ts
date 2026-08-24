import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { Resend } from "resend";

// Initialize Resend with environment variable (set in Convex dashboard)
const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND = {
  name: "ZetaGrow",
  tagline: "Learn. Work. Grow.",
  supportEmail: "support@zetagrow.com",
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
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.primaryHover} 100%); padding: 32px 40px; text-align: center;">
              <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;">
                <span style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">Z</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">${BRAND.name}</h1>
              <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.9); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${BRAND.tagline}</p>
            </td>
          </tr>
          
          <!-- Preheader -->
          ${preheader ? `<tr><td style="padding: 24px 40px 0; text-align: center;"><p style="margin: 0; font-size: 14px; color: ${BRAND.textMuted}; line-height: 1.5;">${preheader}</p></td></tr>` : ''}
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px 24px;">
              ${content}
            </td>
          </tr>
          
          <!-- CTA -->
          ${cta && ctaText && ctaUrl ? `
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.primaryHover} 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px; padding: 16px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(23,107,77,0.3); transition: transform 0.2s;">
                ${ctaText}
              </a>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
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

    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://zetagrow.in"}/verify-email?token=${args.token}`;
    
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

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://zetagrow.in"}/reset-password?token=${args.token}`;
    
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
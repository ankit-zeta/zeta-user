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

    return {
      isValid: true,
      certificateId: cert.certificateId,
      recipientName: cert.recipientName,
      programName: cert.programName,
      issueDate: cert.issueDate,
      programDuration: program?.duration || "Complete",
      issuer: "ZetaGrow Credential Registry",
    };
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireSession(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireAdmin(ctx: any, token: string) {
  const session = await requireSession(ctx, token);
  const user = await ctx.db.get(session.userId);
  if (!user || !["super_admin", "admin", "work_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

// Completeness rules: applying for work requires overview + >=1 experience + >=1 education + >=3 skills
function computeCompleteness(profile: any) {
  const sections: Record<string, boolean> = {
    overview: Boolean(profile?.overview && profile.overview.trim().length >= 50),
    experience: (profile?.experience || []).length >= 1,
    education: (profile?.education || []).length >= 1,
    skills: (profile?.technicalSkills || []).length + (profile?.softSkills || []).length >= 3,
    portfolio: true,
  };
  const required = ["overview", "experience", "education", "skills"];
  const filled = required.filter((k) => sections[k]).length;
  const percent = Math.round((filled / required.length) * 100);
  return {
    percent,
    complete: filled === required.length,
    sections,
    required,
  };
}

function serializeProfile(profile: any) {
  if (!profile) {
    return {
      overview: "",
      experience: [],
      education: [],
      technicalSkills: [],
      softSkills: [],
      portfolioUrl: "",
      completeness: computeCompleteness(null),
    };
  }
  return {
    ...profile,
    overview: profile.overview || "",
    portfolioUrl: profile.portfolioUrl || "",
    completeness: computeCompleteness(profile),
  };
}

export const getMyCvProfile = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await requireSession(ctx, args.token);
    const profile = await ctx.db
      .query("cvProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
      .first();
    return serializeProfile(profile);
  },
});

export const upsertCvProfile = mutation({
  args: {
    token: v.string(),
    overview: v.optional(v.string()),
    experience: v.array(
      v.object({
        role: v.string(),
        company: v.string(),
        startDate: v.string(),
        endDate: v.optional(v.string()),
        current: v.optional(v.boolean()),
        description: v.optional(v.string()),
      })
    ),
    education: v.array(
      v.object({
        institution: v.string(),
        degree: v.string(),
        field: v.optional(v.string()),
        status: v.string(),
        startYear: v.optional(v.string()),
        endYear: v.optional(v.string()),
      })
    ),
    technicalSkills: v.array(v.string()),
    softSkills: v.array(v.string()),
    portfolioUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await requireSession(ctx, args.token);

    const overview = args.overview?.trim() || "";
    if (overview.length > 2000) {
      throw new Error("Overview must be under 2000 characters");
    }

    const portfolioUrl = args.portfolioUrl?.trim() || "";
    if (portfolioUrl) {
      if (!/^https?:\/\//i.test(portfolioUrl)) {
        throw new Error("Portfolio must be a valid http(s) link");
      }
      if (portfolioUrl.length > 500) {
        throw new Error("Portfolio link is too long");
      }
    }

    const tech = args.technicalSkills.map((s) => s.trim()).filter(Boolean).slice(0, 25);
    const soft = args.softSkills.map((s) => s.trim()).filter(Boolean).slice(0, 25);
    for (const skill of [...tech, ...soft]) {
      if (skill.length > 60) throw new Error("Skill names must be under 60 characters");
    }

    const experience = args.experience
      .filter((e) => e.role.trim() && e.company.trim())
      .map((e) => ({
        role: e.role.trim(),
        company: e.company.trim(),
        startDate: e.startDate.trim(),
        endDate: e.current ? undefined : e.endDate?.trim() || undefined,
        current: e.current || undefined,
        description: e.description?.trim() || undefined,
      }))
      .slice(0, 15);

    const education = args.education
      .filter((e) => e.institution.trim() && e.degree.trim())
      .map((e) => ({
        institution: e.institution.trim(),
        degree: e.degree.trim(),
        field: e.field?.trim() || undefined,
        status: e.status,
        startYear: e.startYear?.trim() || undefined,
        endYear: e.endYear?.trim() || undefined,
      }))
      .slice(0, 15);

    const existing = await ctx.db
      .query("cvProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
      .first();

    const data = {
      userId: session.userId,
      overview: overview || undefined,
      experience,
      education,
      technicalSkills: tech,
      softSkills: soft,
      portfolioUrl: portfolioUrl || undefined,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("cvProfiles", data);
    }

    return serializeProfile({
      ...data,
      _id: existing?._id,
    });
  },
});

export const getUserCvProfileAdmin = query({
  args: { token: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    const profile = await ctx.db
      .query("cvProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        cvStatus: user.cvStatus || "pending",
      },
      profile: serializeProfile(profile),
    };
  },
});
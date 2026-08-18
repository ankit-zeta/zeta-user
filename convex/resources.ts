import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// Storage IDs are stored in fileUrl; resolve them to signed URLs at read time.
async function resolveFileUrl(ctx: any, fileUrl: string): Promise<string | null> {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http")) return fileUrl;
  return (await ctx.storage.getUrl(fileUrl)) ?? null;
}

// Admin uploads a file to Convex storage and stores the returned storageId
// in resources.fileUrl via createResource/updateResource.
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

async function requireAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || !["super_admin", "admin", "content_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

export const getResourcesForUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const enrolledProgramIds = new Set(purchases.map((p) => p.programId));

    const userAch = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();
    const unlockedAchievementIds = new Set(userAch.map((a) => a.achievementId));

    const allResources = await ctx.db.query("resources").collect();
    allResources.sort((a, b) => a.sortOrder - b.sortOrder);

    const resourcesWithAccess = await Promise.all(
      allResources.map(async (r) => {
        let hasAccess = false;
        let lockReason = "";

        if (session.role !== "user" || r.accessType === "public") {
          hasAccess = true;
        } else if (r.accessType === "enrolled" && r.programId) {
          hasAccess = enrolledProgramIds.has(r.programId);
          if (!hasAccess) {
            const prog = await ctx.db.get(r.programId);
            lockReason = `Requires enrollment in ${prog?.name || "Program"}`;
          }
        } else if (r.accessType === "achievement_locked" && r.minAchievementId) {
          hasAccess = unlockedAchievementIds.has(r.minAchievementId);
          if (!hasAccess) {
            const ach = await ctx.db.get(r.minAchievementId);
            lockReason = `Requires unlocking ${ach?.name || "Achievement"}`;
          }
        }

        let programName = undefined;
        if (r.programId) {
          const prog = await ctx.db.get(r.programId);
          programName = prog?.name;
        }

        return {
          _id: r._id,
          title: r.title,
          description: r.description,
          fileType: r.fileType,
          fileSize: r.fileSize,
          fileUrl: hasAccess ? await resolveFileUrl(ctx, r.fileUrl) : null,
          accessType: r.accessType,
          hasAccess,
          lockReason,
          programName,
          downloadCount: r.downloadCount,
        };
      })
    );

    return resourcesWithAccess;
  },
});

export const getResourcesAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const allResources = await ctx.db.query("resources").collect();
    allResources.sort((a, b) => a.sortOrder - b.sortOrder);

    const detailed = await Promise.all(
      allResources.map(async (r) => {
        let programName: string | undefined;
        if (r.programId) {
          const prog = await ctx.db.get(r.programId);
          programName = prog?.name;
        }
        return {
          _id: r._id,
          title: r.title,
          description: r.description,
          fileType: r.fileType,
          fileSize: r.fileSize,
          fileUrl: await resolveFileUrl(ctx, r.fileUrl),
          isStoredFile: !r.fileUrl.startsWith("http"),
          accessType: r.accessType,
          programId: r.programId,
          programName,
          downloadCount: r.downloadCount,
          sortOrder: r.sortOrder,
        };
      })
    );

    return detailed;
  },
});

export const createResource = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.string(),
    programId: v.optional(v.id("programs")),
    moduleId: v.optional(v.id("programModules")),
    accessType: v.string(),
    minAchievementId: v.optional(v.id("achievements")),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    return await ctx.db.insert("resources", {
      title: args.title.trim(),
      description: args.description.trim(),
      fileUrl: args.fileUrl,
      fileType: args.fileType,
      fileSize: args.fileSize,
      programId: args.programId,
      moduleId: args.moduleId,
      accessType: args.accessType,
      minAchievementId: args.minAchievementId,
      downloadCount: 0,
      sortOrder: args.sortOrder,
      createdAt: Date.now(),
    });
  },
});

export const updateResource = mutation({
  args: {
    token: v.string(),
    resourceId: v.id("resources"),
    title: v.string(),
    description: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.string(),
    programId: v.optional(v.id("programs")),
    accessType: v.string(),
    minAchievementId: v.optional(v.id("achievements")),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.resourceId, {
      title: args.title.trim(),
      description: args.description.trim(),
      fileUrl: args.fileUrl,
      fileType: args.fileType,
      fileSize: args.fileSize,
      programId: args.programId,
      accessType: args.accessType,
      minAchievementId: args.minAchievementId,
      sortOrder: args.sortOrder,
    });
    return { success: true };
  },
});

export const deleteResource = mutation({
  args: {
    token: v.string(),
    resourceId: v.id("resources"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.delete(args.resourceId);
    return { success: true };
  },
});

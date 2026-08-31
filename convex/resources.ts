import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// Storage IDs are stored in fileUrl; resolve them to signed URLs at read time.
async function resolveFileUrl(ctx: any, fileUrl: string): Promise<string | null> {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http")) return fileUrl;
  // Local paths (e.g. /resources/...) — return as-is for client-side handling
  if (fileUrl.startsWith("/")) return fileUrl;
  try {
    return (await ctx.storage.getUrl(fileUrl)) ?? null;
  } catch {
    return null;
  }
}

// Check if a fileUrl is a Convex storage ID (not an HTTP URL)
function isStorageId(fileUrl: string): boolean {
  return !!fileUrl && !fileUrl.startsWith("http");
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

// Build access info for a single resource
function buildAccessInfo(
  r: any,
  isUser: boolean,
  enrolledProgramIds: Set<string>,
  unlockedAchievementIds: Set<string>
): { hasAccess: boolean; lockReason: string } {
  if (!isUser || r.accessType === "public") {
    return { hasAccess: true, lockReason: "" };
  }
  if (r.accessType === "enrolled" && r.programId) {
    if (enrolledProgramIds.has(r.programId)) {
      return { hasAccess: true, lockReason: "" };
    }
    return { hasAccess: false, lockReason: "Enroll in this program to access this resource" };
  }
  if (r.accessType === "achievement_locked" && r.minAchievementId) {
    if (unlockedAchievementIds.has(r.minAchievementId)) {
      return { hasAccess: true, lockReason: "" };
    }
    return { hasAccess: false, lockReason: "Unlock the required achievement to access this resource" };
  }
  return { hasAccess: false, lockReason: "Access restricted" };
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

    const isUser = session.role === "user";

    const visibleResources = allResources.filter((r) => {
      if (!isUser || r.accessType === "public") return true;
      if (r.accessType === "enrolled" && r.programId) {
        return enrolledProgramIds.has(r.programId);
      }
      if (r.accessType === "achievement_locked" && r.minAchievementId) {
        return unlockedAchievementIds.has(r.minAchievementId);
      }
      return false;
    });

    const resourcesWithAccess = await Promise.all(
      visibleResources.map(async (r) => {
        const { hasAccess, lockReason } = buildAccessInfo(
          r,
          isUser,
          enrolledProgramIds,
          unlockedAchievementIds
        );

        let programName = undefined;
        let programSlug = undefined;
        if (r.programId) {
          const prog = await ctx.db.get(r.programId);
          programName = prog?.name;
          programSlug = prog?.slug;
        }

        return {
          _id: r._id,
          title: r.title,
          description: r.description,
          fileType: r.fileType,
          fileSize: r.fileSize,
          fileUrl: hasAccess ? await resolveFileUrl(ctx, r.fileUrl) : null,
          content: hasAccess ? r.content : null,
          accessType: r.accessType,
          hasAccess,
          lockReason,
          programId: r.programId,
          programName,
          programSlug,
          downloadCount: r.downloadCount,
        };
      })
    );

    return resourcesWithAccess;
  },
});

// Get resources for a specific program (used by course player)
export const getResourcesForProgram = query({
  args: {
    token: v.string(),
    programId: v.id("programs"),
  },
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

    const programResources = await ctx.db
      .query("resources")
      .withIndex("by_programId", (q) => q.eq("programId", args.programId))
      .collect();

    programResources.sort((a, b) => a.sortOrder - b.sortOrder);

    const isUser = session.role === "user";

    return await Promise.all(
      programResources.map(async (r) => {
        const { hasAccess, lockReason } = buildAccessInfo(
          r,
          isUser,
          enrolledProgramIds,
          unlockedAchievementIds
        );

        return {
          _id: r._id,
          title: r.title,
          description: r.description,
          fileType: r.fileType,
          fileSize: r.fileSize,
          fileUrl: hasAccess ? await resolveFileUrl(ctx, r.fileUrl) : null,
          content: hasAccess ? r.content : null,
          accessType: r.accessType,
          hasAccess,
          lockReason,
          downloadCount: r.downloadCount,
        };
      })
    );
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
          rawFileUrl: r.fileUrl,
          isStoredFile: isStorageId(r.fileUrl),
          accessType: r.accessType,
          programId: r.programId,
          programName,
          downloadCount: r.downloadCount,
          sortOrder: r.sortOrder,
          createdAt: r.createdAt,
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

    // If fileUrl is changing and the old one was a stored file, clean it up
    const existing = await ctx.db.get(args.resourceId);
    if (existing && existing.fileUrl !== args.fileUrl && isStorageId(existing.fileUrl)) {
      try {
        await ctx.storage.delete(existing.fileUrl);
      } catch {
        // File may already be deleted — continue
      }
    }

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

    // Clean up the stored file before deleting the record
    const existing = await ctx.db.get(args.resourceId);
    if (existing && isStorageId(existing.fileUrl)) {
      try {
        await ctx.storage.delete(existing.fileUrl);
      } catch {
        // File may already be deleted — continue with record deletion
      }
    }

    await ctx.db.delete(args.resourceId);
    return { success: true };
  },
});

// Record a download (increments downloadCount)
export const recordDownload = mutation({
  args: {
    resourceId: v.id("resources"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.resourceId);
    if (!existing) throw new Error("Resource not found");

    await ctx.db.patch(args.resourceId, {
      downloadCount: existing.downloadCount + 1,
    });
    return { success: true };
  },
});

// Bulk create resources for all courses
export const bulkCreateResources = mutation({
  args: {
    token: v.string(),
    resources: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        fileUrl: v.string(),
        fileType: v.string(),
        fileSize: v.string(),
        programId: v.string(),
        accessType: v.string(),
        sortOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const results = [];
    for (const resource of args.resources) {
      const id = await ctx.db.insert("resources", {
        title: resource.title,
        description: resource.description,
        fileUrl: resource.fileUrl,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
        programId: resource.programId as any,
        accessType: resource.accessType,
        downloadCount: 0,
        sortOrder: resource.sortOrder,
        createdAt: Date.now(),
      });
      results.push(id);
    }

    return { success: true, count: results.length, ids: results };
  },
});

// Internal bulk create - for CLI uploads (one-time use, no auth required)
export const bulkCreateResourcesInternal = mutation({
  args: {
    resources: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        fileUrl: v.string(),
        fileType: v.string(),
        fileSize: v.string(),
        content: v.optional(v.string()),
        programId: v.string(),
        accessType: v.string(),
        sortOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // One-time bulk upload - no auth required
    // After upload, remove this mutation for security
    const results = [];
    for (const resource of args.resources) {
      const id = await ctx.db.insert("resources", {
        title: resource.title,
        description: resource.description,
        fileUrl: resource.fileUrl,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
        content: resource.content,
        programId: resource.programId as any,
        accessType: resource.accessType,
        downloadCount: 0,
        sortOrder: resource.sortOrder,
        createdAt: Date.now(),
      });
      results.push(id);
    }

    return { success: true, count: results.length, ids: results };
  },
});

// Delete all resources (for re-upload)
export const deleteAllResources = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    
    const all = await ctx.db.query("resources").collect();
    for (const r of all) {
      await ctx.db.delete(r._id);
    }
    
    return { success: true, deleted: all.length };
  },
});

// Delete only HTML resources (for re-upload)
export const deleteHtmlResources = mutation({
  args: {},
  handler: async (ctx) => {
    const html = await ctx.db
      .query("resources")
      .filter((q) => q.eq(q.field("fileType"), "html"))
      .collect();
    
    for (const r of html) {
      await ctx.db.delete(r._id);
    }
    
    return { success: true, deleted: html.length };
  },
});

// Delete resources by file type (for cleanup)
export const deleteResourcesByType = mutation({
  args: {
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const resources = await ctx.db
      .query("resources")
      .filter((q) => q.eq(q.field("fileType"), args.fileType))
      .collect();
    
    for (const r of resources) {
      await ctx.db.delete(r._id);
    }
    
    return { success: true, deleted: resources.length };
  },
});

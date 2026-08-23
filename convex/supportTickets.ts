import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { enforceRateLimit } from "./rateLimit";

const TICKET_CATEGORIES = [
  "courses",
  "duration",
  "payments",
  "withdrawals",
  "jobs",
  "affiliate",
  "account",
  "other",
];

async function requireUser(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }
  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("Unauthorized: User not found");
  }
  return user;
}

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

function makeTrackingId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return "ZT-" + id;
}

async function generateUniqueTrackingId(ctx: any): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = makeTrackingId();
    const existing = await ctx.db
      .query("supportTickets")
      .withIndex("by_trackingId", (q: any) => q.eq("trackingId", candidate))
      .first();
    if (!existing) return candidate;
  }
  return "ZT-" + Date.now().toString(36).toUpperCase().slice(-6);
}

export const getTicketCategories = query({
  args: {},
  handler: async () => {
    return TICKET_CATEGORIES;
  },
});

async function resolveAttachments(
  ctx: any,
  attachments: any[] | undefined
): Promise<any[] | undefined> {
  if (!attachments || attachments.length === 0) return undefined;
  return await Promise.all(
    attachments.map(async (a) => {
      if (a.type === "image" && !a.url.startsWith("http")) {
        const url = await ctx.storage.getUrl(a.url);
        return { ...a, url: url ?? a.url };
      }
      return a;
    })
  );
}

export const generateTicketUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createTicket = mutation({
  args: {
    token: v.string(),
    category: v.string(),
    title: v.string(),
    message: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          type: v.string(),
          url: v.string(),
          name: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);

    // Rate limit: 5 tickets per hour per user
    await enforceRateLimit(ctx, { key: `createTicket:userId:${user._id}`, max: 5, windowMs: 60 * 60 * 1000 });

    if (!TICKET_CATEGORIES.includes(args.category)) {
      throw new Error("Invalid ticket category");
    }
    const title = args.title.trim();
    const message = args.message.trim();
    if (title.length < 5) {
      throw new Error("Title must be at least 5 characters");
    }
    if (message.length < 10) {
      throw new Error("Please describe the issue in at least 10 characters");
    }

    const trackingId = await generateUniqueTrackingId(ctx);
    const now = Date.now();

    const ticketId = await ctx.db.insert("supportTickets", {
      trackingId,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      category: args.category,
      title,
      message,
      status: "open",
      attachments: args.attachments?.length ? args.attachments : undefined,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("ticketMessages", {
      ticketId,
      sender: "user",
      senderName: user.name,
      message,
      attachments: args.attachments?.length ? args.attachments : undefined,
      createdAt: now,
    });

    return {
      success: true,
      ticketId: ticketId.toString(),
      trackingId,
    };
  },
});

export const getMyTickets = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const tickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    tickets.sort((a, b) => b.createdAt - a.createdAt);
    return tickets;
  },
});

export const getTicketDetail = query({
  args: { token: v.string(), ticketId: v.id("supportTickets") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    if (ticket.userId.toString() !== user._id.toString()) {
      throw new Error("Forbidden: You can only view your own tickets");
    }

    const messages = await ctx.db
      .query("ticketMessages")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", args.ticketId))
      .collect();
    messages.sort((a, b) => a.createdAt - b.createdAt);

    ticket.attachments = (await resolveAttachments(ctx, ticket.attachments)) as any;
    for (const m of messages) {
      m.attachments = (await resolveAttachments(ctx, m.attachments)) as any;
    }

    return { ticket, messages };
  },
});

export const sendTicketReply = mutation({
  args: {
    token: v.string(),
    ticketId: v.id("supportTickets"),
    message: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          type: v.string(),
          url: v.string(),
          name: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    if (ticket.userId.toString() !== user._id.toString()) {
      throw new Error("Forbidden: You can only reply to your own tickets");
    }
    const message = args.message.trim();
    if (message.length < 1) {
      throw new Error("Reply cannot be empty");
    }

    await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      sender: "user",
      senderName: user.name,
      message,
      attachments: args.attachments?.length ? args.attachments : undefined,
      createdAt: Date.now(),
    });

    const status = ticket.status === "closed" ? "closed" : "open";
    await ctx.db.patch(args.ticketId, {
      status,
      updatedAt: Date.now(),
      message: status === "open" && ticket.status === "resolved" ? message : ticket.message,
    });

    return { success: true };
  },
});

export const getTicketByTrackingId = query({
  args: { trackingId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const trackingId = args.trackingId.trim().toUpperCase();
    const email = args.email.trim().toLowerCase();
    const ticket = await ctx.db
      .query("supportTickets")
      .withIndex("by_trackingId", (q) => q.eq("trackingId", trackingId))
      .first();
    if (!ticket) {
      throw new Error("No ticket found with this tracking ID");
    }
    if (ticket.userEmail.toLowerCase() !== email) {
      throw new Error("Email does not match this ticket");
    }

    const messages = await ctx.db
      .query("ticketMessages")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", ticket._id))
      .collect();
    messages.sort((a, b) => a.createdAt - b.createdAt);

    ticket.attachments = (await resolveAttachments(ctx, ticket.attachments)) as any;
    for (const m of messages) {
      m.attachments = (await resolveAttachments(ctx, m.attachments)) as any;
    }

    return { ticket, messages };
  },
});

export const getSupportTickets = query({
  args: {
    token: v.string(),
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    let tickets = await ctx.db.query("supportTickets").collect();
    if (args.status && args.status !== "all") {
      tickets = tickets.filter((t) => t.status === args.status);
    }
    if (args.category && args.category !== "all") {
      tickets = tickets.filter((t) => t.category === args.category);
    }
    if (args.search && args.search.trim()) {
      const q = args.search.trim().toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.trackingId.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q) ||
          t.userEmail.toLowerCase().includes(q)
      );
    }
    tickets.sort((a, b) => b.updatedAt - a.updatedAt);
    return tickets;
  },
});

export const getSupportTicketDetail = query({
  args: { token: v.string(), ticketId: v.id("supportTickets") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    const messages = await ctx.db
      .query("ticketMessages")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", args.ticketId))
      .collect();
    messages.sort((a, b) => a.createdAt - b.createdAt);
    ticket.attachments = (await resolveAttachments(ctx, ticket.attachments)) as any;
    for (const m of messages) {
      m.attachments = (await resolveAttachments(ctx, m.attachments)) as any;
    }
    return { ticket, messages };
  },
});

export const updateTicketStatus = mutation({
  args: {
    token: v.string(),
    ticketId: v.id("supportTickets"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    if (!["open", "in_progress", "resolved", "closed"].includes(args.status)) {
      throw new Error("Invalid status");
    }
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    const previous = ticket.status;
    await ctx.db.patch(args.ticketId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "update_status",
      entityType: "supportTickets",
      entityId: ticket.trackingId,
      previousValue: previous,
      newValue: args.status,
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

export const adminReplyTicket = mutation({
  args: {
    token: v.string(),
    ticketId: v.id("supportTickets"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    const message = args.message.trim();
    if (message.length < 1) {
      throw new Error("Reply cannot be empty");
    }

    await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      sender: "admin",
      senderName: admin.name,
      message,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.ticketId, {
      status: ticket.status === "closed" ? "closed" : "in_progress",
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "reply",
      entityType: "supportTickets",
      entityId: ticket.trackingId,
      newValue: message.slice(0, 200),
      timestamp: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: ticket.userId,
      type: "support",
      title: `Support replied on ticket ${ticket.trackingId}`,
      message: message.slice(0, 150),
      read: false,
      actionUrl: `/dashboard/support/${args.ticketId.toString()}`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
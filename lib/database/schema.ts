import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgSchema, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const neonAuth = pgSchema("neon_auth");

export const authUser = neonAuth.table("user", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  role: text("role"), banned: boolean("banned"), banReason: text("banReason"),
  banExpires: timestamp("banExpires", { withTimezone: true, mode: "date" }),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  username: text("username"), displayName: text("display_name"), bio: text("bio"),
  githubUsername: text("github_username"), websiteUrl: text("website_url"),
  locale: text("locale").default("id").notNull(), timezone: text("timezone"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  unique("user_profiles_user_id_unique").on(table.userId),
  uniqueIndex("user_profiles_username_lower_unique").on(sql`lower(${table.username})`).where(sql`${table.username} is not null`),
  index("user_profiles_github_username_idx").on(table.githubUsername),
]);

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  requestId: text("request_id").notNull(), provider: text("provider").notNull(), model: text("model").notNull(),
  inputTokens: integer("input_tokens").default(0).notNull(), outputTokens: integer("output_tokens").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [unique("usage_events_request_id_unique").on(table.requestId), index("usage_events_user_created_idx").on(table.userId, table.createdAt)]);

export const announcements = pgTable("announcements", {
  id: uuid("id").defaultRandom().primaryKey().notNull(), slug: text("slug").notNull(),
  title: text("title").notNull(), excerpt: text("excerpt").notNull(), body: text("body").notNull(),
  status: text("status").default("draft").notNull(), pinned: boolean("pinned").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
  authorUserId: uuid("author_user_id").notNull().references(() => authUser.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [unique("announcements_slug_unique").on(table.slug), index("announcements_status_published_idx").on(table.status, table.publishedAt)]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  announcementId: uuid("announcement_id").references(() => announcements.id, { onDelete: "set null" }),
  type: text("type").default("system").notNull(), title: text("title").notNull(), body: text("body").notNull(),
  href: text("href"), readAt: timestamp("read_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [index("notifications_user_created_idx").on(table.userId, table.createdAt), index("notifications_user_unread_idx").on(table.userId, table.readAt)]);

export const adminMembers = pgTable("admin_members", {
  userId: uuid("user_id").primaryKey().notNull().references(() => authUser.id, { onDelete: "cascade" }),
  role: text("role").default("admin").notNull(),
  grantedBy: uuid("granted_by").references(() => authUser.id, { onDelete: "set null" }),
  grantedAt: timestamp("granted_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
}, (table) => [index("admin_members_active_idx").on(table.revokedAt)]);

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  actorUserId: uuid("actor_user_id").notNull().references(() => authUser.id, { onDelete: "restrict" }),
  action: text("action").notNull(),
  targetUserId: uuid("target_user_id").references(() => authUser.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [index("admin_audit_logs_actor_created_idx").on(table.actorUserId, table.createdAt)]);

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

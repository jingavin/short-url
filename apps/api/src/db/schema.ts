import { pgTable, text, timestamp, uuid, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    visitorId: uuid("visitor_id").notNull(),
    code: text("code").notNull(),
    longUrl: text("long_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    deleted: boolean("deleted").default(false).notNull(),
  },
  (t) => ({
    codeUnique: uniqueIndex("links_code_unique").on(t.code),
    codeIdx: index("links_code_idx").on(t.code),
    visitorIdx: index("links_visitor_idx").on(t.visitorId),
  })
);

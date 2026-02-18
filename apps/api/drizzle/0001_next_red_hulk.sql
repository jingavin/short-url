ALTER TABLE "links" ADD COLUMN "visitor_id" uuid NOT NULL;--> statement-breakpoint
CREATE INDEX "links_visitor_idx" ON "links" USING btree ("visitor_id");
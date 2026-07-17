ALTER TABLE "profiles" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "plan" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "renewal_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "subject" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "message" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "status" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");
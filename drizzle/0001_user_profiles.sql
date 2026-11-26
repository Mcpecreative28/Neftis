CREATE TABLE "public"."user_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "display_name" text,
  "locale" text DEFAULT 'id' NOT NULL,
  "timezone" text,
  "onboarding_completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id"),
  CONSTRAINT "user_profiles_user_id_neon_auth_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade
);

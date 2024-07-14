CREATE TABLE IF NOT EXISTS "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"parent_collection_id" integer,
	"order" double precision NOT NULL,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"url" text NOT NULL,
	"parent_collection_id" integer,
	"order" double precision NOT NULL,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

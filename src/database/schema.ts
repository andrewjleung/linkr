import { relations } from "drizzle-orm";
import {
	doublePrecision,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const links = pgTable("links", {
	id: serial("id").primaryKey(),
	title: text("title"),
	description: text("description"),
	url: text("url").notNull(),
	parentCollectionId: integer("parent_collection_id"),
	order: doublePrecision("order").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const collections = pgTable("collections", {
	id: serial("id").primaryKey(),
	name: text("name"),
	parentCollectionId: integer("parent_collection_id"),
	order: doublePrecision("order").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const collectionsRelations = relations(collections, ({ many }) => ({
	links: many(links),
	collections: many(collections),
}));

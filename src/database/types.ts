import { links, collections } from "./schema";

type Insert<T extends { createdAt: Date; updatedAt: Date }> = Omit<
  T,
  "createdAt" | "updatedAt" | "id"
>;

export type Link = typeof links.$inferSelect;
export type LinkInsert = Insert<Link>;

export type Collection = typeof collections.$inferSelect;
export type CollectionInsert = Insert<Collection>;

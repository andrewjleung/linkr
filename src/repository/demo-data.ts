import type { Collection, Link } from "@/database/types";
import { ORDER_BUFFER } from "@/lib/order";

export const COLLECTION_DATA: Collection[] = [
	{
		id: 1,
		parentCollectionId: null,
		deleted: false,
		order: 100,
		name: "Favorites",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

export const LINK_DATA: Link[] = [
	{
		parentCollectionId: null,
		title: "Personal Website",
		url: "https://andrewjleung.me",
		description: "My personal website/blog/portfolio!",
	},
	{
		parentCollectionId: null,
		title: "GitHub",
		url: "https://github.com/andrewjleung",
		description: null,
	},
	{
		parentCollectionId: null,
		title: "LinkedIn",
		url: "https://linkedin.com/in/andrewjleung-",
		description: null,
	},
	{
		parentCollectionId: null,
		title: "linkr",
		url: "https://linkr.wiki",
		description: null,
	},
	{
		parentCollectionId: 1,
		title: null,
		url: "https://google.com",
		description: null,
	},
	{
		parentCollectionId: 1,
		title: null,
		url: "https://neovim.org",
		description: null,
	},
].map((entry, i) => ({
	...entry,
	id: i + 1,
	order: (i + 1) * ORDER_BUFFER,
	deleted: false,
	createdAt: new Date(),
	updatedAt: new Date(),
}));

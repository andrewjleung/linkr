import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "linkr",
	description: "A home for your links.",
};

export default async function Home() {
	redirect("/collections/home");
}

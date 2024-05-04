import "./globals.css";

export const metadata = {
	title: "linkr",
	description: "a home for your links.",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen dark:bg-neutral-950">{children}</body>
		</html>
	);
}

"use client";

import { parseRaindropImport } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ImportedLink } from "@/services/import-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const fileSchema = z.instanceof(File, { message: "Required" });

const raindropImportFormSchema = z.object({
	file: fileSchema.refine(
		(file) => file.size > 0,
		"File size must be greater than 0",
	),
});

function ImportedLinks({ children }: { children: React.ReactNode }) {
	return <div>{children}</div>;
}

function ImportedLinkComponent({ link }: { link: ImportedLink }) {
	return <div>{link.url}</div>;
}

export default function ImportRaindropPage() {
	const [links, setLinks] = useState<ImportedLink[] | null>(null);
	const form = useForm<z.infer<typeof raindropImportFormSchema>>({
		resolver: zodResolver(raindropImportFormSchema),
	});

	async function onSubmit(values: z.infer<typeof raindropImportFormSchema>) {
		const ab = await values.file.arrayBuffer();
		const serialized = new TextDecoder().decode(ab);
		const importedLinks = await parseRaindropImport(serialized);
		setLinks(importedLinks);
	}

	if (links !== null) {
		return (
			<ImportedLinks>
				{links.map((l, i) => (
					<ImportedLinkComponent key={`imported-link-${i}`} link={l} />
				))}
			</ImportedLinks>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="file"
					render={({ field: { value, onChange, ...fieldProps } }) => (
						<FormItem>
							<FormLabel>File</FormLabel>
							<FormControl>
								<Input
									{...fieldProps}
									type="file"
									onChange={(event) => onChange(event.target.files?.[0])}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
}

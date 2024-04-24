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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const fileSchema = z.instanceof(File, { message: "Required" });

const raindropImportFormSchema = z.object({
	file: fileSchema.refine(
		(file) => file.size > 0,
		"File size must be greater than 0",
	),
});

export default function ImportRaindropPage() {
	const form = useForm<z.infer<typeof raindropImportFormSchema>>({
		resolver: zodResolver(raindropImportFormSchema),
	});

	async function onSubmit(values: z.infer<typeof raindropImportFormSchema>) {
		const ab = await values.file.arrayBuffer();
		const serialized = new TextDecoder().decode(ab);
		console.log(parseRaindropImport(serialized));
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

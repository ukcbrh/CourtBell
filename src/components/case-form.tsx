"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCases } from "@/hooks/use-cases";
import type { Case } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  clientName: z.string().min(2, "Client name must be at least 2 characters."),
  caseNumber: z.string().min(1, "Case number is required."),
  court: z.string().min(2, "Court name is required."),
  date: z.date({ required_error: "A date is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  notes: z.string().optional(),
});

type CaseFormValues = z.infer<typeof formSchema>;

interface CaseFormProps {
  initialData?: Case;
}

export function CaseForm({ initialData }: CaseFormProps) {
  const router = useRouter();
  const { addCase, updateCase } = useCases();
  const { toast } = useToast();

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          date: new Date(initialData.date),
        }
      : {
          title: "",
          clientName: "",
          caseNumber: "",
          court: "",
          time: "09:00",
          notes: "",
        },
  });

  const onSubmit = (values: CaseFormValues) => {
    const caseData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
    };

    if (initialData) {
      updateCase({ ...caseData, id: initialData.id });
      toast({ title: "Case Updated", description: `The case "${values.title}" has been successfully updated.` });
    } else {
      addCase(caseData);
      toast({ title: "Case Added", description: `The case "${values.title}" has been successfully added.` });
    }
    router.push("/");
    router.refresh(); // To reflect changes on the dashboard
  };

  return (
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle className="font-headline">{initialData ? "Edit Case" : "Add a New Case"}</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Case Title</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., State vs. John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="caseNumber"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Case Number</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., CR-2024-12345" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="court"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Court</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., High Court of Justice" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                            <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Add any relevant notes for the case..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/')}>Cancel</Button>
                    <Button type="submit">{initialData ? "Save Changes" : "Add Case"}</Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>

  );
}

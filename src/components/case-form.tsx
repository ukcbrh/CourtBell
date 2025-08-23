"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCases, useClients, useJuniors } from "@/hooks/use-cases";
import type { Case, Hearing, Expense } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  clientId: z.string().min(1, "Please select a client."),
  caseNumber: z.string().min(1, "Case number is required."),
  court: z.string().min(2, "Court name is required."),
  date: z.date({ required_error: "A date is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  notes: z.string().optional(),
  juniorId: z.string().optional(),
  history: z.array(z.object({
    date: z.string(),
    notes: z.string(),
  })).optional(),
  expenses: z.array(z.object({
      description: z.string(),
      amount: z.number(),
  })).optional(),
});

type CaseFormValues = z.infer<typeof formSchema>;

interface CaseFormProps {
  initialData?: Case;
}

export function CaseForm({ initialData }: CaseFormProps) {
  const router = useRouter();
  const { addCase, updateCase } = useCases();
  const { clients, isLoaded: clientsLoaded } = useClients();
  const { juniors, isLoaded: juniorsLoaded } = useJuniors();
  const { toast } = useToast();
  const [history, setHistory] = useState<Hearing[]>(initialData?.history || []);
  const [expenses, setExpenses] = useState<Expense[]>(initialData?.expenses || []);
  
  const [newHearingDate, setNewHearingDate] = useState<Date | undefined>(new Date());
  const [newHearingNotes, setNewHearingNotes] = useState('');

  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');


  const form = useForm<CaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          date: new Date(initialData.date),
        }
      : {
          title: "",
          clientId: "",
          caseNumber: "",
          court: "",
          time: "09:00",
          notes: "",
          juniorId: "",
          history: [],
          expenses: [],
        },
  });

  const onSubmit = (values: CaseFormValues) => {
    const caseData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
      history: history,
      expenses: expenses,
    };

    if (initialData) {
      updateCase({ ...caseData, id: initialData.id });
      toast({ title: "Case Updated", description: `The case "${values.title}" has been successfully updated.` });
    } else {
      addCase(caseData);
      toast({ title: "Case Added", description: `The case "${values.title}" has been successfully added.` });
    }
    router.push("/");
    router.refresh();
  };
  
  const addHearing = () => {
    if (!newHearingDate || !newHearingNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a date and notes for the hearing.",
        variant: "destructive",
      });
      return;
    }
    const newHearing: Hearing = {
      date: format(newHearingDate, "yyyy-MM-dd"),
      notes: newHearingNotes.trim(),
    };
    setHistory(prev => [...prev, newHearing].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setNewHearingDate(new Date());
    setNewHearingNotes('');
  };

  const deleteHearing = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  }
  
  const addExpense = () => {
    const amount = parseFloat(newExpenseAmount);
    if (!newExpenseDesc.trim() || isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please provide a valid description and a positive amount for the expense.",
        variant: "destructive",
      });
      return;
    }
    const newExpense: Expense = {
        description: newExpenseDesc.trim(),
        amount: amount,
    };
    setExpenses(prev => [...prev, newExpense]);
    setNewExpenseDesc('');
    setNewExpenseAmount('');
  }

  const deleteExpense = (index: number) => {
    setExpenses(prev => prev.filter((_, i) => i !== index));
  }

  if (!clientsLoaded || !juniorsLoaded) {
    return <div>Loading...</div>
  }

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
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="juniorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Junior Advocate (Optional)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a junior advocate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {juniors.map(junior => (
                                <SelectItem key={junior.id} value={junior.id}>{junior.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            <FormLabel>Next Hearing Date</FormLabel>
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
                        <FormLabel>Case Notes</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Add any relevant notes for the case..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Separator />
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-medium font-headline mb-4">Case History</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    <FormLabel htmlFor="hearing-date">Hearing Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="hearing-date"
                                                variant={"outline"}
                                                className={cn(
                                                "w-full sm:w-[240px] justify-start text-left font-normal",
                                                !newHearingDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newHearingDate ? format(newHearingDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                            mode="single"
                                            selected={newHearingDate}
                                            onSelect={setNewHearingDate}
                                            initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            <div className="w-full">
                                <FormLabel htmlFor="hearing-notes">Hearing Notes</FormLabel>
                                <Textarea 
                                    id="hearing-notes"
                                    placeholder="Add notes for this hearing..." 
                                    value={newHearingNotes} 
                                    onChange={(e) => setNewHearingNotes(e.target.value)}
                                    rows={2}
                                />
                            </div>
                            </div>
                            <Button type="button" size="sm" onClick={addHearing}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Hearing Note
                            </Button>
                        </div>

                        {history.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <h4 className="font-semibold">Previous Hearings:</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-4">
                                    {history.map((h, index) => (
                                        <div key={index} className="flex items-start justify-between p-3 rounded-lg border bg-muted/50">
                                        <div>
                                                <p className="font-bold">{format(new Date(h.date), "PPP")}</p>
                                                <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{h.notes}</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => deleteHearing(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-medium font-headline mb-4">Case Expenses</h3>
                         <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                               <div className="w-full">
                                 <FormLabel htmlFor="expense-desc">Expense Description</FormLabel>
                                 <Input 
                                    id="expense-desc"
                                    placeholder="e.g., Court Fees" 
                                    value={newExpenseDesc} 
                                    onChange={(e) => setNewExpenseDesc(e.target.value)}
                                 />
                               </div>
                                <div className="w-full sm:w-48">
                                    <FormLabel htmlFor="expense-amount">Amount (₹)</FormLabel>
                                    <Input
                                        id="expense-amount"
                                        type="number"
                                        placeholder="e.g., 500"
                                        value={newExpenseAmount}
                                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button type="button" size="sm" onClick={addExpense}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Expense
                            </Button>
                        </div>
                        
                        {expenses.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <h4 className="font-semibold">Recorded Expenses:</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-4">
                                    {expenses.map((e, index) => (
                                        <div key={index} className="flex items-start justify-between p-3 rounded-lg border bg-muted/50">
                                        <div>
                                                <p className="font-bold">{e.description}</p>
                                                <p className="text-muted-foreground mt-1">₹{e.amount}</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => deleteExpense(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.push('/')}>Cancel</Button>
                    <Button type="submit">{initialData ? "Save Changes" : "Add Case"}</Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>

  );
}

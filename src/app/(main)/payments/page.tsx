
"use client";

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions, useClients, useJuniors } from '@/hooks/use-cases';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const transactionSchema = z.object({
  type: z.enum(['in', 'out']),
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  relatedToType: z.enum(['client', 'junior', 'other']),
  relatedToId: z.string().min(1, "Please select an item."),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function PaymentsPage() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { clients } = useClients();
  const { juniors } = useJuniors();
  const { toast } = useToast();

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'in', relatedToType: 'client' },
  });

  const selectedType = watch('type');
  const relatedToType = watch('relatedToType');

  const onSubmit = (values: TransactionFormValues) => {
    let relatedName = 'Other';
    if (values.relatedToType === 'client') {
      relatedName = clients.find(c => c.id === values.relatedToId)?.name || 'Unknown Client';
    } else if (values.relatedToType === 'junior') {
      relatedName = juniors.find(j => j.id === values.relatedToId)?.name || 'Unknown Junior';
    }

    addTransaction({
      type: values.type,
      description: values.description,
      amount: values.amount,
      date: new Date().toISOString(),
      relatedTo: {
        type: values.relatedToType,
        id: values.relatedToId,
        name: relatedName,
      }
    });

    toast({ title: 'Transaction Added', description: 'The transaction has been successfully recorded.' });
    reset({ type: 'in', relatedToType: 'client', description: '', amount: 0 });
  };
  
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalOutcome = useMemo(() => transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const netBalance = totalIncome - totalOutcome;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Income" value={totalIncome} icon={ArrowDownCircle} className="text-green-600" />
        <StatCard title="Total Outcome" value={totalOutcome} icon={ArrowUpCircle} className="text-red-600" />
        <StatCard title="Net Balance" value={netBalance} className={netBalance >= 0 ? 'text-gray-600' : 'text-red-600'} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
          <CardDescription>Record a new payment received or made.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
               <Controller
                name="type"
                control={control}
                render={({ field }) => (
                   <div className="space-y-2">
                    <label>Type</label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="in">Payment In (from Client)</SelectItem>
                        <SelectItem value="out">Payment Out (to Junior/Expense)</SelectItem>
                        </SelectContent>
                    </Select>
                   </div>
                )}
                />

              <Controller
                name="relatedToType"
                control={control}
                render={({ field }) => (
                   <div className="space-y-2">
                    <label>Related To</label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="junior">Junior Advocate</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                   </div>
                )}
                />
            
            {relatedToType !== 'other' && (
                <Controller
                    name="relatedToId"
                    control={control}
                    render={({ field }) => (
                       <div className="space-y-2">
                        <label>{relatedToType === 'client' ? 'Select Client' : 'Select Junior'}</label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                            {(relatedToType === 'client' ? clients : juniors).map(item => (
                                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        {errors.relatedToId && <p className="text-sm text-destructive">{errors.relatedToId.message}</p>}
                       </div>
                    )}
                />
            )}
             
             {relatedToType === 'other' && (
                <div className="space-y-2">
                    <label>Related To ID</label>
                    <Input {...register('relatedToId')} value="other" readOnly/>
                </div>
             )}

              <div className="space-y-2">
                <label>Description</label>
                <Input {...register('description')} placeholder="e.g., Advance for case fees" />
                 {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <label>Amount (₹)</label>
                <Input {...register('amount')} type="number" step="0.01" placeholder="e.g., 5000" />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
            </div>
            
            <Button type="submit">
              <PlusCircle className="mr-2" /> Add Transaction
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="in">Payments In</TabsTrigger>
                    <TabsTrigger value="out">Payments Out</TabsTrigger>
                </TabsList>
                <TabsContent value="all"><TransactionList transactions={transactions} deleteTransaction={deleteTransaction}/></TabsContent>
                <TabsContent value="in"><TransactionList transactions={transactions.filter(t=>t.type === 'in')} deleteTransaction={deleteTransaction}/></TabsContent>
                <TabsContent value="out"><TransactionList transactions={transactions.filter(t=>t.type === 'out')} deleteTransaction={deleteTransaction}/></TabsContent>
            </Tabs>
        </CardContent>
      </Card>

    </div>
  );
}


const StatCard = ({ title, value, icon: Icon, className }: { title: string, value: number, icon?: React.ElementType, className?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 text-muted-foreground ${className}`} />}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>₹{value.toLocaleString()}</div>
      </CardContent>
    </Card>
);

const TransactionList = ({ transactions, deleteTransaction }: { transactions: Transaction[], deleteTransaction: (id: string) => void }) => {
    if (transactions.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No transactions found.</p>
    }
    return (
         <div className="space-y-4 mt-4">
            {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                    <div className="flex items-center gap-4">
                        {t.type === 'in' ? <ArrowDownCircle className="h-6 w-6 text-green-500" /> : <ArrowUpCircle className="h-6 w-6 text-red-500" />}
                        <div>
                            <p className="font-semibold">{t.description}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(t.date), 'PPP')} &bull; {t.relatedTo.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className={`font-bold ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'in' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                        </p>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost"><Trash2 className="text-destructive" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the transaction. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteTransaction(t.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            ))}
        </div>
    )
}

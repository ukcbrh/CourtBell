"use client";

import type { Case, Client, Junior } from "@/lib/types";
import { format } from "date-fns";
import { Calendar, Clock, Edit, MoreVertical, Trash2, User, Landmark, CaseSensitive, Share2, Briefcase, Home, Phone, Receipt } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { useRouter } from "next/navigation";
import { useCases, useClients, useJuniors } from "@/hooks/use-cases";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

interface CaseCardProps {
  caseItem: Case;
}

export function CaseCard({ caseItem }: CaseCardProps) {
  const router = useRouter();
  const { deleteCase } = useCases();
  const { getClientById } = useClients();
  const { getJuniorById } = useJuniors();
  const { toast } = useToast();

  const client = useMemo(() => getClientById(caseItem.clientId), [getClientById, caseItem.clientId]);
  const junior = useMemo(() => getJuniorById(caseItem.juniorId || null), [getJuniorById, caseItem.juniorId]);


  const handleEdit = () => {
    router.push(`/schedule/${caseItem.id}/edit`);
  };

  const handleDelete = () => {
    deleteCase(caseItem.id);
    toast({ title: "Case Deleted", description: `The case "${caseItem.title}" has been deleted.` });
  };
  
  const generateShareText = () => {
    if (!client) return "Client not found";
    let historyText = "No past hearings recorded.";
    if (caseItem.history && caseItem.history.length > 0) {
        historyText = caseItem.history
            .map(h => ` - ${format(new Date(h.date), "PPP")}: ${h.notes}`)
            .join('\n');
    }

    let expensesText = "No expenses recorded.";
    let totalExpenses = 0;
    if (caseItem.expenses && caseItem.expenses.length > 0) {
        expensesText = caseItem.expenses
            .map(e => ` - ${e.description}: ₹${e.amount}`)
            .join('\n');
        totalExpenses = caseItem.expenses.reduce((sum, e) => sum + e.amount, 0);
    }
    
    return `
*Case Details:*
- *Title:* ${caseItem.title}
- *Client:* ${client.name}
- *Case Number:* ${caseItem.caseNumber}
- *Court:* ${caseItem.court}
- *Next Hearing:* ${format(new Date(caseItem.date), "PPP")} at ${format(new Date(`1970-01-01T${caseItem.time}`), "p")}
${junior ? `- *Junior Advocate:* ${junior.name}` : ''}
- *Case Notes:* ${caseItem.notes || 'N/A'}

---
*Case History:*
${historyText}

---
*Expenses:*
${expensesText}
*Total Expenses: ₹${totalExpenses}*
    `.trim();
  }

  const handleShare = async () => {
    const shareText = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Case: ${caseItem.title}`,
          text: shareText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({ title: "Copied to Clipboard", description: "Case details and expenses copied successfully." });
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast({ title: "Error", description: "Could not copy case details.", variant: "destructive" });
      }
    }
  };

  const handleShareToWhatsapp = () => {
    if (!client?.phone) {
        toast({ title: "No Phone Number", description: "Client's phone number is not available.", variant: "destructive" });
        return;
    }
    const shareText = generateShareText();
    const whatsappUrl = `https://wa.me/${client.phone}?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  }

  if (!client) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>Invalid Case Data</CardTitle>
          <CardDescription>Client not found for this case.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isPast = new Date(caseItem.date + 'T' + caseItem.time) < new Date();
  const latestHearing = caseItem.history?.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const totalExpenses = caseItem.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  return (
    <Card className={`transition-all flex flex-col ${isPast ? "opacity-60 hover:opacity-100" : "border-primary/20 shadow-lg shadow-primary/5"}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="font-headline text-lg">{caseItem.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <User className="h-4 w-4" /> {client.name}
                </CardDescription>
            </div>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleShareToWhatsapp} disabled={!client.phone}>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.41.4.86.4 1.36 0 2.13-1.73 3.86-3.86 3.86h-1.3c-1.32 0-2.52-.67-3.23-1.71L8.5 17l-1.63 2.45c-.4.6-1.09.95-1.82.95H3.6c-.66 0-1.2-.54-1.2-1.2 0-.39.19-.74.49-1.01l3.52-3.15c.34-.3.55-.74.55-1.21v-2.7c0-2.07 1.68-3.75 3.75-3.75h1.3c2.07 0 3.75 1.68 3.75 3.75 0 .84-.28 1.61-.75 2.21zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        <span>Send to Client</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the case titled "{caseItem.title}".
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 flex-grow">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Landmark className="h-4 w-4 text-primary" />
          <span>{caseItem.court}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CaseSensitive className="h-4 w-4 text-primary" />
          <span>{caseItem.caseNumber}</span>
        </div>
         {client.address && (
            <div className="flex items-start gap-2 text-muted-foreground col-span-1 sm:col-span-2">
                <Home className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span>{client.address}</span>
            </div>
        )}
        {client.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>{client.phone}</span>
            </div>
        )}
        {junior && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-1">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{junior.name}</span>
            </div>
        )}
        {caseItem.notes && (
            <p className="col-span-1 sm:col-span-2 text-sm text-foreground bg-secondary/50 p-3 rounded-md border">{caseItem.notes}</p>
        )}
        {latestHearing && (
             <div className="col-span-1 sm:col-span-2 space-y-2">
                <p className="font-semibold text-sm">Last Hearing ({format(new Date(latestHearing.date), "PPP")}):</p>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border border-dashed truncate">
                   {latestHearing.notes}
                </p>
            </div>
        )}
        {totalExpenses > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground font-semibold col-span-1 sm:col-span-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span>Total Expenses: ₹{totalExpenses.toLocaleString()}</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between flex-wrap gap-2">
         <Badge variant={isPast ? "secondary" : "default"}>{isPast ? "Completed" : "Upcoming"}</Badge>
        <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span>{format(new Date(caseItem.date), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <span>{format(new Date(`1970-01-01T${caseItem.time}`), "p")}</span>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}

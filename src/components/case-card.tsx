"use client";

import type { Case } from "@/lib/types";
import { format } from "date-fns";
import { Calendar, Clock, Edit, MoreVertical, Trash2, User, Landmark, CaseSensitive, Share2, Briefcase } from "lucide-react";
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
import { useCases } from "@/hooks/use-cases";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CaseCardProps {
  caseItem: Case;
}

export function CaseCard({ caseItem }: CaseCardProps) {
  const router = useRouter();
  const { deleteCase } = useCases();
  const { toast } = useToast();

  const handleEdit = () => {
    router.push(`/schedule/${caseItem.id}/edit`);
  };

  const handleDelete = () => {
    deleteCase(caseItem.id);
  };
  
  const handleShare = async () => {
    const latestHearing = caseItem.history && caseItem.history.length > 0 ? caseItem.history[0] : null;
    const shareText = `
Case Details:
- Title: ${caseItem.title}
- Client: ${caseItem.clientName}
- Case Number: ${caseItem.caseNumber}
- Court: ${caseItem.court}
- Next Hearing: ${format(new Date(caseItem.date), "PPP")} at ${format(new Date(`1970-01-01T${caseItem.time}`), "p")}
${caseItem.juniorAdvocate ? `- Junior Advocate: ${caseItem.juniorAdvocate}` : ''}
- Case Notes: ${caseItem.notes || 'N/A'}
---
Last Hearing (${latestHearing ? format(new Date(latestHearing.date), "PPP") : 'N/A'}):
${latestHearing ? latestHearing.notes : 'No past hearings recorded.'}
    `.trim();

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
        toast({ title: "Copied to Clipboard", description: "Case details copied successfully." });
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast({ title: "Error", description: "Could not copy case details.", variant: "destructive" });
      }
    }
  };

  const isPast = new Date(caseItem.date + 'T' + caseItem.time) < new Date();
  const latestHearing = caseItem.history?.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];


  return (
    <Card className={`transition-all flex flex-col ${isPast ? "opacity-60 hover:opacity-100" : "border-primary/20 shadow-lg shadow-primary/5"}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="font-headline text-lg">{caseItem.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <User className="h-4 w-4" /> {caseItem.clientName}
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
                        <span>Share</span>
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
        {caseItem.juniorAdvocate && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-1 sm:col-span-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{caseItem.juniorAdvocate}</span>
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

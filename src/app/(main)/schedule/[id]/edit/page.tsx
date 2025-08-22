"use client";

import { useParams } from "next/navigation";
import { CaseForm } from "@/components/case-form";
import { useCases } from "@/hooks/use-cases";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditCasePage() {
  const params = useParams();
  const { getCaseById, isLoaded } = useCases();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const caseItem = getCaseById(id);

  if (!isLoaded) {
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </CardContent>
        </Card>
    )
  }

  if (!caseItem) {
    return (
        <div className="text-center py-16">
            <h2 className="text-xl font-semibold">Case not found</h2>
            <p className="text-muted-foreground">The case you are trying to edit does not exist.</p>
        </div>
    );
  }

  return <CaseForm initialData={caseItem} />;
}

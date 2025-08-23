"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCases } from '@/hooks/use-cases';
import { CaseCard } from '@/components/case-card';
import { PlusCircle, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { cases } = useCases();

  const upcomingCases = cases
    .filter(c => new Date(c.date + 'T' + c.time) >= new Date())
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

  const pastCases = cases
    .filter(c => new Date(c.date + 'T' + c.time) < new Date())
    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Upcoming Cases</h1>
          <p className="text-muted-foreground">Here's a list of your upcoming court dates and deadlines.</p>
        </div>
        <Link href="/schedule/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Case
          </Button>
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
           <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
                 <FileText className="h-10 w-10 text-primary" />
            </div>
           </div>
          <h2 className="text-xl font-semibold mb-2">No cases yet</h2>
          <p className="text-muted-foreground mb-4">Get started by adding your first case.</p>
          <Link href="/schedule/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Case
            </Button>
          </Link>
        </div>
      ) : (
        <>
            {upcomingCases.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingCases.map(caseItem => (
                        <CaseCard key={caseItem.id} caseItem={caseItem} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">All caught up!</h2>
                    <p className="text-muted-foreground">You have no upcoming cases.</p>
                </div>
            )}
            
            {pastCases.length > 0 && (
                <div className="space-y-6 pt-8">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight font-headline">Past Cases</h2>
                        <p className="text-muted-foreground">A record of your previously scheduled cases.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pastCases.map(caseItem => (
                        <CaseCard key={caseItem.id} caseItem={caseItem} />
                        ))}
                    </div>
                </div>
            )}
        </>
      )}
    </div>
  );
}

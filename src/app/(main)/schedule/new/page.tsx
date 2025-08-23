"use client";

import { CaseForm } from "@/components/case-form";
import { useClients } from "@/hooks/use-cases";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewCasePage() {
  const { clients, isLoaded } = useClients();

  if (isLoaded && clients.length === 0) {
    return (
       <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No Clients Found</h2>
          <p className="text-muted-foreground mb-4">You must add a client before you can create a case.</p>
          <Link href="/clients" passHref>
            <Button>
              Add Your First Client
            </Button>
          </Link>
        </div>
    )
  }
  
  return <CaseForm />;
}

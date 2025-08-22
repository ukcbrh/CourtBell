"use client";

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { suggestLegalTools, type SuggestLegalToolsOutput } from '@/ai/flows/suggest-legal-tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Gavel, BookOpen, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  caseDetails: z.string().min(20, 'Please provide more details about the case (at least 20 characters).'),
});

export default function LegalToolsPage() {
  const [result, setResult] = useState<SuggestLegalToolsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseDetails: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const aiResult = await suggestLegalTools(values);
      setResult(aiResult);
    } catch (err) {
      setError('An error occurred while suggesting tools. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Legal Tool Suggester</CardTitle>
          <CardDescription>
            Describe your case, and our AI assistant will suggest relevant statutes, case law, and document templates to help you get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="caseDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Details</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Describe the case type, jurisdiction, and key issues. For example: 'A civil litigation case in California concerning a breach of contract for a software development project...'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4 animate-pulse" />
                    Suggesting Tools...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Suggest Legal Tools
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
         <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && <LoadingSkeleton />}
      
      {result && (
        <div className="space-y-6">
            <ResultCard icon={Gavel} title="Suggested Statutes" items={result.suggestedStatutes} />
            <ResultCard icon={BookOpen} title="Suggested Case Law" items={result.suggestedCaseLaw} />
            <ResultCard icon={FileText} title="Suggested Templates" items={result.suggestedTemplates} />
        </div>
      )}
    </div>
  );
}

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
        </Card>
    </div>
)

const ResultCard = ({ icon: Icon, title, items }: { icon: React.ElementType, title: string, items: string[] }) => {
    if (!items || items.length === 0) return null;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-headline">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    {items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}

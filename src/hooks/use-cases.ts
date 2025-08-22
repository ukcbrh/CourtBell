"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Case } from '@/lib/types';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'courtbell-cases';

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedCases = localStorage.getItem(STORAGE_KEY);
      if (storedCases) {
        setCases(JSON.parse(storedCases));
      }
    } catch (error) {
      console.error("Failed to load cases from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const syncToStorage = (updatedCases: Case[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCases));
    } catch (error) {
      console.error("Failed to save cases to localStorage", error);
    }
  };

  const addCase = useCallback((newCase: Omit<Case, 'id'>) => {
    const fullCase = { ...newCase, id: new Date().toISOString() };
    setCases(prevCases => {
      const updatedCases = [...prevCases, fullCase];
      syncToStorage(updatedCases);
      return updatedCases;
    });
    return fullCase;
  }, []);
  
  const getCaseById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return cases.find(c => c.id === id);
  }, [cases]);

  const updateCase = useCallback((updatedCase: Case) => {
    setCases(prevCases => {
      const updatedCases = prevCases.map(c => c.id === updatedCase.id ? updatedCase : c);
      syncToStorage(updatedCases);
      return updatedCases;
    });
  }, []);

  const deleteCase = useCallback((id: string) => {
    setCases(prevCases => {
      const updatedCases = prevCases.filter(c => c.id !== id);
      syncToStorage(updatedCases);
      return updatedCases;
    });
    router.push('/');
  }, [router]);

  return { cases, addCase, getCaseById, updateCase, deleteCase, isLoaded };
}


"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Case, Client, Junior, Transaction } from '@/lib/types';
import { useRouter } from 'next/navigation';

const CASES_STORAGE_KEY = 'courtbell-cases';
const CLIENTS_STORAGE_KEY = 'courtbell-clients';
const JUNIORS_STORAGE_KEY = 'courtbell-juniors';
const TRANSACTIONS_STORAGE_KEY = 'courtbell-transactions';


// Generic hook for localStorage management
function useLocalStorage<T>(key: string, initialValue: T[]): [T[], (value: T[]) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T[]>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = (value: T[]) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue, isLoaded];
}


export function useCases() {
  const [cases, setCases, isCasesLoaded] = useLocalStorage<Case>(CASES_STORAGE_KEY, []);
  
  const addCase = useCallback((newCase: Omit<Case, 'id'>) => {
    const fullCase = { ...newCase, id: new Date().toISOString() };
    setCases([...cases, fullCase]);
    return fullCase;
  }, [cases, setCases]);

  const getCaseById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return cases.find(c => c.id === id);
  }, [cases]);

  const updateCase = useCallback((updatedCase: Case) => {
    setCases(cases.map(c => c.id === updatedCase.id ? updatedCase : c));
  }, [cases, setCases]);

  const deleteCase = useCallback((id: string) => {
    setCases(cases.filter(c => c.id !== id));
  }, [cases, setCases]);

  return { cases, addCase, getCaseById, updateCase, deleteCase, isLoaded: isCasesLoaded };
}


export function useClients() {
  const [clients, setClients, isClientsLoaded] = useLocalStorage<Client>(CLIENTS_STORAGE_KEY, []);

  const addClient = useCallback((client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: new Date().toISOString() };
    setClients([...clients, newClient]);
    return newClient;
  }, [clients, setClients]);

  const getClientById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return clients.find(c => c.id === id);
  }, [clients]);

  const updateClient = useCallback((updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  }, [clients, setClients]);
  
  const deleteClient = useCallback((id: string) => {
    setClients(clients.filter(c => c.id !== id));
  }, [clients, setClients]);

  return { clients, addClient, getClientById, updateClient, deleteClient, isLoaded: isClientsLoaded };
}

export function useJuniors() {
  const [juniors, setJuniors, isJuniorsLoaded] = useLocalStorage<Junior>(JUNIORS_STORAGE_KEY, []);

  const addJunior = useCallback((junior: Omit<Junior, 'id'>) => {
    const newJunior = { ...junior, id: new Date().toISOString() };
    setJuniors([...juniors, newJunior]);
    return newJunior;
  }, [juniors, setJuniors]);

  const getJuniorById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return juniors.find(j => j.id === id);
  }, [juniors]);

  const updateJunior = useCallback((updatedJunior: Junior) => {
     setJuniors(juniors.map(j => j.id === updatedJunior.id ? updatedJunior : j));
  }, [juniors, setJuniors]);

  const deleteJunior = useCallback((id: string) => {
    setJuniors(juniors.filter(j => j.id !== id));
  }, [juniors, setJuniors]);

  return { juniors, addJunior, getJuniorById, updateJunior, deleteJunior, isLoaded: isJuniorsLoaded };
}


export function useTransactions() {
  const [transactions, setTransactions, isLoaded] = useLocalStorage<Transaction>(TRANSACTIONS_STORAGE_KEY, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: new Date().toISOString() };
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return newTransaction;
  }, [setTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  return { transactions, addTransaction, deleteTransaction, isLoaded };
}

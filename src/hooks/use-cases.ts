
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Case, Client, Junior, Transaction } from '@/lib/types';
import { useAuth } from './use-auth';

// Generic hook for Local Storage collection management
function useLocalStorageCollection<T extends { id: string }>(collectionName: string) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getStorageKey = useCallback(() => {
    if (!user) return null;
    return `${collectionName}_${user.uid}`;
  }, [user, collectionName]);

  useEffect(() => {
    if (typeof window === 'undefined' || !user) {
        setIsLoaded(true);
        return;
    }
    
    const storageKey = getStorageKey();
    if (!storageKey) {
        setIsLoaded(true);
        return;
    };

    try {
        const item = window.localStorage.getItem(storageKey);
        if (item) {
            setData(JSON.parse(item));
        }
    } catch (error) {
        console.error(`Error reading ${collectionName} from localStorage:`, error);
        setData([]);
    }
    setIsLoaded(true);

  }, [user, getStorageKey, collectionName]);

  const persistData = (newData: T[]) => {
     if (typeof window === 'undefined' || !user) return;
     const storageKey = getStorageKey();
     if (!storageKey) return;
     try {
        window.localStorage.setItem(storageKey, JSON.stringify(newData));
     } catch (error) {
        console.error(`Error writing ${collectionName} to localStorage:`, error);
     }
  };
  
  const addItem = useCallback(async (item: Omit<T, 'id'>) => {
    if (!user) throw new Error("User not authenticated");
    const newItem = { ...item, id: new Date().toISOString() } as T;
    setData(prevData => {
        const updatedData = [...prevData, newItem];
        persistData(updatedData);
        return updatedData;
    });
    return newItem;
  }, [user, getStorageKey]);
  
  const updateItem = useCallback(async (id: string, updatedItem: Partial<Omit<T, 'id'>>) => {
     if (!user) throw new Error("User not authenticated");
     setData(prevData => {
         const newData = prevData.map(item => item.id === id ? { ...item, ...updatedItem } : item);
         persistData(newData);
         return newData;
     });
  }, [user, getStorageKey]);

  const deleteItem = useCallback(async (id: string) => {
     if (!user) throw new Error("User not authenticated");
     setData(prevData => {
        const newData = prevData.filter(item => item.id !== id);
        persistData(newData);
        return newData;
     });
  }, [user, getStorageKey]);

  const getItemById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return data.find(item => item.id === id);
  }, [data]);

  return { data, isLoaded, addItem, updateItem, deleteItem, getItemById };
}


export function useCases() {
  const { data: cases, isLoaded, addItem, updateItem, deleteItem, getItemById } = useLocalStorageCollection<Case>('cases');
  
  const addCase = useCallback(async (newCase: Omit<Case, 'id'>) => {
    return await addItem(newCase);
  }, [addItem]);

  const updateCase = useCallback(async (updatedCase: Case) => {
    const { id, ...data } = updatedCase;
    await updateItem(id, data);
  }, [updateItem]);

  const deleteCase = useCallback(async (id: string) => {
    await deleteItem(id);
  }, [deleteItem]);

  return { cases, addCase, getCaseById: getItemById, updateCase, deleteCase, isLoaded };
}


export function useClients() {
  const { data: clients, isLoaded, addItem, updateItem, deleteItem, getItemById } = useLocalStorageCollection<Client>('clients');
 
  const addClient = useCallback(async (client: Omit<Client, 'id'>) => {
    return await addItem(client);
  }, [addItem]);

  const updateClient = useCallback(async (updatedClient: Client) => {
     const { id, ...data } = updatedClient;
     await updateItem(id, data);
  }, [updateItem]);
  
  const deleteClient = useCallback(async (id: string) => {
    await deleteItem(id);
  }, [deleteItem]);

  return { clients, addClient, getClientById: getItemById, updateClient, deleteClient, isLoaded };
}

export function useJuniors() {
   const { data: juniors, isLoaded, addItem, updateItem, deleteItem, getItemById } = useLocalStorageCollection<Junior>('juniors');

  const addJunior = useCallback(async (junior: Omit<Junior, 'id'>) => {
    return await addItem(junior);
  }, [addItem]);

  const updateJunior = useCallback(async (updatedJunior: Junior) => {
     const { id, ...data } = updatedJunior;
     await updateItem(id, data);
  }, [updateItem]);

  const deleteJunior = useCallback(async (id: string) => {
    await deleteItem(id);
  }, [deleteItem]);

  return { juniors, addJunior, getJuniorById: getItemById, updateJunior, deleteJunior, isLoaded };
}


export function useTransactions() {
  const { data: transactions, isLoaded, addItem, deleteItem } = useLocalStorageCollection<Transaction>('transactions');

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date' | 'uid'>) => {
    const newTransaction = { ...transaction, date: new Date().toISOString() };
    // Sorting logic is handled by adding new items to the end and component will re-render
    return await addItem(newTransaction as Omit<Transaction, 'id'>);
  }, [addItem]);

  const deleteTransaction = useCallback(async (id: string) => {
    await deleteItem(id);
  }, [deleteItem]);
  
  const sortedTransactions = [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { transactions: sortedTransactions, addTransaction, deleteTransaction, isLoaded };
}

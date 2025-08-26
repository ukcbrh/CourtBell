
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Case, Client, Junior, Transaction } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';


// Generic hook for Firestore collection management
function useFirestoreCollection<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: T[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        // Convert Firestore Timestamps to strings
        Object.keys(docData).forEach(key => {
          if (docData[key] instanceof Timestamp) {
            docData[key] = docData[key].toDate().toISOString();
          }
        });
        items.push({ id: doc.id, ...docData } as T);
      });
      setData(items);
      setIsLoaded(true);
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [collectionName]);
  
  const addItem = useCallback(async (item: Omit<T, 'id'>) => {
    const docRef = await addDoc(collection(db, collectionName), item);
    return { ...item, id: docRef.id } as T;
  }, [collectionName]);
  
  const updateItem = useCallback(async (id: string, updatedItem: Partial<Omit<T, 'id'>>) => {
     const docRef = doc(db, collectionName, id);
     await updateDoc(docRef, updatedItem);
  }, [collectionName]);

  const deleteItem = useCallback(async (id: string) => {
     const docRef = doc(db, collectionName, id);
     await deleteDoc(docRef);
  }, [collectionName]);

  const getItemById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return data.find(item => item.id === id);
  }, [data]);

  return { data, isLoaded, addItem, updateItem, deleteItem, getItemById };
}


export function useCases() {
  const { data: cases, isLoaded, addItem, updateItem, deleteItem, getItemById } = useFirestoreCollection<Case>('cases');
  
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
  const { data: clients, isLoaded, addItem, updateItem, deleteItem, getItemById } = useFirestoreCollection<Client>('clients');
 
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
   const { data: juniors, isLoaded, addItem, updateItem, deleteItem, getItemById } = useFirestoreCollection<Junior>('juniors');

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        items.push({ id: doc.id, ...docData } as Transaction);
      });
      setTransactions(items);
      setIsLoaded(true);
    }, (error) => {
      console.error(`Error fetching transactions:`, error);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, date: new Date().toISOString() };
    const docRef = await addDoc(collection(db, "transactions"), newTransaction);
    return { ...newTransaction, id: docRef.id } as Transaction;
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const docRef = doc(db, "transactions", id);
    await deleteDoc(docRef);
  }, []);

  return { transactions, addTransaction, deleteTransaction, isLoaded };
}

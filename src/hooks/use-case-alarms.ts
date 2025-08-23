"use client";

import { useEffect, useRef } from 'react';
import type { Case } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useClients } from './use-cases';

export function useCaseAlarms(cases: Case[]) {
  const { toast } = useToast();
  const { getClientById } = useClients();
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    // Clear previous timeouts
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];

    if (typeof window !== 'undefined' && 'Notification' in window) {
      cases.forEach(caseItem => {
        const client = getClientById(caseItem.clientId);
        if (!client) return;
        
        try {
          const alarmTime = new Date(`${caseItem.date}T${caseItem.time}`).getTime();
          const now = Date.now();
          const timeUntilAlarm = alarmTime - now;
  
          if (timeUntilAlarm > 0) {
            const timeoutId = setTimeout(() => {
              // In-app toast
              toast({
                title: `Reminder: ${caseItem.title}`,
                description: `Case for ${client.name} is scheduled now.`,
                duration: 20000,
              });
  
              // Browser notification
              if (Notification.permission === 'granted') {
                new Notification(`CourtBell: ${caseItem.title}`, {
                  body: `Your case for ${client.name} at ${caseItem.court} is scheduled now.`,
                  tag: caseItem.id,
                });
              }
            }, timeUntilAlarm);
            timeoutIds.current.push(timeoutId);
          }
        } catch(e) {
            console.error(`Could not set alarm for case ${caseItem.id}`, e);
        }
      });
    }

    return () => {
      // Cleanup on unmount
      timeoutIds.current.forEach(clearTimeout);
    };
  }, [cases, toast, getClientById]);
}


"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import type { UserProfile } from '@/lib/types';

interface UserProfileContextType {
  profile: UserProfile;
  saveProfile: (profile: UserProfile) => Promise<void>;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'profiles', user.uid);
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Initialize with a default profile if it doesn't exist
            const defaultProfile = { name: user.displayName || '', email: user.email || '' };
            setProfile(defaultProfile);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching profile:', error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setProfile({}); // Clear profile on logout
      setLoading(false);
    }
  }, [user]);

  const saveProfile = useCallback(
    async (newProfile: UserProfile) => {
      if (user) {
        const docRef = doc(db, 'profiles', user.uid);
        await setDoc(docRef, newProfile, { merge: true });
        setProfile(newProfile);
      }
    },
    [user]
  );

  const value = { profile, saveProfile, loading };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}

"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
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

  const getStorageKey = useCallback(() => {
    if (!user) return null;
    return `profile_${user.uid}`;
  }, [user]);

  useEffect(() => {
    setLoading(true);
    if (typeof window === 'undefined' || !user) {
      setProfile({});
      setLoading(false);
      return;
    }
    
    const storageKey = getStorageKey();
    if (!storageKey) {
        setLoading(false);
        return;
    }

    try {
        const item = window.localStorage.getItem(storageKey);
        if (item) {
            setProfile(JSON.parse(item));
        } else {
             // Initialize with a default profile if it doesn't exist
            const defaultProfile = { name: user.displayName || '', email: user.email || '' };
            setProfile(defaultProfile);
        }
    } catch (error) {
        console.error('Error reading profile from localStorage:', error);
        setProfile({});
    }
    setLoading(false);
  }, [user, getStorageKey]);

  const saveProfile = useCallback(
    async (newProfile: UserProfile) => {
      if (user && typeof window !== 'undefined') {
        const storageKey = getStorageKey();
        if (!storageKey) return;
        try {
            const updatedProfile = { ...profile, ...newProfile };
            window.localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
            setProfile(updatedProfile);
        } catch (error) {
            console.error('Error saving profile to localStorage:', error);
        }
      }
    },
    [user, getStorageKey, profile]
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

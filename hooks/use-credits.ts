"use client"

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useCredits() {
  const { user, isLoaded } = useUser();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch credits from API
  const fetchCredits = async () => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/user/credits');
      const data = await response.json();
      
      if (data.success) {
        setCredits(data.data.credits);
      } else {
        setError(data.error || 'Failed to fetch credits');
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError('Failed to fetch credits');
    } finally {
      setLoading(false);
    }
  };

  // Deduct credits
  const deductCredits = async (amount: number, profileId: string, reason?: string) => {
    if (!user) {
      throw new Error('Must be signed in to use credits');
    }

    if (credits < amount) {
      throw new Error('Insufficient credits');
    }

    try {
      const response = await fetch('/api/user/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          profileId,
          reason: reason || 'profile_unlock',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCredits(data.data.credits);
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to deduct credits');
      }
    } catch (err: any) {
      console.error('Error deducting credits:', err);
      throw err;
    }
  };

  // Check if user has enough credits
  const hasEnoughCredits = (amount: number = 1): boolean => {
    return credits >= amount;
  };

  // Initial load
  useEffect(() => {
    if (isLoaded) {
      fetchCredits();
    }
  }, [isLoaded, user]);

  // Also get credits from user metadata for real-time updates
  useEffect(() => {
    if (user?.publicMetadata?.credits !== undefined) {
      setCredits(user.publicMetadata.credits as number);
    }
  }, [user?.publicMetadata?.credits]);

  return {
    credits,
    loading,
    error,
    deductCredits,
    hasEnoughCredits,
    refetch: fetchCredits,
  };
}
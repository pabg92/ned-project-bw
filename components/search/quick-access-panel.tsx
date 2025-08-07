'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Search, Heart, TrendingUp, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSavedSearches } from '@/hooks/use-saved-searches';
import { useShortlist } from '@/hooks/use-shortlist';
import { cn } from '@/lib/utils';

interface QuickAccessPanelProps {
  onClose?: () => void;
  isFirstVisit?: boolean;
}

export default function QuickAccessPanel({ onClose, isFirstVisit = false }: QuickAccessPanelProps) {
  const router = useRouter();
  const { searches: savedSearches } = useSavedSearches();
  const { profiles: shortlistProfiles } = useShortlist();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Get recent searches from localStorage
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 3));
    }
  }, []);

  const quickActions = [
    {
      icon: Search,
      label: 'Browse All Profiles',
      description: '500+ verified executives',
      action: () => router.push('/search'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Heart,
      label: 'My Shortlist',
      description: `${shortlistProfiles.length} saved profiles`,
      action: () => router.push('/shortlist'),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      disabled: shortlistProfiles.length === 0,
    },
    {
      icon: TrendingUp,
      label: 'Popular Searches',
      description: 'Trending board positions',
      action: () => router.push('/search?popular=true'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {isFirstVisit ? (
              <>
                <Sparkles className="h-6 w-6 text-yellow-500" />
                Welcome to Board Champions!
              </>
            ) : (
              <>
                Welcome back!
              </>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            {isFirstVisit 
              ? 'Start exploring our network of board-ready executives'
              : 'Continue where you left off or start a new search'
            }
          </p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              onClick={action.action}
              disabled={action.disabled}
              className={cn(
                "h-auto p-4 justify-start text-left hover:shadow-md transition-all",
                !action.disabled && "hover:border-gray-300"
              )}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  action.bgColor
                )}>
                  <Icon className={cn("h-5 w-5", action.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{action.label}</div>
                  <div className="text-sm text-gray-600 truncate">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/search?query=${encodeURIComponent(search)}`)}
                className="text-sm"
              >
                {search}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Saved Searches
          </h3>
          <div className="space-y-2">
            {savedSearches.slice(0, 3).map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => router.push(`/search?saved=${search.id}`)}
              >
                <div>
                  <div className="font-medium text-gray-900">{search.name}</div>
                  <div className="text-sm text-gray-600">
                    {search.resultCount} results • Saved {new Date(search.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  View
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips for New Users */}
      {isFirstVisit && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Quick Tips:</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Use filters to narrow down your search by industry, experience, and location</li>
            <li>• Save interesting profiles to your shortlist for easy comparison</li>
            <li>• Purchase credits to unlock full profiles and contact information</li>
          </ul>
        </div>
      )}
    </Card>
  );
}
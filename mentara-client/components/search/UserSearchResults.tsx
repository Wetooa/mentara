'use client';

import React, { useState } from 'react';
import { Search, Users, UserCircle, Shield, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSearchItem, User } from './UserSearchItem';

interface UserSearchResultsProps {
  users: User[];
  onUserSelect: (user: User) => void;
  onMessage?: (user: User) => void;
  onBookSession?: (user: User) => void;
  isLoading?: boolean;
  query?: string;
  showRoleFilter?: boolean;
  selectedRole?: string;
  onRoleChange?: (role: string) => void;
  className?: string;
}

export const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  users,
  onUserSelect,
  onMessage,
  onBookSession,
  isLoading = false,
  query = '',
  showRoleFilter = true,
  selectedRole = 'all',
  onRoleChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(selectedRole);

  // Group users by role
  const usersByRole = users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  const roleStats = {
    all: users.length,
    client: usersByRole.client?.length || 0,
    therapist: usersByRole.therapist?.length || 0,
    moderator: (usersByRole.moderator?.length || 0) + (usersByRole.admin?.length || 0),
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'therapist':
        return <UserCircle className="w-4 h-4" />;
      case 'moderator':
        return <Shield className="w-4 h-4" />;
      case 'all':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getFilteredUsers = (role: string) => {
    if (role === 'all') return users;
    if (role === 'moderator') {
      return users.filter(user => user.role === 'moderator' || user.role === 'admin');
    }
    return users.filter(user => user.role === role);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onRoleChange?.(value);
  };

  if (isLoading) {
    return (
      <div className={cn('bg-background border border-border rounded-md shadow-lg', className)}>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Searching users...</span>
          </div>
        </div>
      </div>
    );
  }

  if (query.length < 2) {
    return (
      <div className={cn('bg-background border border-border rounded-md shadow-lg', className)}>
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Search className="w-8 h-8" />
            <span className="text-sm">Start typing to search for users</span>
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={cn('bg-background border border-border rounded-md shadow-lg', className)}>
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Users className="w-8 h-8" />
            <span className="text-sm">No users found for "{query}"</span>
            <span className="text-xs">Try adjusting your search terms</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-background border border-border rounded-md shadow-lg max-h-96 overflow-hidden', className)}>
      {showRoleFilter && (
        <div className="border-b border-border p-3">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                {getRoleIcon('all')}
                <span className="hidden sm:inline">All</span>
                <Badge variant="secondary" className="ml-1">
                  {roleStats.all}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger value="client" className="flex items-center gap-2">
                {getRoleIcon('client')}
                <span className="hidden sm:inline">Clients</span>
                <Badge variant="secondary" className="ml-1">
                  {roleStats.client}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger value="therapist" className="flex items-center gap-2">
                {getRoleIcon('therapist')}
                <span className="hidden sm:inline">Therapists</span>
                <Badge variant="secondary" className="ml-1">
                  {roleStats.therapist}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger value="moderator" className="flex items-center gap-2">
                {getRoleIcon('moderator')}
                <span className="hidden sm:inline">Moderators</span>
                <Badge variant="secondary" className="ml-1">
                  {roleStats.moderator}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="overflow-y-auto max-h-80">
        {showRoleFilter ? (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsContent value="all" className="mt-0">
              {getFilteredUsers('all').map((user, index) => (
                <UserSearchItem
                  key={user.id}
                  user={user}
                  onSelect={onUserSelect}
                  onMessage={onMessage}
                  onBookSession={onBookSession}
                  showActions={true}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="client" className="mt-0">
              {getFilteredUsers('client').map((user, index) => (
                <UserSearchItem
                  key={user.id}
                  user={user}
                  onSelect={onUserSelect}
                  onMessage={onMessage}
                  onBookSession={onBookSession}
                  showActions={true}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="therapist" className="mt-0">
              {getFilteredUsers('therapist').map((user, index) => (
                <UserSearchItem
                  key={user.id}
                  user={user}
                  onSelect={onUserSelect}
                  onMessage={onMessage}
                  onBookSession={onBookSession}
                  showActions={true}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="moderator" className="mt-0">
              {getFilteredUsers('moderator').map((user, index) => (
                <UserSearchItem
                  key={user.id}
                  user={user}
                  onSelect={onUserSelect}
                  onMessage={onMessage}
                  onBookSession={onBookSession}
                  showActions={true}
                />
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          users.map((user, index) => (
            <UserSearchItem
              key={user.id}
              user={user}
              onSelect={onUserSelect}
              onMessage={onMessage}
              onBookSession={onBookSession}
              showActions={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UserSearchResults;
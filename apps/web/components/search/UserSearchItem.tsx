'use client';

import React from 'react';
import { User, UserCircle, Shield, MessageCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  createdAt: string;
}

interface UserSearchItemProps {
  user: User;
  onSelect: (user: User) => void;
  onMessage?: (user: User) => void;
  onBookSession?: (user: User) => void;
  isHighlighted?: boolean;
  showActions?: boolean;
  className?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'therapist':
      return <UserCircle className="w-3 h-3" />;
    case 'moderator':
    case 'admin':
      return <Shield className="w-3 h-3" />;
    default:
      return <User className="w-3 h-3" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'therapist':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'moderator':
    case 'admin':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const UserSearchItem: React.FC<UserSearchItemProps> = ({
  user,
  onSelect,
  onMessage,
  onBookSession,
  isHighlighted = false,
  showActions = false,
  className = ''
}) => {
  const handleClick = () => {
    onSelect(user);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.(user);
  };

  const handleBookSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookSession?.(user);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-all duration-200',
        'hover:bg-accent/50 border-b border-border/50 last:border-b-0',
        isHighlighted && 'bg-accent',
        className
      )}
      onClick={handleClick}
    >
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage 
          src={user.avatarUrl} 
          alt={`${user.firstName} ${user.lastName}`} 
        />
        <AvatarFallback className="text-sm font-medium">
          {user.firstName.charAt(0)}
          {user.lastName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">
            {user.firstName} {user.lastName}
          </h3>
          <Badge 
            variant="secondary" 
            className={cn('text-xs flex-shrink-0', getRoleColor(user.role))}
          >
            <span className="flex items-center gap-1">
              {getRoleIcon(user.role)}
              {formatRole(user.role)}
            </span>
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground truncate mb-1">
          {user.email}
        </p>
        
        <p className="text-xs text-muted-foreground">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
      
      {showActions && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {onMessage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMessage}
              className="h-8 w-8 p-0"
              title="Send message"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}
          
          {onBookSession && user.role === 'therapist' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookSession}
              className="h-8 w-8 p-0"
              title="Book session"
            >
              <Calendar className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchItem;
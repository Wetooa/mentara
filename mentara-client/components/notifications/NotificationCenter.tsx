'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Search,
  Filter,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  Circle,
  MessageCircle,
  Users,
  CreditCard,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Wifi,
  WifiOff,
  Smartphone,
  Volume2,
  VolumeX,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { usePushNotifications } from '@/hooks/notifications/usePushNotifications';
import { useRealTimeNotifications } from '@/hooks/notifications/useRealTimeNotifications';

interface NotificationCenterProps {
  className?: string;
  showSettings?: boolean;
  maxHeight?: string;
}

type NotificationCategory = 'all' | 'message' | 'community' | 'billing' | 'therapy' | 'system';
type NotificationFilter = 'all' | 'unread' | 'read';

const categoryIcons = {
  message: MessageCircle,
  community: Users,
  billing: CreditCard,
  therapy: Calendar,
  system: Info,
};

const categoryColors = {
  message: 'text-blue-600 bg-blue-50',
  community: 'text-green-600 bg-green-50',
  billing: 'text-purple-600 bg-purple-50',
  therapy: 'text-orange-600 bg-orange-50',
  system: 'text-gray-600 bg-gray-50',
};

const priorityColors = {
  urgent: 'border-l-4 border-red-500 bg-red-50/50',
  high: 'border-l-4 border-orange-500 bg-orange-50/50',
  medium: 'border-l-4 border-blue-500 bg-blue-50/50',
  low: 'border-l-4 border-gray-300 bg-gray-50/50',
};

export function NotificationCenter({ 
  className,
  showSettings = true,
  maxHeight = '600px'
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState('notifications');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory>('all');
  const [readFilter, setReadFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Notification hooks
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    connectionState,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting,
    reconnectWebSocket,
    getHighPriorityNotifications,
    refetch
  } = useNotifications({ 
    enableRealtime: true, 
    enableToasts: false // Disable toasts in the center
  });

  // Push notification hooks
  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    error: pushError,
    config: pushConfig,
    enablePushNotifications,
    disablePushNotifications,
    testNotification,
    updateConfig: updatePushConfig,
    needsPermission,
  } = usePushNotifications();

  // Real-time notifications
  const {
    // isConnected: rtConnected,
    // connectionState: rtConnectionState,
    // markAsRead: rtMarkAsRead,
    // markAllAsRead: rtMarkAllAsRead,
    // deleteNotification: rtDeleteNotification,
    // reconnect: rtReconnect,
  } = useRealTimeNotifications({
    userId: "current-user-id", // TODO: Get from auth context
    enableToasts: false, // Disable toasts in the center to avoid duplicates
  });

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(n => n.category === categoryFilter);
    }

    // Read status filter
    if (readFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (readFilter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }

    // Sort by priority and date
    return filtered.sort((a, b) => {
      // First by read status (unread first)
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      
      // Then by priority
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Finally by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications, categoryFilter, readFilter, searchQuery]);

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  // Handle push notification settings toggle
  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await enablePushNotifications();
      if (!success) {
        toast.error('Failed to enable push notifications');
      }
    } else {
      const success = await disablePushNotifications();
      if (!success) {
        toast.error('Failed to disable push notifications');
      }
    }
  };

  // Handle category toggle in push settings
  const handleCategoryToggle = (category: string, enabled: boolean) => {
    updatePushConfig({
      categories: {
        ...pushConfig.categories,
        [category]: enabled
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Info;
    return IconComponent;
  };

  const getNotificationIcon = (notification: Notification) => {
    const IconComponent = getCategoryIcon(notification.category || 'system');
    return <IconComponent className="h-4 w-4" />;
  };

  const unreadHighPriority = getHighPriorityNotifications().filter(n => !n.isRead).length;

  return (
    <Card className={cn('w-full', className)} style={{ maxHeight }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Connection status indicators */}
            <div className="flex items-center gap-1">
              {connectionState.isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" title="Real-time connected" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" title="Real-time disconnected" />
              )}
              
              {pushSupported && pushSubscribed && (
                <Smartphone className="h-4 w-4 text-blue-500" title="Push notifications enabled" />
              )}
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAllAsRead || unreadCount === 0}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark All Read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={refetch}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
                {!connectionState.isConnected && (
                  <DropdownMenuItem onClick={reconnectWebSocket}>
                    <Wifi className="h-4 w-4 mr-2" />
                    Reconnect
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={testNotification}>
                  <Bell className="h-4 w-4 mr-2" />
                  Test Notification
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick stats */}
        {unreadHighPriority > 0 && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              {unreadHighPriority} high priority notification{unreadHighPriority !== 1 ? 's' : ''} need attention
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {showSettings && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-0">
            <div className="px-4 pb-4 space-y-4">
              {/* Search and filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {/* Category filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                        All Categories
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {Object.keys(categoryIcons).map((category) => {
                        const Icon = categoryIcons[category as keyof typeof categoryIcons];
                        return (
                          <DropdownMenuItem
                            key={category}
                            onClick={() => setCategoryFilter(category as NotificationCategory)}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Read status filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {readFilter === 'all' ? 'All' : readFilter === 'unread' ? 'Unread' : 'Read'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setReadFilter('all')}>
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setReadFilter('unread')}>
                        Unread Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setReadFilter('read')}>
                        Read Only
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Notifications list */}
              <div className="space-y-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {isLoading ? (
                  // Loading skeletons
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error Loading Notifications</h3>
                    <p className="text-muted-foreground mb-4">{error.message}</p>
                    <Button onClick={refetch}>Try Again</Button>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {searchQuery || categoryFilter !== 'all' || readFilter !== 'all'
                        ? 'No matching notifications'
                        : 'No notifications yet'
                      }
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery || categoryFilter !== 'all' || readFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'You\'ll see notifications here when you receive them'
                      }
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50',
                        !notification.isRead && 'bg-blue-50/50 border-blue-200',
                        priorityColors[notification.priority || 'medium']
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Notification icon */}
                      <div className={cn(
                        'p-2 rounded-full',
                        categoryColors[notification.category || 'system']
                      )}>
                        {getNotificationIcon(notification)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Status and actions */}
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Circle className="h-2 w-2 text-blue-500 fill-current" />
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.isRead && (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    disabled={isMarkingAsRead}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                )}
                                {notification.actionUrl && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(notification.actionUrl, '_blank');
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {notification.actionText || 'Open'}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  disabled={isDeleting}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                          {notification.category && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{notification.category}</span>
                            </>
                          )}
                          {notification.priority && notification.priority !== 'medium' && (
                            <>
                              <span>•</span>
                              <Badge 
                                variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
                                className="text-xs px-1 py-0"
                              >
                                {notification.priority}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          {showSettings && (
            <TabsContent value="settings" className="mt-0">
              <div className="px-4 pb-4 space-y-6">
                {/* Push Notifications Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Push Notifications</h3>
                  
                  {!pushSupported ? (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Push notifications are not supported in this browser.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Main toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-enabled">Enable Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications even when the app is closed
                          </p>
                        </div>
                        <Switch
                          id="push-enabled"
                          checked={pushSubscribed}
                          onCheckedChange={handlePushToggle}
                          disabled={pushLoading}
                        />
                      </div>

                      {needsPermission && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            Push notifications require browser permission. Click the toggle above to enable.
                          </p>
                        </div>
                      )}

                      {pushError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">{pushError}</p>
                        </div>
                      )}

                      {/* Category settings */}
                      {pushSubscribed && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <h4 className="font-medium">Notification Categories</h4>
                            {Object.entries(pushConfig.categories).map(([category, enabled]) => {
                              const Icon = getCategoryIcon(category);
                              return (
                                <div key={category} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <Label htmlFor={`category-${category}`}>
                                      {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </Label>
                                  </div>
                                  <Switch
                                    id={`category-${category}`}
                                    checked={enabled}
                                    onCheckedChange={(checked) => handleCategoryToggle(category, checked)}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <Separator />

                          {/* Sound and vibration */}
                          <div className="space-y-3">
                            <h4 className="font-medium">Notification Behavior</h4>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {pushConfig.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                <Label htmlFor="sound">Sound</Label>
                              </div>
                              <Switch
                                id="sound"
                                checked={pushConfig.sound}
                                onCheckedChange={(checked) => updatePushConfig({ sound: checked })}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                <Label htmlFor="vibration">Vibration</Label>
                              </div>
                              <Switch
                                id="vibration"
                                checked={pushConfig.vibration}
                                onCheckedChange={(checked) => updatePushConfig({ vibration: checked })}
                              />
                            </div>
                          </div>

                          {/* Quiet hours */}
                          <Separator />
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <div>
                                  <Label htmlFor="quiet-hours">Quiet Hours</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Disable notifications during specific hours
                                  </p>
                                </div>
                              </div>
                              <Switch
                                id="quiet-hours"
                                checked={pushConfig.quietHours.enabled}
                                onCheckedChange={(checked) => 
                                  updatePushConfig({ 
                                    quietHours: { ...pushConfig.quietHours, enabled: checked } 
                                  })
                                }
                              />
                            </div>

                            {pushConfig.quietHours.enabled && (
                              <div className="grid grid-cols-2 gap-4 pl-6">
                                <div>
                                  <Label htmlFor="quiet-start">Start Time</Label>
                                  <Input
                                    id="quiet-start"
                                    type="time"
                                    value={pushConfig.quietHours.start}
                                    onChange={(e) => 
                                      updatePushConfig({
                                        quietHours: { 
                                          ...pushConfig.quietHours, 
                                          start: e.target.value 
                                        }
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="quiet-end">End Time</Label>
                                  <Input
                                    id="quiet-end"
                                    type="time"
                                    value={pushConfig.quietHours.end}
                                    onChange={(e) => 
                                      updatePushConfig({
                                        quietHours: { 
                                          ...pushConfig.quietHours, 
                                          end: e.target.value 
                                        }
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Test notification */}
                          <Separator />
                          <Button 
                            onClick={testNotification}
                            variant="outline"
                            className="w-full"
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Send Test Notification
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Real-time Connection Status */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Connection Status</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {connectionState.isConnected ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                        <span>Real-time Notifications</span>
                      </div>
                      <Badge variant={connectionState.isConnected ? 'default' : 'destructive'}>
                        {connectionState.isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>

                    {connectionState.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{connectionState.error}</p>
                        <Button 
                          onClick={reconnectWebSocket}
                          size="sm"
                          className="mt-2"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reconnect
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {pushSubscribed ? (
                          <Smartphone className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Smartphone className="h-4 w-4 text-gray-400" />
                        )}
                        <span>Push Notifications</span>
                      </div>
                      <Badge variant={pushSubscribed ? 'default' : 'secondary'}>
                        {pushSubscribed ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
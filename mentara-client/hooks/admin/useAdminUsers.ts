import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "client" | "therapist" | "moderator" | "admin";
  status: "active" | "suspended" | "pending";
  createdAt: string;
  lastActive: string;
  emailVerified: boolean;
  sessionCount?: number;
  profileComplete: boolean;
}

interface UserStats {
  total: number;
  active: number;
  suspended: number;
  pending: number;
  therapists: number;
  clients: number;
  moderators: number;
  admins: number;
  newThisMonth: number;
  newThisWeek: number;
}

interface AdminUsersParams {
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface UseAdminUsersReturn {
  // Data
  users: User[];
  userStats: UserStats | undefined;
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
  
  // Actions
  suspendUser: (userId: string, reason?: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  sendVerificationEmail: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  
  // Refresh
  refetch: () => void;
}

export function useAdminUsers(params: AdminUsersParams = {}): UseAdminUsersReturn {
  const api = useApi();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch users list
  const { 
    data: usersResponse, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: () => api.admin.users.getList(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch user statistics
  const { 
    data: userStats, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: queryKeys.admin.analytics.userStats(),
    queryFn: () => api.admin.analytics.getUserStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => 
      api.admin.users.suspend(userId, { reason: reason || 'Suspended by admin' }),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      toast.success('User suspended successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.userStats() });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to suspend user');
    },
    onSettled: () => setIsUpdating(false),
  });

  // Activate user mutation (unsuspend)
  const activateUserMutation = useMutation({
    mutationFn: (userId: string) => api.admin.users.unsuspend(userId),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      toast.success('User activated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.userStats() });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to activate user');
    },
    onSettled: () => setIsUpdating(false),
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.admin.users.delete(userId),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.userStats() });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to delete user');
    },
    onSettled: () => setIsUpdating(false),
  });

  // Send verification email mutation
  const sendVerificationMutation = useMutation({
    mutationFn: (userId: string) => api.admin.users.sendVerificationEmail(userId),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      toast.success('Verification email sent successfully');
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to send verification email');
    },
    onSettled: () => setIsUpdating(false),
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      api.admin.users.updateRole(userId, { role }),
    onMutate: () => setIsUpdating(true),
    onSuccess: (_, { role }) => {
      toast.success(`User role updated to ${role}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.userStats() });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update user role');
    },
    onSettled: () => setIsUpdating(false),
  });

  // Action functions
  const suspendUser = async (userId: string, reason?: string): Promise<void> => {
    await suspendUserMutation.mutateAsync({ userId, reason });
  };

  const activateUser = async (userId: string): Promise<void> => {
    await activateUserMutation.mutateAsync(userId);
  };

  const deleteUser = async (userId: string): Promise<void> => {
    await deleteUserMutation.mutateAsync(userId);
  };

  const sendVerificationEmail = async (userId: string): Promise<void> => {
    await sendVerificationMutation.mutateAsync(userId);
  };

  const updateUserRole = async (userId: string, role: string): Promise<void> => {
    await updateRoleMutation.mutateAsync({ userId, role });
  };

  const refetch = () => {
    refetchUsers();
  };

  return {
    // Data
    users: usersResponse?.data || [],
    userStats,
    
    // Loading states
    isLoading: usersLoading || statsLoading,
    isUpdating,
    error: usersError,
    
    // Actions
    suspendUser,
    activateUser,
    deleteUser,
    sendVerificationEmail,
    updateUserRole,
    
    // Refresh
    refetch,
  };
}
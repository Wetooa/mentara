import { 
  Heart, 
  MessageCircle, 
  Hash, 
  Users, 
  Calendar,
  PenSquare,
  Send,
  Lock,
  AlertCircle,
  Activity,
  Paperclip,
  X,
  Edit3,
  Trash2,
  Eye,
  Stethoscope,
  UserCheck,
  Plus
} from "lucide-react";

export type UserRole = 'client' | 'therapist';

export interface RoleConfig {
  // Theming
  theme: {
    primary: string;
    accent: string;
    warm: string;
    calm: string;
    soothing: string;
    heart: string;
    background: string;
    border: string;
  };
  
  // Icons
  icons: {
    primary: any;
    activity: any;
    members: any;
    professional: any;
  };
  
  // Messages and Labels
  messages: {
    welcomeTitle: string;
    welcomeDescription: string;
    createPostButton: string;
    createPostDialogTitle: (roomName: string) => string;
    createPostPlaceholder: string;
    createPostContentPlaceholder: string;
    postingButtonText: string;
    shareButtonText: string;
    loadingText: string;
    emptyStateTitle: string;
    emptyStateDescription: string;
    emptyStateButton: string;
    memberBadge: string;
    restrictedRoomBadge: {
      moderator: string;
      admin: string;
    };
    errorTitle: string;
    errorDescription: string;
    restrictedRoomDescription: string;
  };
  
  // Navigation
  navigation: {
    postDetailPath: (postId: string) => string;
    communityButtonClass: string;
  };
  
  // Features
  features: {
    fileUpload: boolean;
    editPost: boolean;
    deletePost: boolean;
    advancedTheming: boolean;
  };
}

export const roleConfigs: Record<UserRole, RoleConfig> = {
  client: {
    theme: {
      primary: 'community-accent',
      accent: 'community-accent',
      warm: 'community-warm',
      calm: 'community-calm',
      soothing: 'community-soothing',
      heart: 'community-heart',
      background: 'bg-community-warm/10',
      border: 'border-community-calm/20',
    },
    icons: {
      primary: MessageCircle,
      activity: Activity,
      members: Users,
      professional: Heart,
    },
    messages: {
      welcomeTitle: 'A Fresh Start',
      welcomeDescription: 'This room is waiting for its first conversation. Your voice matters here.',
      createPostButton: 'Share Your Thoughts',
      createPostDialogTitle: (roomName: string) => `Create New Post in ${roomName}`,
      createPostPlaceholder: "What's on your mind?",
      createPostContentPlaceholder: 'Share your thoughts, experiences, or ask for support...',
      postingButtonText: 'Posting...',
      shareButtonText: 'Post',
      loadingText: 'Loading...',
      emptyStateTitle: 'A Fresh Start',
      emptyStateDescription: 'This room is waiting for its first conversation. Your voice matters here.',
      emptyStateButton: 'Start the Conversation',
      memberBadge: 'Community Member',
      restrictedRoomBadge: {
        moderator: 'Moderators Only',
        admin: 'Admins Only',
      },
      errorTitle: 'Connection Interrupted',
      errorDescription: "We're having trouble loading posts right now. Your mental health journey is important to us - let's try again.",
      restrictedRoomDescription: 'Only moderators can post in this room, but you can still read and engage with content.',
    },
    navigation: {
      postDetailPath: (postId: string) => `/client/community/posts/${postId}`,
      communityButtonClass: 'border-community-accent/30 text-community-accent',
    },
    features: {
      fileUpload: true,
      editPost: true,
      deletePost: true,
      advancedTheming: true,
    },
  },
  
  therapist: {
    theme: {
      primary: 'blue-600',
      accent: 'blue-600',
      warm: 'slate-50',
      calm: 'slate-700',
      soothing: 'slate-600',
      heart: 'red-500',
      background: 'bg-neutral-50',
      border: 'border-neutral-200',
    },
    icons: {
      primary: Stethoscope,
      activity: Activity,
      members: UserCheck,
      professional: Stethoscope,
    },
    messages: {
      welcomeTitle: 'Therapist Community Hub',
      welcomeDescription: 'Connect with fellow therapists, share insights, and engage with clients in a supportive environment.',
      createPostButton: 'Share Insight',
      createPostDialogTitle: (roomName: string) => `Share Professional Insight in ${roomName}`,
      createPostPlaceholder: 'What professional insight would you like to share?',
      createPostContentPlaceholder: 'Share your professional experience, therapeutic insights, or guidance for the community...',
      postingButtonText: 'Sharing...',
      shareButtonText: 'Share',
      loadingText: 'Loading...',
      emptyStateTitle: 'No discussions yet',
      emptyStateDescription: 'Be the first to share professional insights in this room!',
      emptyStateButton: 'Start Professional Discussion',
      memberBadge: 'Therapist',
      restrictedRoomBadge: {
        moderator: 'Professional Only',
        admin: 'Admin Only',
      },
      errorTitle: 'Failed to load posts',
      errorDescription: 'There was an error loading posts from this room.',
      restrictedRoomDescription: 'Only licensed professionals can initiate discussions in this room.',
    },
    navigation: {
      postDetailPath: (postId: string) => `/therapist/community/posts/${postId}`,
      communityButtonClass: 'border-blue-300 text-blue-600',
    },
    features: {
      fileUpload: false,
      editPost: false,
      deletePost: false,
      advancedTheming: false,
    },
  },
};

export const getRoleConfig = (role: UserRole): RoleConfig => {
  return roleConfigs[role];
};
# 🚀 Mentara Client Development Guide

> **Essential guide for developers working on the Mentara frontend application**

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup
```bash
# Clone and install
git clone <repository-url>
cd mentara-client
npm install

# Environment setup
cp .env.example .env.local
# Configure your environment variables

# Start development
npm run dev
```

## 📚 Development Patterns

### 1. **Component Development**

#### Creating New Components
```typescript
// components/feature/MyComponent.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button onClick={onAction}>Take Action</Button>
    </div>
  );
}
```

#### Component Guidelines
- ✅ Use TypeScript interfaces for all props
- ✅ Export as named exports (not default)
- ✅ Use shadcn/ui components when possible
- ✅ Follow responsive design patterns
- ✅ Include proper accessibility attributes

### 2. **Form Development**

#### Proper Form Structure
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type FormData = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const onSubmit = (data: FormData) => {
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields... */}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### 3. **API Integration**

#### Creating API Hooks
```typescript
// hooks/useMyFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useMyData(filters: FilterOptions) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.myFeature.filtered(filters),
    queryFn: () => api.myFeature.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateMyData() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMyDataRequest) => api.myFeature.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myFeature.all });
      toast.success('Data created successfully');
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message);
    },
  });
}
```

#### Adding New API Services
```typescript
// lib/api/services/myFeature.ts
import { ApiClient } from '../client';

export class MyFeatureService {
  constructor(private client: ApiClient) {}

  async getAll(filters: FilterOptions) {
    const response = await this.client.get('/my-feature', { params: filters });
    return response.data;
  }

  async create(data: CreateRequest) {
    const response = await this.client.post('/my-feature', data);
    return response.data;
  }
}

// Add to main API client
// lib/api/index.ts
export class ApiClient {
  // ... existing services
  public myFeature = new MyFeatureService(this);
}
```

### 4. **State Management**

#### Creating Zustand Stores
```typescript
// store/myFeatureStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyFeatureState {
  data: MyData[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setData: (data: MyData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useMyFeatureStore = create<MyFeatureState>()(
  persist(
    (set) => ({
      // Initial state
      data: [],
      isLoading: false,
      error: null,
      
      // Actions
      setData: (data) => set({ data }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set({
        data: [],
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'my-feature-store',
      // Only persist necessary data
      partialize: (state) => ({
        data: state.data,
      }),
    }
  )
);
```

### 5. **Page Development**

#### Creating New Pages
```typescript
// app/(protected)/my-feature/page.tsx
import { Metadata } from 'next';
import { MyFeatureComponent } from '@/components/my-feature/MyFeatureComponent';

export const metadata: Metadata = {
  title: 'My Feature | Mentara',
  description: 'Description of my feature',
};

export default function MyFeaturePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Feature</h1>
          <p className="text-muted-foreground">
            Feature description and context
          </p>
        </div>
        <MyFeatureComponent />
      </div>
    </div>
  );
}
```

#### Adding Error Boundaries
```typescript
// app/(protected)/my-feature/error.tsx
'use client';

import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function MyFeatureError({ error, reset }: ErrorProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
```

## 🎨 Styling Guidelines

### Tailwind CSS Best Practices

```typescript
// ✅ Good: Semantic class organization
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <Button size="sm" variant="outline">Action</Button>
</div>

// ❌ Avoid: Inline styles
<div style={{ padding: '16px', backgroundColor: 'white' }}>
```

### Responsive Design
```typescript
// ✅ Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// ✅ Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

### Theme Integration
```typescript
// ✅ Use theme colors
<div className="bg-primary text-primary-foreground">
<div className="bg-secondary text-secondary-foreground">
<div className="bg-muted text-muted-foreground">

// ✅ Use theme spacing and sizing
<div className="h-4 w-4">  // 16px
<div className="h-6 w-6">  // 24px
<div className="h-8 w-8">  // 32px
```

## 🔧 Testing Patterns

### Component Testing
```typescript
// __tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test Title" onAction={jest.fn()} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    const onAction = jest.fn();
    render(<MyComponent title="Test" onAction={onAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing
```typescript
// __tests__/hooks/useMyHook.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyData } from '@/hooks/useMyData';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useMyData', () => {
  it('fetches data correctly', async () => {
    const { result } = renderHook(() => useMyData({ filter: 'test' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

## 🚨 Common Pitfalls & Solutions

### 1. **State Management**
```typescript
// ❌ Avoid: Direct state mutation
state.items.push(newItem);

// ✅ Use: Immutable updates
setState(prev => [...prev, newItem]);
```

### 2. **API Calls**
```typescript
// ❌ Avoid: Direct axios calls in components
useEffect(() => {
  axios.get('/api/data').then(setData);
}, []);

// ✅ Use: React Query hooks
const { data } = useMyData();
```

### 3. **Error Handling**
```typescript
// ❌ Avoid: Silent failures
try {
  await api.call();
} catch (error) {
  // Silent failure
}

// ✅ Use: Proper error handling
try {
  await api.call();
} catch (error) {
  toast.error(error.message);
  console.error('API call failed:', error);
}
```

### 4. **Form Validation**
```typescript
// ❌ Avoid: Manual validation
const isValid = email.includes('@') && name.length > 0;

// ✅ Use: Zod schemas
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});
```

## 📋 Code Review Checklist

### Before Submitting PR
- [ ] **TypeScript**: No `any` types, proper interfaces defined
- [ ] **Testing**: Unit tests for new functionality
- [ ] **Styling**: Uses Tailwind classes, responsive design
- [ ] **Accessibility**: Proper ARIA labels, keyboard navigation
- [ ] **Performance**: No unnecessary re-renders, proper memoization
- [ ] **Error Handling**: Proper error boundaries and error states
- [ ] **Documentation**: README updates if needed

### During Code Review
- [ ] **Architecture**: Follows established patterns
- [ ] **Security**: No sensitive data exposure
- [ ] **UX**: Proper loading states and error messages
- [ ] **Code Quality**: Clean, readable, maintainable code
- [ ] **Performance**: No performance regressions

## 🛠️ Development Tools

### Required VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **ESLint**
- **Prettier**

### Useful Commands
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint errors
npm run type-check            # Run TypeScript checks

# Testing
npm run test                  # Run tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage
```

## 🎯 Performance Best Practices

### 1. **Bundle Optimization**
```typescript
// ✅ Dynamic imports for large components
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <Skeleton />,
});
```

### 2. **Image Optimization**
```typescript
// ✅ Use Next.js Image component
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={40}
  height={40}
  className="rounded-full"
  priority // For above-the-fold images
/>
```

### 3. **Memoization**
```typescript
// ✅ Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Memoize callback functions
const handleClick = useCallback(() => {
  onAction(id);
}, [onAction, id]);
```

## 📞 Getting Help

### Team Resources
- **Frontend Team**: Architecture and patterns questions
- **Design System**: shadcn/ui and Tailwind questions  
- **Backend Team**: API integration questions
- **DevOps Team**: Build and deployment issues

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

*This guide should be your first stop for development questions. Keep it updated as patterns evolve!*
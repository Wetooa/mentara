require('@testing-library/jest-dom')

// React Query testing utilities
const { QueryClient } = require('@tanstack/react-query')

// Create a mock QueryClient for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Make test QueryClient available globally
global.createTestQueryClient = createTestQueryClient

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}))

// Mock our auth system (replaces Clerk)
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'client',
    },
    handleSignOut: jest.fn(),
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
    getToken: jest.fn().mockResolvedValue('test-token'),
  }),
}))

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token',
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    setTokens: jest.fn(),
  }),
  AuthProvider: ({ children }) => children,
}))

// Mock our API client
jest.mock('@/lib/api', () => ({
  useApi: jest.fn(() => ({
    auth: {
      registerClient: jest.fn(),
      registerTherapist: jest.fn(),
      getCurrentUser: jest.fn(),
      getAllUsers: jest.fn(),
      forceLogout: jest.fn(),
    },
    users: {
      getAll: jest.fn(),
      getOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    dashboard: {
      getUserDashboard: jest.fn(),
      getTherapistDashboard: jest.fn(),
      getAdminDashboard: jest.fn(),
    },
    booking: {
      meetings: {
        create: jest.fn(),
        getList: jest.fn(),
        getMy: jest.fn(),
        getById: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
      },
      availability: {
        getSlots: jest.fn(),
        create: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      durations: {
        getAll: jest.fn(),
      },
    },
  })),
  api: {
    auth: {
      registerClient: jest.fn(),
      registerTherapist: jest.fn(),
      getCurrentUser: jest.fn(),
    },
    users: {
      getAll: jest.fn(),
      getOne: jest.fn(),
    },
    dashboard: {
      getUserDashboard: jest.fn(),
    },
  },
}))

// Setup test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
process.env.JWT_SECRET = 'test-jwt-secret'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  usePathname() {
    return '/therapist-application'
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock file upload functionality for tests
global.File = class MockFile {
  constructor(bits, name, options = {}) {
    this.bits = bits
    this.name = name
    this.size = bits.length || 0
    this.type = options.type || ''
  }
}

global.FileList = class MockFileList {
  constructor(files = []) {
    this.length = files.length
    files.forEach((file, index) => {
      this[index] = file
    })
  }
  
  item(index) {
    return this[index]
  }
  
  [Symbol.iterator]() {
    let index = 0
    return {
      next: () => {
        if (index < this.length) {
          return { value: this[index++], done: false }
        }
        return { done: true }
      }
    }
  }
}

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Suppress console warnings in tests unless explicitly needed
const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: `ReactDOMTestUtils.act`'))
    ) {
      return
    }
    originalConsoleError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
})
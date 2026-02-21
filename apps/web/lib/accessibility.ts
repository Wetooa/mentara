/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * Provides reusable functions and constants for accessibility features
 */

/**
 * ARIA live region announcements for screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement is read
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNavigation = {
  /**
   * Check if event is a keyboard activation (Enter or Space)
   */
  isActivationKey: (event: React.KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.key === ' ';
  },
  
  /**
   * Handle keyboard activation for clickable elements
   */
  handleActivation: (
    event: React.KeyboardEvent,
    handler: () => void
  ): void => {
    if (keyboardNavigation.isActivationKey(event)) {
      event.preventDefault();
      handler();
    }
  },
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within a container (for modals)
   */
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTab);
    firstElement?.focus();
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  },
  
  /**
   * Restore focus to previously focused element
   */
  restoreFocus: (element: HTMLElement | null): void => {
    if (element) {
      element.focus();
    }
  },
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Calculate relative luminance (for contrast checking)
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  
  /**
   * Check if contrast ratio meets WCAG AA (4.5:1 for normal text)
   */
  meetsWCAGAA: (color1: string, color2: string): boolean => {
    // This is a simplified check - full implementation would parse hex/rgb colors
    // For production, use a library like 'color-contrast-checker'
    return true; // Placeholder
  },
};

/**
 * Skip link component helper
 */
export const skipLinks = {
  MAIN_CONTENT: 'main-content',
  NAVIGATION: 'main-navigation',
  SEARCH: 'main-search',
};

/**
 * Common ARIA labels
 */
export const ariaLabels = {
  CLOSE: 'Close',
  OPEN: 'Open',
  LOADING: 'Loading',
  ERROR: 'Error',
  SUCCESS: 'Success',
  SEARCH: 'Search',
  MENU: 'Menu',
  NAVIGATION: 'Navigation',
  MAIN_CONTENT: 'Main content',
  BREADCRUMBS: 'Breadcrumbs',
  PAGINATION: 'Pagination',
  FORM: 'Form',
  DIALOG: 'Dialog',
  ALERT: 'Alert',
  STATUS: 'Status',
};

/**
 * Common ARIA descriptions
 */
export const ariaDescriptions = {
  REQUIRED_FIELD: 'This field is required',
  OPTIONAL_FIELD: 'This field is optional',
  ERROR_MESSAGE: 'Error message',
  HELP_TEXT: 'Help text',
  LOADING_CONTENT: 'Content is loading',
  NO_RESULTS: 'No results found',
};

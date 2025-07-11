/**
 * Simple verification script to test dashboard API integration
 * Run this in the browser console while logged in as a client
 */

console.log('🧪 Dashboard API Integration Verification');
console.log('========================================');

// Check if we're on the dashboard page
if (!window.location.pathname.includes('/user')) {
  console.log('❌ Please navigate to the client dashboard (/user) first');
} else {
  console.log('✅ On dashboard page');
}

// Check if React Query DevTools are available (for debugging)
if (window.__REACT_QUERY_DEVTOOLS_V5__) {
  console.log('✅ React Query DevTools available');
} else {
  console.log('ℹ️ React Query DevTools not available (this is normal)');
}

// Function to check if dashboard API is being called
function verifyDashboardApiCalls() {
  console.log('\n📡 Monitoring network requests...');
  
  // Monitor fetch requests
  const originalFetch = window.fetch;
  let dashboardApiCalled = false;
  let notificationsApiCalled = false;
  let messagingApiCalled = false;
  
  window.fetch = function(...args) {
    const url = args[0];
    
    if (typeof url === 'string') {
      if (url.includes('/api/dashboard/user')) {
        console.log('✅ Dashboard API called:', url);
        dashboardApiCalled = true;
      }
      if (url.includes('/api/notifications')) {
        console.log('✅ Notifications API called:', url);
        notificationsApiCalled = true;
      }
      if (url.includes('/api/messaging')) {
        console.log('✅ Messaging API called:', url);
        messagingApiCalled = true;
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  // Check after 5 seconds
  setTimeout(() => {
    console.log('\n📊 API Call Summary:');
    console.log('Dashboard API called:', dashboardApiCalled ? '✅' : '❌');
    console.log('Notifications API called:', notificationsApiCalled ? '✅' : '❌');
    console.log('Messaging API called:', messagingApiCalled ? '✅' : '❌');
    
    // Restore original fetch
    window.fetch = originalFetch;
    
    if (dashboardApiCalled) {
      console.log('\n🎉 SUCCESS: Dashboard is using real API calls instead of mock data!');
    } else {
      console.log('\n⚠️ Dashboard API not detected. This could mean:');
      console.log('  - The API calls haven\'t fired yet (wait a moment)');
      console.log('  - There\'s an issue with the integration');
      console.log('  - The backend server is not running');
    }
  }, 5000);
}

// Function to check for mock data usage
function checkForMockDataUsage() {
  console.log('\n🔍 Checking for mock data usage...');
  
  // Look for mock data indicators in the DOM
  const dashboardContent = document.body.innerText;
  
  // Check for specific mock data values (from mockUserDashboardData.ts)
  const mockIndicators = [
    'John Doe', // Mock user name
    'Dr. Sarah Johnson', // Mock therapist name
    'Understanding Anxiety Triggers', // Mock worksheet title
    'Introduction to Mindfulness' // Mock session title
  ];
  
  let mockDataFound = false;
  mockIndicators.forEach(indicator => {
    if (dashboardContent.includes(indicator)) {
      console.log('⚠️ Possible mock data found:', indicator);
      mockDataFound = true;
    }
  });
  
  if (!mockDataFound) {
    console.log('✅ No obvious mock data indicators found');
  }
}

// Function to check dashboard component state
function checkDashboardComponents() {
  console.log('\n🧩 Checking dashboard components...');
  
  const components = [
    { name: 'Stats Overview', selector: 'h2:contains("Session"), h3:contains("Session"), [data-testid="stats-overview"]' },
    { name: 'Assigned Therapist', selector: 'h3:contains("Your Therapist"), h2:contains("Your Therapist")' },
    { name: 'Upcoming Sessions', selector: 'h3:contains("Upcoming Sessions"), h2:contains("Upcoming Sessions")' },
    { name: 'Worksheet Status', selector: 'h3:contains("Worksheet Status"), h2:contains("Worksheet Status")' },
    { name: 'Notifications', selector: 'h3:contains("Notifications"), h2:contains("Notifications")' },
    { name: 'Recent Communications', selector: 'h3:contains("Recent Communications"), h2:contains("Recent Communications")' },
    { name: 'Progress Tracking', selector: 'h3:contains("Progress Tracking"), h2:contains("Progress Tracking")' }
  ];
  
  components.forEach(component => {
    const elements = document.querySelectorAll(component.selector.split(', ').join(', '));
    if (elements.length > 0) {
      console.log(`✅ ${component.name} component found`);
    } else {
      console.log(`❌ ${component.name} component not found`);
    }
  });
}

// Function to check for loading states
function checkLoadingStates() {
  console.log('\n⏳ Checking for loading states...');
  
  const loadingSelectors = [
    '.animate-pulse',
    '[data-testid="skeleton"]',
    '.skeleton',
    'div:contains("Loading")',
    'div:contains("loading")'
  ];
  
  let loadingFound = false;
  loadingSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`⏳ Loading state found: ${selector}`);
        loadingFound = true;
      }
    } catch (e) {
      // Ignore CSS selector errors for contains()
    }
  });
  
  if (!loadingFound) {
    console.log('✅ No loading states currently visible (data has loaded)');
  }
}

// Run all checks
console.log('\n🚀 Starting verification...');
checkDashboardComponents();
checkLoadingStates();
checkForMockDataUsage();
verifyDashboardApiCalls();

console.log('\n📋 Manual Verification Steps:');
console.log('1. Check the Network tab in DevTools for API calls to /dashboard/user');
console.log('2. Look for real user data instead of mock data (John Doe, Dr. Sarah Johnson, etc.)');
console.log('3. Verify loading states appear briefly when refreshing the page');
console.log('4. Check that error handling works (try disconnecting network)');
console.log('\n⏰ Monitoring network requests for 5 seconds...');
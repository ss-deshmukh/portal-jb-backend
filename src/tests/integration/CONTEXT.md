# Integration Testing Context

## Test Environment Setup

### Server Configuration
- Test server runs on port 3001 (configurable via `TEST_PORT` env variable)
- Uses test-specific MongoDB database
- Implements proper cleanup between test runs
- Handles graceful shutdown

### Test Client Implementation
- Uses Axios for HTTP requests
- Implements session management with cookies
- Handles both HTTP and connection errors
- Provides methods for all API endpoints
- Supports both Bearer token and session-based authentication

## Authentication Flow

### Session Management
- Uses session cookies for authentication
- Implements `setSession` and `clearSession` methods
- Handles session persistence between requests
- Supports both user and admin sessions

### Test Data Generation
- Unique email generation using timestamps
- Test wallet address generation for Polkadot addresses
- Proper cleanup of test data after tests

## Contributor Model Structure

### Required Fields
```javascript
{
  basicInfo: {
    email: String,
    displayName: String,
    walletAddress: String,
    joinDate: Date
  },
  contactPreferences: {
    emailNotifications: Boolean,
    newsletterSubscription: {
      subscribed: Boolean,
      interests: [String]
    },
    canBeContactedBySponsors: Boolean
  },
  preferences: {
    interfaceSettings: {
      theme: String,
      language: String
    },
    opportunityPreferences: {
      preferredCategories: [String],
      minimumReward: Number,
      preferredDifficulty: String,
      timeCommitment: String
    },
    privacySettings: {
      profileVisibility: String,
      submissionVisibility: String,
      skillsVisibility: String,
      reputationVisibility: String,
      contactabilityBySponsors: String
    }
  }
}
```

## Test Patterns

### Common Test Structure
1. Setup test data
2. Perform test operation
3. Verify results
4. Clean up

### Error Handling
- Tests handle both HTTP errors (4xx, 5xx)
- Connection errors (ECONNREFUSED)
- Validation errors
- Authentication errors

### Best Practices
- Each test is isolated
- Proper cleanup between tests
- Clear error messages
- Comprehensive assertions
- Session management

## Known Issues and Solutions

### Session Cookie Handling
- Ensure proper cookie handling in test client
- Clear sessions between tests
- Handle cookie persistence

### Validation Errors
- Match request structure with model schema
- Include all required fields
- Use correct data types

### Authentication
- Set up proper session before protected routes
- Handle both user and admin authentication
- Clear sessions after tests

## Future Improvements

### Test Coverage
- Add more edge cases
- Test error scenarios
- Add performance tests

### Test Data Management
- Implement test data factories
- Add data cleanup utilities
- Improve test data generation

### Documentation
- Add more detailed test descriptions
- Document test dependencies
- Add setup instructions 
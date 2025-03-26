# Integration Testing Context

## Server Configuration
- Test server runs on port 5001 (configurable via TEST_PORT env var)
- Uses test database for isolation
- Implements session-based authentication with NextAuth.js cookies
- Requires proper session setup for protected routes
- Admin routes require admin role in session

## Authentication Flow
- Session cookies are automatically handled by test client
- Session setup requires proper user data structure:
  ```javascript
  {
    id: string,
    email: string,
    role: string,
    permissions: string[]
  }
  ```
- Session cookies are automatically stored and sent with subsequent requests
- Protected routes require valid session cookie
- Admin routes require admin role in session

## API Endpoint Structure
- Public endpoints:
  - POST /api/sponsor/register
  - POST /api/sponsor/login
- Protected endpoints:
  - GET /api/sponsor (profile)
  - PUT /api/sponsor (update)
  - DELETE /api/sponsor (delete)
- Admin endpoints:
  - GET /api/sponsor/all

## Test Client Implementation
- Uses axios with withCredentials enabled
- Automatically handles session cookies
- Implements response interceptor for cookie management
- Provides helper methods for common operations
- Includes proper error handling and logging

## Common Test Patterns
1. Server Setup/Teardown:
   ```javascript
   beforeAll(async () => {
     await startTestServer();
   });
   afterAll(async () => {
     await stopTestServer();
   });
   ```

2. Session Management:
   ```javascript
   beforeEach(async () => {
     await api.auth.clearSession();
   });
   ```

3. Test Data Generation:
   ```javascript
   function generateTestWalletAddress() {
     // Generate valid Polkadot address format
     const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
     let address = Math.random() < 0.5 ? '1' : '5';
     for (let i = 0; i < 47; i++) {
       address += base58Chars[Math.floor(Math.random() * base58Chars.length)];
     }
     return address;
   }
   ```

4. Response Validation:
   ```javascript
   expect(response.status).toBe(200);
   expect(response.data).toHaveProperty('message');
   expect(response.data).toHaveProperty('sponsor');
   ```

## Known Issues and Solutions
1. Session Cookie Handling:
   - Issue: Session cookies not being properly stored/sent
   - Solution: Use withCredentials and response interceptor in test client

2. Protected Route Access:
   - Issue: 401 errors on protected routes
   - Solution: Ensure proper session setup before protected route tests

3. Admin Route Access:
   - Issue: 403 errors on admin routes
   - Solution: Set admin role in session data

## Future Improvements
1. Test Data Management:
   - Implement test data cleanup after each test
   - Add helper functions for common test data creation

2. Error Handling:
   - Add more detailed error logging
   - Implement retry mechanism for flaky tests

3. Session Management:
   - Add helper for session validation
   - Implement session refresh mechanism

4. Test Organization:
   - Group related tests using describe blocks
   - Add test descriptions for better documentation

## Best Practices
1. Always clear sessions before each test
2. Use proper error handling with try/catch blocks
3. Validate response structure and status codes
4. Generate unique test data for each test
5. Clean up test data after tests
6. Use proper logging for debugging
7. Follow consistent endpoint naming conventions
8. Implement proper validation middleware
9. Use environment variables for configuration
10. Maintain test isolation

## Learnings and Key Insights

### Skill Management System Implementation

1. **Schema Simplification**
   - Initially had a complex schema with fields like description, category, level, and createdBy
   - Simplified to just id and name fields for better maintainability and reduced complexity
   - This aligns with the principle of keeping things simple unless there's a specific need for complexity

2. **Validation Middleware**
   - Validation rules should match the schema exactly
   - When schema changes, validation middleware must be updated accordingly
   - Important to validate both creation and update operations separately
   - Validation should be strict for creation but more flexible for updates

3. **API Route Structure**
   - Consistent route naming is crucial for maintainability
   - Routes should follow RESTful conventions
   - Clear separation between public and protected routes
   - Route paths in test client must exactly match the actual API routes

4. **Testing Best Practices**
   - Test client should mirror the actual API structure
   - Each test should be independent and clean up after itself
   - Proper setup and teardown of test data is essential
   - Test both success and failure scenarios
   - Include authorization tests to verify access control

5. **Authentication and Authorization**
   - Clear distinction between public and protected routes
   - Admin privileges should be properly validated
   - Session management is critical for maintaining user state
   - Authorization checks should be consistent across all protected endpoints

6. **Error Handling**
   - Consistent error response format
   - Proper HTTP status codes for different scenarios
   - Detailed error messages for debugging
   - Validation errors should be clearly communicated

7. **Code Organization**
   - Separation of concerns between routes, controllers, and middleware
   - Consistent file structure and naming conventions
   - Clear documentation of API endpoints and their requirements
   - Modular design for easier maintenance and testing

8. **Development Workflow**
   - Iterative development with continuous testing
   - Regular validation of changes against existing functionality
   - Importance of proper error logging and debugging
   - Value of comprehensive test coverage

These insights can be applied to future development work to ensure consistent, maintainable, and well-tested code.

### Task Management System Implementation

1. **API Response Structure Consistency**
   - Different endpoints should return consistent response structures
   - List/fetch endpoints should return arrays in a consistent format (e.g., `{ tasks: [...] }`)
   - Single item endpoints should return objects in a consistent format (e.g., `{ task: {...} }`)
   - This consistency makes it easier to handle responses in both frontend and tests

2. **Task Data Validation**
   - Required fields must be validated thoroughly:
     - title, sponsorId, logo, description
     - deadline and postedTime (must be valid dates)
     - reward (must be a positive number)
     - status (must be one of: 'open', 'completed', 'cancelled')
     - priority (must be one of: 'low', 'medium', 'high', 'urgent')
   - Array fields must be validated:
     - requirements, deliverables, category, skills, submissions
     - deliverables array cannot be empty
     - all array elements must be of the correct type

3. **Test Data Management**
   - Each test should create its own test data
   - Test data should be cleaned up after each test
   - Test data should be unique to avoid conflicts
   - Helper functions (like `generateUniqueWalletAddress`) are valuable for test data generation

4. **Authentication in Tests**
   - Protected routes require proper authentication setup
   - Auth tokens should be obtained before making protected requests
   - Session management should be handled properly in tests
   - Auth tokens should be passed in request headers

5. **Error Handling and Logging**
   - Comprehensive logging helps in debugging test failures
   - Log important operations and their outcomes
   - Log validation errors with detailed information
   - Log database operations and their results

6. **Test Organization**
   - Group related tests using describe blocks
   - Use clear, descriptive test names
   - Set up test environment before tests
   - Clean up after tests
   - Each test should be independent

7. **API Endpoint Design**
   - Use consistent endpoint naming
   - Follow RESTful conventions
   - Use appropriate HTTP methods (GET, POST, PUT, DELETE)
   - Include proper validation middleware
   - Return appropriate HTTP status codes

8. **Database Operations**
   - Use proper database models
   - Validate data before saving
   - Handle database errors appropriately
   - Clean up test data after tests
   - Use transactions when necessary

9. **Test Client Implementation**
   - Mirror API structure in test client
   - Handle authentication automatically
   - Provide helper methods for common operations
   - Include proper error handling
   - Log operations for debugging

10. **Best Practices**
    - Keep tests isolated
    - Use environment variables for configuration
    - Follow consistent naming conventions
    - Document test requirements
    - Maintain test data consistency
    - Handle cleanup properly
    - Use proper assertions
    - Log important information
    - Handle errors appropriately
    - Keep tests maintainable

These insights can be applied to future development work to ensure consistent, maintainable, and well-tested code. 
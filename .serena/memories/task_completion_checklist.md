# Task Completion Checklist

## Pre-Commit Requirements

### Frontend (mentara-client/)
1. **Linting**: Run `npm run lint` and fix all issues
2. **Type Checking**: Ensure TypeScript compilation succeeds (automatic with Next.js)
3. **Testing**: Run relevant tests if modified test files
4. **Build Check**: Run `npm run build` to ensure production build works

### Backend (mentara-api/)  
1. **Linting**: Run `npm run lint` and fix all issues
2. **Formatting**: Run `npm run format` to ensure Prettier formatting
3. **Type Checking**: Ensure TypeScript compilation succeeds
4. **Testing**: Run `npm run test` for unit tests
5. **Database**: 
   - Run `npm run db:generate` if Prisma schema was modified
   - Run `npm run db:migrate` if database schema changes were made
6. **Build Check**: Run `npm run build` to ensure production build works

### AI Service (ai-patient-evaluation/)
1. **Dependencies**: Ensure `requirements.txt` is up to date
2. **API Testing**: Test Flask endpoints if modified

## Code Quality Checks
1. **No Console.log**: Remove debugging console.log statements (except intentional logging)
2. **Error Handling**: Ensure proper error handling and user feedback
3. **Type Safety**: Use TypeScript types, no `any` unless absolutely necessary
4. **Performance**: Check for potential performance issues
5. **Security**: No hardcoded secrets, proper validation of inputs

## Testing Requirements
1. **Unit Tests**: Write tests for new business logic
2. **Integration Tests**: Test API endpoints that were modified
3. **E2E Tests**: Update or add E2E tests for significant user flow changes
4. **Manual Testing**: Test the feature manually in development environment

## Documentation Updates
1. **API Documentation**: Update if API endpoints changed
2. **README Updates**: Update if setup instructions changed
3. **Comments**: Add/update code comments for complex logic
4. **Type Definitions**: Ensure interfaces/types are properly documented

## Database-Related Tasks
1. **Migration Files**: Review generated migration files before applying
2. **Seed Data**: Update seed scripts if data structure changed
3. **Backup Consideration**: Consider data migration impact on existing data

## Branch and Git Workflow
1. **Current Branch**: Work on `dev` branch (main development)
2. **Commit Messages**: Use descriptive commit messages
3. **Branch Naming**: Follow convention (frontend/feature/*, backend/feature/*, etc.)
4. **Pull Requests**: Target `dev` branch for merges

## Environment Considerations
1. **Environment Variables**: Ensure all required env vars are documented
2. **Development Setup**: Verify all three services can run simultaneously
3. **Port Conflicts**: Frontend (3000), Backend (NestJS default), AI service (Flask default)

## Final Verification
1. **Functionality**: Feature works as expected
2. **Edge Cases**: Test error scenarios and edge cases
3. **Cross-Browser**: Test in different browsers if frontend changes
4. **Responsive**: Ensure responsive design works if UI changes
5. **Accessibility**: Basic accessibility checks for UI changes
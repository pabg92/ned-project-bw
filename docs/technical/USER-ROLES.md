# Board Champions User Roles & Permissions

## Overview

Board Champions has three distinct user types, each with specific permissions and access levels. This document outlines the complete user role system, authentication flows, and permission boundaries.

## User Types

### 1. Company Users (Recruiters/Employers)
**Purpose**: Companies looking to find board members and executives

**Registration Flow**:
- Sign up via `/sign-up?role=company`
- Automatic Clerk account creation
- Immediate access to search (with 0 credits)
- Must purchase credits to unlock profiles

**Permissions**:
- ✅ Browse anonymized candidate profiles
- ✅ Search and filter candidates
- ✅ Purchase credits
- ✅ Unlock full profile details (costs credits)
- ✅ Save profiles to shortlist
- ✅ View own unlocked profiles history
- ❌ Cannot apply as a candidate
- ❌ Cannot access admin functions

**Key Routes**:
- `/search` - Browse candidates
- `/search/[id]` - View candidate details
- `/billing` - Purchase credits
- `/credits` - View credit balance/history
- `/shortlist` - Saved candidates

### 2. Candidate Users (Board Members/Executives)
**Purpose**: Professionals seeking board positions

**Registration Flow**:
- Apply via `/signup` (public form)
- Creates database record only (no Clerk account)
- Admin review required
- Future: Receive invitation email after approval
- Future: Create account to edit profile

**Current Permissions**:
- ✅ Submit application via public form
- ❌ No login access (pending implementation)
- ❌ Cannot search other candidates
- ❌ Cannot purchase credits

**Future Permissions** (after account creation):
- ✅ View own profile
- ✅ Edit profile information
- ✅ Control anonymization settings
- ✅ See profile view statistics
- ❌ Cannot view other candidates

**Key Routes**:
- `/signup` - Application form (public)
- Future: `/profile` - Own profile view
- Future: `/profile/edit` - Edit profile

### 3. Admin Users
**Purpose**: Platform administrators managing content and users

**Registration Flow**:
- Manually assigned role
- Must be granted by existing admin
- Full Clerk account with elevated permissions

**Permissions**:
- ✅ All Company user permissions
- ✅ View all candidate applications
- ✅ Approve/reject candidates
- ✅ Edit any profile
- ✅ Grant/revoke credits
- ✅ View platform analytics
- ✅ Manage user accounts
- ✅ Access audit logs

**Key Routes**:
- `/admin` - Dashboard
- `/admin/candidates` - Manage candidates
- `/admin/candidates/[id]` - Individual candidate management
- `/admin/analytics` - Platform statistics
- All other routes

## Role Assignment

### Automatic Assignment
```typescript
// During sign-up
if (signUpPath.includes('?role=company')) {
  userData.role = 'company';
  // Initialize credit balance
  // Set up company-specific metadata
}

// During candidate application
if (applicationPath === '/signup') {
  userData.role = 'candidate';
  // No Clerk account created
  // Pending admin approval
}
```

### Manual Assignment (Admin Only)
```typescript
// Admin can change roles
await updateUserRole(userId, 'admin');
await updateUserRole(userId, 'company');
```

## Permission Matrix

| Feature | Company | Candidate | Admin | Public |
|---------|---------|-----------|-------|---------|
| View homepage | ✅ | ✅ | ✅ | ✅ |
| Submit candidate application | ❌ | N/A | ✅ | ✅ |
| Sign up for account | ✅ | ❌* | ✅ | ✅ |
| Search candidates | ✅ | ❌ | ✅ | ❌ |
| View anonymized profiles | ✅ | ❌ | ✅ | ❌ |
| Unlock full profiles | ✅ | ❌ | ✅ | ❌ |
| Purchase credits | ✅ | ❌ | ❌** | ❌ |
| Manage own profile | ✅ | Future | ✅ | ❌ |
| Approve candidates | ❌ | ❌ | ✅ | ❌ |
| View all users | ❌ | ❌ | ✅ | ❌ |
| Modify any profile | ❌ | ❌ | ✅ | ❌ |

*Candidates apply via form, account creation pending
**Admins can grant credits without purchase

## Metadata Structure

### Clerk User Metadata
```typescript
interface UserPublicMetadata {
  role: 'company' | 'candidate' | 'admin';
  credits?: number;
  unlockedProfiles?: string[];
}

interface UserPrivateMetadata {
  // Internal flags
  isVerified?: boolean;
  signupSource?: string;
  adminNotes?: string;
}
```

### Database User Record
```typescript
interface User {
  id: string;              // Internal user ID
  clerk_id: string | null; // Clerk ID (null for pending candidates)
  email: string;
  role: 'company' | 'candidate' | 'admin';
  is_active: boolean;
  // ... other fields
}
```

## Authentication Flows

### Company Registration
```mermaid
1. User visits /companies
2. Clicks "Sign Up"
3. Redirected to /sign-up?role=company
4. Completes Clerk sign-up
5. Role set to 'company' in metadata
6. Credit balance initialized to 0
7. Redirected to /search
```

### Candidate Application
```mermaid
1. User visits homepage
2. Clicks "Join as Board Member"
3. Fills out /signup form
4. Database record created
5. Admin notified
6. Awaits approval
7. (Future) Receives invitation email
8. (Future) Creates account
```

### Role-Based Redirects
```typescript
// After sign-in
switch(user.role) {
  case 'company':
    redirect('/search');
    break;
  case 'admin':
    redirect('/admin');
    break;
  case 'candidate':
    redirect('/profile'); // Future
    break;
  default:
    redirect('/');
}
```

## Security Considerations

### Route Protection
All routes are protected based on user role:
- Middleware checks authentication state
- Role verification for sensitive routes
- Redirect unauthorized users appropriately

### Data Access
- Companies can only see profiles they've unlocked
- Candidates can only see their own data (future)
- Admins have full access with audit logging

### Credit Security
- Credits are server-side only
- All deductions via secure API
- Transaction history maintained
- No client-side manipulation possible

## Implementation Status

### Completed ✅
- Basic role structure in database
- Admin role checking
- Public routes defined

### In Progress 🚧
- Company registration flow
- Role-based middleware
- Company landing page

### Planned 📋
- Candidate account creation
- Profile self-editing
- Role switching (admin feature)
- Detailed audit logging

## Testing Roles

### Development Environment
```bash
# Create test company user
Email: company@test.com
Role: company

# Create test admin
Email: admin@test.com  
Role: admin

# Test candidate (no login)
Apply via /signup form
```

### Role Verification
```typescript
// Check current user role
const { user } = useUser();
const role = user?.publicMetadata?.role;

// Verify in API routes
const { userId, sessionClaims } = auth();
const role = sessionClaims?.publicMetadata?.role;
```

## Troubleshooting

### Common Issues

1. **User can't access /search**
   - Check role is 'company' or 'admin'
   - Verify Clerk metadata is set
   - Check middleware protection

2. **Candidate can't log in**
   - Expected: Candidates don't have accounts yet
   - Future: Will receive invitation after approval

3. **Role not persisting**
   - Ensure Clerk webhook is updating metadata
   - Check publicMetadata vs privateMetadata
   - Verify database sync

## Future Enhancements

1. **Sub-roles**
   - Company: HR, Executive, Recruiter
   - Candidate: Active, Passive, Alumni
   - Admin: Super, Moderator, Support

2. **Team Accounts**
   - Multiple users per company
   - Shared credit pool
   - Role hierarchy within teams

3. **Permission Granularity**
   - Feature flags per user
   - Custom permission sets
   - Time-based access

---

Last Updated: [Current Date]
Version: 1.0
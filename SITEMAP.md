# Board Champions - Site Map

## Visual Site Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     Board Champions Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🏠 PUBLIC AREA                    🔐 AUTHENTICATED AREA         │
│  ┌─────────────────┐              ┌──────────────────┐          │
│  │   Home Page     │              │   User Profile   │          │
│  │   /             │              │   /profile       │          │
│  └────────┬────────┘              └────────┬─────────┘          │
│           │                                 │                     │
│  ┌────────┴────────┐              ┌────────┴─────────┐          │
│  │  Authentication │              │     Search       │          │
│  │  ┌───────────┐  │              │  ┌────────────┐ │          │
│  │  │ Sign In   │  │              │  │ Candidates │ │          │
│  │  │ /sign-in  │  │              │  │ /search    │ │          │
│  │  └───────────┘  │              │  └─────┬──────┘ │          │
│  │  ┌───────────┐  │              │        │        │          │
│  │  │ Sign Up   │  │              │  ┌─────┴──────┐ │          │
│  │  │ /sign-up  │  │              │  │  Profile   │ │          │
│  │  └───────────┘  │              │  │  Details   │ │          │
│  │  ┌───────────┐  │              │  │ /search/id │ │          │
│  │  │ Signup    │  │              │  └────────────┘ │          │
│  │  │ Form      │  │              │  ┌────────────┐ │          │
│  │  │ /signup   │  │              │  │ Shortlist  │ │          │
│  │  └───────────┘  │              │  │ /shortlist │ │          │
│  └─────────────────┘              │  └────────────┘ │          │
│                                   └──────────────────┘          │
│                                                                   │
│  👨‍💼 ADMIN AREA                    🔌 API ENDPOINTS              │
│  ┌─────────────────┐              ┌──────────────────┐          │
│  │ Admin Dashboard │              │   Public APIs    │          │
│  │ /admin          │              │  • /api/webhooks │          │
│  └────────┬────────┘              │  • /api/v1/...  │          │
│           │                       └──────────────────┘          │
│  ┌────────┴────────┐              ┌──────────────────┐          │
│  │   Candidates    │              │ Protected APIs   │          │
│  │   Management    │              │  • /api/user/*   │          │
│  │ /admin/         │              │  • /api/admin/*  │          │
│  │ candidates      │              │  • /api/search/* │          │
│  └─────────────────┘              └──────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Hierarchical Site Map

### 🌐 **Public Website**
```
/ (Home)
├── About Us
├── Our Process
├── Case Studies
├── Testimonials
└── Contact Us
```

### 👤 **User Journey**
```
Sign Up → Profile Creation → Admin Approval → Active Profile → Search Access
```

### 🔍 **Search Flow**
```
/search (Browse Candidates)
├── Filter/Search
├── View Profile Cards
├── Click Profile → /search/[id]
│   ├── View Anonymized Info
│   └── Unlock Profile (1 Credit)
└── Save to Shortlist → /search/shortlist
```

### 👨‍💼 **Admin Workflow**
```
/admin (Dashboard)
├── View Pending Candidates
├── /admin/candidates
│   ├── Review Application
│   ├── Approve/Reject → /admin/candidates/[id]/approval
│   └── Edit Details → /admin/candidates/[id]/edit
└── View Analytics
```

### 💳 **Credits System**
```
User Registration → 0 Credits
├── Purchase Credits → /billing
├── Use Credit → Unlock Profile
└── Track Usage → /api/user/credits
```

## Key User Flows

### 1. **Candidate Registration Flow**
```
/signup → Fill Form → Submit → /signup/success → Wait for Approval
```

### 2. **Company Search Flow**
```
/sign-in → /search → Browse → Select → Unlock → Contact
```

### 3. **Admin Approval Flow**
```
/admin → /admin/candidates → Review → Approve/Reject → Update Status
```

## Access Control Matrix

| Route Pattern | Public | Authenticated | Admin Only |
|---------------|--------|---------------|------------|
| `/` | ✅ | ✅ | ✅ |
| `/sign-*` | ✅ | Redirect | Redirect |
| `/signup` | ✅ | ✅ | ✅ |
| `/search` | ❌ | ✅ | ✅ |
| `/profile` | ❌ | ✅ | ✅ |
| `/admin/*` | ❌ | ❌ | ✅ |
| `/api/webhooks/*` | ✅ | ✅ | ✅ |
| `/api/user/*` | ❌ | ✅ | ✅ |
| `/api/admin/*` | ❌ | ❌ | ✅ |

## Technical Implementation Notes

- **Authentication**: Clerk (with middleware protection)
- **Database**: Supabase (PostgreSQL)
- **File Structure**: Next.js 15 App Router
- **API Routes**: RESTful design with `/api/v1/` versioning
- **Dynamic Routes**: `[id]` parameters for resources
- **Protected Routes**: Middleware checks authentication state

## Environment-Specific Routes

### Development Only
- `/test-clerk` - Test Clerk integration
- `/debug-clerk` - Debug authentication
- `/set-admin` - Set admin role (DEV_MODE=true)
- `/admin/simple-admin` - Simplified admin interface

### Production
- All `/test-*` and `/debug-*` routes should be disabled
- `/set-admin` requires proper authentication
- Strict middleware enforcement

## Future Considerations

1. **Mobile App API**: `/api/mobile/v1/*`
2. **Partner Portal**: `/partners/*`
3. **Blog/Resources**: `/resources/*`, `/blog/*`
4. **Help Center**: `/help/*`, `/support/*`
5. **Legal Pages**: `/privacy`, `/terms`, `/cookies`
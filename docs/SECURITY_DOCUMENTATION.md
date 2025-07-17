# Role-Based Access Control (RBAC) Security Documentation

## Overview

This application implements a comprehensive role-based access control system to ensure secure access to features and data based on user roles.

## User Roles

### 1. Admin Role
- **Database Value**: `Admin`
- **UI Display**: `admin`
- **Full Access**: Complete system administration privileges

### 2. Team Member Role  
- **Database Value**: `Team`
- **UI Display**: `viewer`
- **Limited Access**: View and basic editing capabilities

## Permission System

### Data Access Permissions

| Permission | Admin | Team Member | Description |
|------------|-------|-------------|-------------|
| `canViewOpportunities` | ✅ | ✅ | View funding opportunities |
| `canViewApplications` | ✅ | ✅ | View application tracking |
| `canViewAnalytics` | ✅ | ❌ | Access analytics dashboard |
| `canViewUsers` | ✅ | ❌ | View user management |

### Action Permissions

| Permission | Admin | Team Member | Description |
|------------|-------|-------------|-------------|
| `canCreateApplications` | ✅ | ✅ | Create new applications |
| `canEditApplications` | ✅ | ✅ | Edit existing applications |
| `canDeleteApplications` | ✅ | ❌ | Delete applications |
| `canManageUsers` | ✅ | ❌ | Create/edit/delete users |
| `canManageSystem` | ✅ | ❌ | System configuration |

### Feature Permissions

| Permission | Admin | Team Member | Description |
|------------|-------|-------------|-------------|
| `canAccessAdminPanel` | ✅ | ❌ | Access admin panel |
| `canExportData` | ✅ | ❌ | Export system data |
| `canImportData` | ✅ | ❌ | Import external data |
| `canConfigureSystem` | ✅ | ❌ | Configure system settings |

## Security Implementation

### 1. Authentication Layer
- **File**: `src/hooks/useAuth.tsx`
- **Features**:
  - User authentication via Airtable
  - Role-based permission mapping
  - Session persistence
  - Automatic role detection

### 2. Route Protection
- **Component**: `withAuth` HOC
- **Usage**: Wraps components requiring authentication
- **Features**:
  - Redirects unauthenticated users
  - Permission-based access control
  - Graceful error handling

### 3. UI Security Components

#### AdminOnly Component
```jsx
<AdminOnly fallback={<div>Access Denied</div>}>
  <AdminFeature />
</AdminOnly>
```

#### PermissionGate Component
```jsx
<PermissionGate permission="canManageUsers" fallback={<div>No Access</div>}>
  <UserManagement />
</PermissionGate>
```

#### AuthOnly Component
```jsx
<AuthOnly fallback={<LoginForm />}>
  <ProtectedContent />
</AuthOnly>
```

### 4. Navigation Security
- **File**: `src/components/Navigation.tsx`
- **Features**:
  - Role-based menu visibility
  - Permission-based button states
  - Visual role indicators
  - Disabled state for restricted features

### 5. Admin Panel Security
- **File**: `src/components/ProtectedAdminPanel.tsx`
- **Features**:
  - Multi-layer access control
  - Permission-based tab visibility
  - Granular feature protection
  - Security status indicators

## Security Testing

### Test Users

| User | Email | Password | Role | Access Level |
|------|-------|----------|------|--------------|
| Admin User | admin@misionhuascaran.org | admin123 | Admin | Full Access |
| Team Member | team@misionhuascaran.org | team123 | Team | Limited Access |
| Test User | test@example.com | password123 | Team | Limited Access |

### Test Scenarios

1. **Admin Login**:
   - ✅ Can access all features
   - ✅ See admin badge in navigation
   - ✅ Access admin panel
   - ✅ View analytics dashboard
   - ✅ All permissions granted

2. **Team Member Login**:
   - ✅ Can view opportunities and applications
   - ❌ Cannot access admin panel
   - ❌ Cannot view analytics (button disabled)
   - ❌ Cannot manage users or system
   - ✅ Limited permissions clearly indicated

3. **Unauthenticated Access**:
   - ❌ Redirected to login page
   - ❌ No access to protected routes
   - ❌ All features locked

## Security Features

### 1. Role-Based Navigation
- Menu items shown/hidden based on permissions
- Visual indicators for restricted features
- Disabled states for unavailable actions

### 2. Component-Level Protection
- `PermissionGate` wrapper for conditional rendering
- `AdminOnly` wrapper for admin-exclusive content
- `AuthOnly` wrapper for authenticated content

### 3. Route-Level Security
- `withAuth` HOC for protected routes
- Automatic permission checking
- Graceful access denial handling

### 4. Visual Security Indicators
- Role badges in navigation
- Permission status indicators
- Access denied messages
- Security status displays

## Best Practices

### 1. Permission Checking
```jsx
const { hasPermission } = useAuth();

if (hasPermission('canDeleteApplications')) {
  // Show delete button
}
```

### 2. Role Checking
```jsx
const { isAdmin, isTeamMember } = useAuth();

if (isAdmin) {
  // Admin-only features
}
```

### 3. Component Protection
```jsx
<PermissionGate permission="canManageUsers">
  <UserManagementPanel />
</PermissionGate>
```

### 4. Error Handling
```jsx
const { requiresAdmin } = useAuth();

if (!requiresAdmin()) {
  return <AccessDenied />;
}
```

## Security Checklist

- ✅ Role-based authentication implemented
- ✅ Permission system configured
- ✅ UI components protected
- ✅ Navigation secured
- ✅ Admin panel protected
- ✅ Route protection active
- ✅ Visual indicators implemented
- ✅ Error handling in place
- ✅ Test users created
- ✅ Documentation complete

## Future Enhancements

1. **Password Hashing**: Implement bcrypt for password security
2. **Session Management**: Add JWT token-based authentication
3. **Audit Logging**: Track user actions and access attempts
4. **Rate Limiting**: Prevent brute force attacks
5. **Two-Factor Authentication**: Add 2FA for admin accounts
6. **IP Whitelisting**: Restrict admin access by IP
7. **Session Timeout**: Automatic logout after inactivity

## Troubleshooting

### Common Issues

1. **User cannot access admin panel**:
   - Check user role in Airtable Users table
   - Verify role is set to "Admin"
   - Clear browser cache and re-login

2. **Navigation items not showing**:
   - Check user permissions in auth hook
   - Verify role mapping in useAuth.tsx
   - Confirm user is properly authenticated

3. **Permission errors**:
   - Check permission definitions in useAuth.tsx
   - Verify role-permission mapping
   - Ensure user role is correctly assigned

### Debug Commands

```bash
# Test security system
node test-security.js

# Test authentication
node test-auth-fix.js

# Check users in database
node test-users.js
```

## Contact

For security-related questions or issues, contact the system administrator.
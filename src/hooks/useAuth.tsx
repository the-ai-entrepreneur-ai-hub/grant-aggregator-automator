import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define user roles and permissions
export type UserRole = 'admin' | 'viewer';

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

export interface Permission {
  // Data permissions
  canViewOpportunities: boolean;
  canViewApplications: boolean;
  canViewAnalytics: boolean;
  canViewUsers: boolean;
  
  // Action permissions
  canCreateApplications: boolean;
  canEditApplications: boolean;
  canDeleteApplications: boolean;
  canManageUsers: boolean;
  canManageSystem: boolean;
  
  // Feature permissions
  canAccessAdminPanel: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canConfigureSystem: boolean;
}

interface AuthContextType {
  user: User | null;
  permissions: Permission;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
  login: (userData: User) => void;
  logout: () => void;
  hasPermission: (permission: keyof Permission) => boolean;
  requiresAdmin: () => boolean;
  requiresAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    // Data permissions
    canViewOpportunities: true,
    canViewApplications: true,
    canViewAnalytics: true,
    canViewUsers: true,
    
    // Action permissions
    canCreateApplications: true,
    canEditApplications: true,
    canDeleteApplications: true,
    canManageUsers: true,
    canManageSystem: true,
    
    // Feature permissions
    canAccessAdminPanel: true,
    canExportData: true,
    canImportData: true,
    canConfigureSystem: true,
  },
  viewer: {
    // Data permissions
    canViewOpportunities: true,
    canViewApplications: true,
    canViewAnalytics: false,
    canViewUsers: false,
    
    // Action permissions
    canCreateApplications: true,
    canEditApplications: true,
    canDeleteApplications: false,
    canManageUsers: false,
    canManageSystem: false,
    
    // Feature permissions
    canAccessAdminPanel: false,
    canExportData: false,
    canImportData: false,
    canConfigureSystem: false,
  },
};

// Default permissions for unauthenticated users
const DEFAULT_PERMISSIONS: Permission = {
  canViewOpportunities: false,
  canViewApplications: false,
  canViewAnalytics: false,
  canViewUsers: false,
  canCreateApplications: false,
  canEditApplications: false,
  canDeleteApplications: false,
  canManageUsers: false,
  canManageSystem: false,
  canAccessAdminPanel: false,
  canExportData: false,
  canImportData: false,
  canConfigureSystem: false,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission>(DEFAULT_PERMISSIONS);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as User;
        setUser(userData);
        setPermissions(ROLE_PERMISSIONS[userData.role] || DEFAULT_PERMISSIONS);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setPermissions(ROLE_PERMISSIONS[userData.role] || DEFAULT_PERMISSIONS);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setPermissions(DEFAULT_PERMISSIONS);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (permission: keyof Permission): boolean => {
    return permissions[permission];
  };

  const requiresAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const requiresAuth = (): boolean => {
    return user !== null;
  };

  const contextValue: AuthContextType = {
    user,
    permissions,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    isTeamMember: user?.role === 'viewer',
    login,
    logout,
    hasPermission,
    requiresAdmin,
    requiresAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: keyof Permission
) => {
  return (props: P) => {
    const { isAuthenticated, hasPermission, user } = useAuth();

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">
              You don't have permission to access this feature.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Current role: {user?.role || 'Unknown'}
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Component for admin-only content
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
};

// Component for authenticated users only
export const AuthOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

// Component for permission-based content
export const PermissionGate: React.FC<{
  permission: keyof Permission;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};
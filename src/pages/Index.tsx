import React, { useState } from 'react';
import AuthForm from '@/components/AuthForm';
import LandingPage from '@/components/LandingPage';
import Navigation from '@/components/Navigation';
import FundingDashboard from '@/components/FundingDashboard';
import ApplicationTracker from '@/components/ApplicationTracker';
import ProtectedAdminPanel from '@/components/ProtectedAdminPanel';
import { useAuth, User, AdminOnly, PermissionGate } from '@/hooks/useAuth';

const Index = () => {
  const { user, login, logout, isAuthenticated, isAdmin, hasPermission } = useAuth();
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'applications' | 'analytics' | 'admin' | 'profile'>('dashboard');

  const handleLogin = (userData: User) => {
    login(userData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    logout();
    setShowAuth(false);
    setCurrentView('dashboard');
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleBackToLanding = () => {
    setShowAuth(false);
  };

  // Security check for admin panel access
  const handleViewChange = (view: 'dashboard' | 'applications' | 'analytics' | 'admin' | 'profile') => {
    if (view === 'admin' && !hasPermission('canAccessAdminPanel')) {
      alert('Access denied: Admin privileges required');
      return;
    }
    if (view === 'analytics' && !hasPermission('canViewAnalytics')) {
      alert('Access denied: Analytics access not available for your role');
      return;
    }
    setCurrentView(view);
  };

  if (!isAuthenticated && !showAuth) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (!isAuthenticated) {
    return <AuthForm onLogin={handleLogin} onBack={handleBackToLanding} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        userRole={user!.role}
        userName={user!.name}
        onLogout={handleLogout}
      />
      
      <main>
        {currentView === 'dashboard' && (
          <PermissionGate permission="canViewOpportunities">
            <FundingDashboard />
          </PermissionGate>
        )}
        {currentView === 'applications' && (
          <PermissionGate permission="canViewApplications">
            <ApplicationTracker />
          </PermissionGate>
        )}
        {currentView === 'analytics' && (
          <PermissionGate 
            permission="canViewAnalytics" 
            fallback={
              <div className="container mx-auto px-6 py-8">
                <div className="text-center py-20">
                  <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                  <p className="text-muted-foreground">Analytics access is restricted to administrators only.</p>
                </div>
              </div>
            }
          >
            <div className="container mx-auto px-6 py-8">
              <div className="text-center py-20">
                <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Coming soon - Comprehensive reporting and insights</p>
              </div>
            </div>
          </PermissionGate>
        )}
        {currentView === 'admin' && (
          <AdminOnly fallback={
            <div className="container mx-auto px-6 py-8">
              <div className="text-center py-20">
                <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                <p className="text-muted-foreground">Admin panel access is restricted to administrators only.</p>
                <p className="text-sm text-gray-500 mt-2">Current role: {user!.role}</p>
              </div>
            </div>
          }>
            <ProtectedAdminPanel />
          </AdminOnly>
        )}
        {currentView === 'profile' && (
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">User Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                    <div className="text-gray-900 font-medium">{user!.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
                    <div className="text-gray-900">{user!.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
                    <div className="text-gray-900 capitalize">{user!.role === 'admin' ? 'Administrator' : 'Team Member'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Account Status</label>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-gray-900">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
                  <div className="space-y-3">
                    <button className="text-blue-600 hover:text-blue-800 hover:underline block">
                      Change Password
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 hover:underline block">
                      Update Profile Information
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 hover:underline block">
                      Email Preferences
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

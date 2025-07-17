import React from 'react';
import { Database, Plus, Settings, User, Bell, LogOut, FileCheck, BarChart3, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, PermissionGate } from '@/hooks/useAuth';

interface NavigationProps {
  currentView: 'dashboard' | 'applications' | 'analytics' | 'admin' | 'profile';
  onViewChange: (view: 'dashboard' | 'applications' | 'analytics' | 'admin' | 'profile') => void;
  userRole: 'admin' | 'viewer';
  userName: string;
  onLogout: () => void;
}

export default function Navigation({ currentView, onViewChange, userRole, userName, onLogout }: NavigationProps) {
  const { hasPermission, isAdmin } = useAuth();
  return (
    <nav className="bg-card border-b border-border shadow-soft">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">Misión Huascarán</h1>
                <p className="text-xs text-muted-foreground">Grant Aggregator System</p>
              </div>
              {isAdmin && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <PermissionGate permission="canViewOpportunities">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => onViewChange('dashboard')}
                className="interactive-scale"
              >
                <Database className="h-4 w-4 mr-2" />
                Opportunities
              </Button>
            </PermissionGate>

            <PermissionGate permission="canViewApplications">
              <Button
                variant={currentView === 'applications' ? 'default' : 'ghost'}
                onClick={() => onViewChange('applications')}
                className="interactive-scale"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Applications
              </Button>
            </PermissionGate>

            <PermissionGate 
              permission="canViewAnalytics"
              fallback={
                <Button
                  variant="ghost"
                  className="interactive-scale opacity-50 cursor-not-allowed"
                  disabled
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                  <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
                </Button>
              }
            >
              <Button
                variant={currentView === 'analytics' ? 'default' : 'ghost'}
                onClick={() => onViewChange('analytics')}
                className="interactive-scale"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </PermissionGate>

            <PermissionGate permission="canAccessAdminPanel">
              <Button
                variant={currentView === 'admin' ? 'default' : 'ghost'}
                onClick={() => onViewChange('admin')}
                className="interactive-scale"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </PermissionGate>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative interactive-scale">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <DropdownMenuItem className="p-4 border-b">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">New Grant Opportunity</p>
                        <p className="text-xs text-gray-500">Gates Foundation - Rural Development Initiative deadline in 5 days</p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-4 border-b">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Application Deadline Alert</p>
                        <p className="text-xs text-gray-500">World Bank Climate Fund - Submit by tomorrow</p>
                        <p className="text-xs text-gray-400">1 day ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Application Approved</p>
                        <p className="text-xs text-gray-500">Your application to EcoLife Fund has been approved!</p>
                        <p className="text-xs text-gray-400">3 days ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                <div className="p-4 border-t">
                  <button className="text-sm text-blue-600 hover:text-blue-800">View all notifications</button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 interactive-scale">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {userRole}
                      {isAdmin && <span className="ml-1 text-blue-500">• Admin</span>}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onViewChange('profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-3 gap-1">
            <PermissionGate permission="canViewOpportunities">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('dashboard')}
                className="text-xs"
              >
                Opportunities
              </Button>
            </PermissionGate>
            <PermissionGate permission="canViewApplications">
              <Button
                variant={currentView === 'applications' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('applications')}
                className="text-xs"
              >
                Applications
              </Button>
            </PermissionGate>
            <PermissionGate 
              permission="canViewAnalytics"
              fallback={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs opacity-50 cursor-not-allowed"
                  disabled
                >
                  Analytics
                </Button>
              }
            >
              <Button
                variant={currentView === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('analytics')}
                className="text-xs"
              >
                Analytics
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>
    </nav>
  );
}
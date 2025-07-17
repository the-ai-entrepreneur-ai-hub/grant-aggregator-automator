import React from 'react';
import { Shield, Users, Settings, Database, AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, PermissionGate } from '@/hooks/useAuth';
import AdminPanel from './AdminPanel';

const ProtectedAdminPanel: React.FC = () => {
  const { user, hasPermission, isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to access the admin panel. This section is restricted to administrators only.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current User:</span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Role:</span>
                  <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role === 'admin' ? 'Administrator' : 'Team Member'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                If you believe this is an error, please contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-500">System Administration & Configuration</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">
              <PermissionGate permission="canManageUsers">
                User Management
              </PermissionGate>
            </TabsTrigger>
            <TabsTrigger value="system">
              <PermissionGate permission="canManageSystem">
                System Config
              </PermissionGate>
            </TabsTrigger>
            <TabsTrigger value="data">
              <PermissionGate permission="canImportData">
                Data Management
              </PermissionGate>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Admin Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>User Management</span>
                      {hasPermission('canManageUsers') ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>System Config</span>
                      {hasPermission('canManageSystem') ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Data Import/Export</span>
                      {hasPermission('canImportData') ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Security Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Role-based access active
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin privileges verified
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Session authenticated
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <PermissionGate permission="canManageUsers">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Manage Users
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission="canExportData">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Database className="h-3 w-3 mr-1" />
                        Export Data
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission="canConfigureSystem">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Settings className="h-3 w-3 mr-1" />
                        System Config
                      </Button>
                    </PermissionGate>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Airtable API: Connected
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Auth System: Active
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Data Sync: Operational
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Admin Panel Access</CardTitle>
              </CardHeader>
              <CardContent>
                <PermissionGate 
                  permission="canAccessAdminPanel"
                  fallback={
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <p className="text-gray-600">Full admin panel access not available</p>
                    </div>
                  }
                >
                  <AdminPanel />
                </PermissionGate>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <PermissionGate 
              permission="canManageUsers"
              fallback={
                <Card>
                  <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">User management requires special permissions</p>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">User management features will be implemented here.</p>
                </CardContent>
              </Card>
            </PermissionGate>
          </TabsContent>

          <TabsContent value="system">
            <PermissionGate 
              permission="canManageSystem"
              fallback={
                <Card>
                  <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">System configuration requires special permissions</p>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">System configuration options will be implemented here.</p>
                </CardContent>
              </Card>
            </PermissionGate>
          </TabsContent>

          <TabsContent value="data">
            <PermissionGate 
              permission="canImportData"
              fallback={
                <Card>
                  <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Data management requires special permissions</p>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Data import/export features will be implemented here.</p>
                </CardContent>
              </Card>
            </PermissionGate>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProtectedAdminPanel;
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Shield, Users, Mountain, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { airtableAPI, withErrorHandling } from '@/lib/airtable';

interface AuthFormProps {
  onLogin: (userData: { name: string; email: string; role: 'admin' | 'viewer' }) => void;
  onBack?: () => void;
}

export default function AuthForm({ onLogin, onBack }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as 'admin' | 'viewer'
  });
  const [selectedRole, setSelectedRole] = useState<'admin' | 'viewer'>('viewer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isLogin && !formData.name) {
      alert('Please enter your full name');
      return;
    }

    try {
      if (isLogin) {
        // Login with Airtable Users table
        const user = await withErrorHandling(() => airtableAPI.authenticateUser(formData.email, formData.password));
        
        if (user) {
          const userData = {
            name: user.fields['Full Name'],
            email: user.fields['Email'],
            role: user.fields['Role'].toLowerCase() === 'admin' ? 'admin' : 'viewer'
          };
          onLogin(userData);
        } else {
          throw new Error('Authentication failed');
        }
      } else {
        // Register new user
        const existingUser = await withErrorHandling(() => airtableAPI.getUserByEmail(formData.email));
        
        if (existingUser) {
          alert('An account with this email already exists. Please use a different email or sign in instead.');
          return;
        }

        const newUser = await withErrorHandling(() => airtableAPI.createUser({
          'Email': formData.email,
          'Password Hash': formData.password, // In production, hash this
          'Full Name': formData.name,
          'Role': selectedRole === 'admin' ? 'Admin' : 'Team',
          'Created Date': new Date().toISOString().split('T')[0],
          'Status': 'Active',
          'Email Verified': false
        }));

        if (newUser) {
          const userData = {
            name: newUser.fields['Full Name'],
            email: newUser.fields['Email'],
            role: selectedRole
          };
          onLogin(userData);
        } else {
          throw new Error('Registration failed');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {onBack && (
          <div className="mb-6">
            <Button 
              onClick={onBack} 
              variant="ghost" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        )}
        
        <div className="text-center mb-8">
          <div className="relative inline-block animate-pulse">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg">
              <Mountain className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
          </div>
          <h1 className="text-3xl font-bold mt-4 text-gray-900">Misión Huascarán</h1>
          <p className="text-gray-600">Grant Management Portal</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 text-center">Select Your Role</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setSelectedRole('admin')} 
                  variant={selectedRole === 'admin' ? 'default' : 'outline'}
                  className={selectedRole === 'admin' 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
                    : "border-blue-200 text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  }
                >
                  <Shield className="mr-2 h-4 w-4" /> Admin
                </Button>
                <Button 
                  onClick={() => setSelectedRole('viewer')} 
                  variant={selectedRole === 'viewer' ? 'default' : 'outline'}
                  className={selectedRole === 'viewer' 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
                    : "border-blue-200 text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  }
                >
                  <Users className="mr-2 h-4 w-4" /> Team
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {selectedRole === 'admin' 
                  ? 'Full access to all features and data management' 
                  : 'Access to view opportunities and submit applications'
                }
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="bg-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium">Account Details</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="relative animate-in fade-in slide-in-from-left-2 duration-300">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                  <Input 
                    type="text" 
                    placeholder="Full Name" 
                    className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12 bg-white/50 backdrop-blur-sm transform focus:scale-105 transition-all duration-200"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12 bg-white/50 backdrop-blur-sm transform focus:scale-105 transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Password" 
                  className="pl-10 pr-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12 bg-white/50 backdrop-blur-sm transform focus:scale-105 transition-all duration-200"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {isLogin ? 'Access Dashboard' : 'Create Account'}
              </Button>
            </form>
            
            <p className="text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
            
            {isLogin && (
              <p className="text-center text-sm">
                <button 
                  onClick={() => alert('Password reset functionality will be implemented with the Users table in Airtable. Please contact admin@misionhuascaran.org for assistance.')}
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { airtableAPI } from '@/lib/airtable';

const DebugPanel = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      addResult('🔄 Testing Airtable connection...');
      const opportunities = await airtableAPI.getFundingOpportunities({ maxRecords: 3 });
      addResult(`✅ Connection successful! Found ${opportunities.length} opportunities`);
    } catch (error) {
      addResult(`❌ Connection failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testAuth = async () => {
    setIsLoading(true);
    try {
      addResult('🔐 Testing authentication...');
      const user = await airtableAPI.authenticateUser('admin@misionhuascaran.org', 'admin123');
      addResult(`✅ Authentication successful: ${user.fields['Full Name']} (${user.fields.Role})`);
    } catch (error) {
      addResult(`❌ Authentication failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testUserLookup = async () => {
    setIsLoading(true);
    try {
      addResult('👤 Looking up admin user...');
      const user = await airtableAPI.getUserByEmail('admin@misionhuascaran.org');
      if (user) {
        addResult(`✅ User found: ${user.fields['Full Name']} (${user.fields.Role})`);
        addResult(`🔑 Password hash: ${user.fields['Password Hash']}`);
      } else {
        addResult('❌ User not found');
      }
    } catch (error) {
      addResult(`❌ User lookup failed: ${error}`);
    }
    setIsLoading(false);
  };

  const checkEnvVars = () => {
    addResult('🔧 Checking environment variables...');
    addResult(`Environment Mode: ${import.meta.env.MODE}`);
    addResult(`Is Production: ${import.meta.env.PROD}`);
    addResult(`Is Development: ${import.meta.env.DEV}`);
    addResult(`API Key: ${import.meta.env.VITE_AIRTABLE_API_KEY ? '✅ Set' : '❌ Missing'}`);
    addResult(`Base ID: ${import.meta.env.VITE_AIRTABLE_BASE_ID ? '✅ Set' : '❌ Missing'}`);
    addResult(`Table Name: ${import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Using fallback'}`);
    
    if (!import.meta.env.VITE_AIRTABLE_API_KEY || !import.meta.env.VITE_AIRTABLE_BASE_ID) {
      addResult('');
      addResult('🔧 TO FIX THIS ON NETLIFY:');
      addResult('1. Go to Netlify Dashboard > Site Settings > Environment Variables');
      addResult('2. Add: VITE_AIRTABLE_API_KEY = patrTARcp2imegWXX.760ec1e9aac667cdaf735ba6b36bfc3e00270da1d116fcfbd5fbc77b103577e0');
      addResult('3. Add: VITE_AIRTABLE_BASE_ID = appR8MwS1pQs7Bnga');
      addResult('4. Add: VITE_AIRTABLE_TABLE_NAME = Funding Opportunities');
      addResult('5. Redeploy your site');
    }
    
    addResult(`All env vars: ${Object.keys(import.meta.env).join(', ')}`);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={checkEnvVars} variant="outline" size="sm">
            Check Env Vars
          </Button>
          <Button onClick={testConnection} disabled={isLoading} size="sm">
            Test Connection
          </Button>
          <Button onClick={testUserLookup} disabled={isLoading} size="sm">
            Test User Lookup
          </Button>
          <Button onClick={testAuth} disabled={isLoading} size="sm">
            Test Auth
          </Button>
          <Button onClick={clearResults} variant="outline" size="sm">
            Clear
          </Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          {results.length === 0 ? (
            <p className="text-gray-500">No tests run yet</p>
          ) : (
            <div className="space-y-1 text-sm font-mono">
              {results.map((result, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <strong>Quick Test Credentials:</strong>
          <br />
          Email: admin@misionhuascaran.org
          <br />
          Password: admin123
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
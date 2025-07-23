import { useState, useEffect } from 'react';
import { GrantOpportunity, airtableService } from '../services/airtable';

const GrantAggregator = () => {
  const [grants, setGrants] = useState<GrantOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      setLoading(true);
      const data = await airtableService.getAllGrants();
      setGrants(data);
    } catch (err) {
      setError('Failed to fetch grants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Available Grants
        </h2>
        
        {grants.length === 0 ? (
          <p className="text-gray-500">No grants available at the moment.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {grants.map((grant) => (
              <div key={grant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {grant['Grant Name']}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {grant['Description']}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    ${grant['Amount']?.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {grant['Deadline']}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantAggregator;
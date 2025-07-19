import React, { useState, useEffect } from 'react';
import { Target, DollarSign, FileText, Calendar, ExternalLink, RefreshCw, Search, Filter, AlertTriangle, SlidersHorizontal, MapPin, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { airtableAPI, formatters, withErrorHandling, type FundingOpportunity } from '@/lib/airtable';

interface DashboardStats {
  totalOpportunities: number;
  urgentOpportunities: number;
  totalFunding: number;
  activeApplications: number;
}

export default function FundingDashboard() {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOpportunities: 0,
    urgentOpportunities: 0,
    totalFunding: 0,
    activeApplications: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'amount' | 'ranking' | 'alphabetical'>('deadline');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterAmount, setFilterAmount] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 18; // 6 rows × 3 cards per row

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Direct API call to get funding opportunities
      const response = await fetch(`https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Funding Opportunities`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const opportunitiesData = data.records || [];
      
      // Calculate stats from the data
      const totalFunding = opportunitiesData.reduce((sum: number, opp: any) => {
        return sum + (opp.fields['Typical Grant Size'] || 0);
      }, 0);

      const urgentOpportunities = opportunitiesData.filter((opp: any) => {
        const daysUntil = opp.fields['Days Until Deadline'] || 0;
        return daysUntil <= 30 && daysUntil > 0;
      }).length;
      
      setOpportunities(opportunitiesData);
      setStats({
        totalOpportunities: opportunitiesData.length,
        urgentOpportunities: urgentOpportunities,
        totalFunding: totalFunding,
        activeApplications: 8 // This would need to come from Applications table
      });
    } catch (err) {
      setError('Failed to load data from Airtable');
      console.error('Dashboard loading error:', err);
      
      // Show empty state instead of fallback data
      setOpportunities([]);
      setStats({
        totalOpportunities: 0,
        urgentOpportunities: 0,
        totalFunding: 0,
        activeApplications: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleApplyNow = (applicationLink: string | undefined, funderName: string) => {
    if (applicationLink) {
      window.open(applicationLink, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Application link not available for ${funderName}. Please visit their website directly.`);
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const funderName = opp.fields['Funder Name'] || '';
    const title = opp.fields['Opportunity Title'] || '';
    const description = opp.fields['Opportunity Description'] || '';
    const supportType = opp.fields['Support Type'] || '';
    const programAreas = opp.fields['Program Area'] || [];
    const grantSize = opp.fields['Typical Grant Size'] || 0;
    
    // Search filter
    const matchesSearch = funderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = filterType === 'all' || supportType === filterType;
    
    // Sector filter
    const matchesSector = filterSector === 'all' || programAreas.some((area: string) => area === filterSector);
    
    // Amount filter
    const matchesAmount = filterAmount === 'all' || 
      (filterAmount === 'small' && grantSize < 50000) ||
      (filterAmount === 'medium' && grantSize >= 50000 && grantSize < 200000) ||
      (filterAmount === 'large' && grantSize >= 200000);
    
    return matchesSearch && matchesType && matchesSector && matchesAmount;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        const aDate = new Date(a.fields['Close Date'] || '').getTime();
        const bDate = new Date(b.fields['Close Date'] || '').getTime();
        return aDate - bDate;
      case 'amount':
        return (b.fields['Typical Grant Size'] || 0) - (a.fields['Typical Grant Size'] || 0);
      case 'ranking':
        return (b.fields['Ranking Score'] || 0) - (a.fields['Ranking Score'] || 0);
      case 'alphabetical':
        return (a.fields['Funder Name'] || '').localeCompare(b.fields['Funder Name'] || '');
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE);
  const displayedOpportunities = filteredOpportunities.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMore = currentPage < totalPages;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 500); // Simulate loading delay
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchTerm, sortBy, filterType, filterSector, filterAmount]);

  const getUrgencyBadge = (closeDate: string) => {
    if (!closeDate) return null;
    const days = formatters.daysUntilDeadline(closeDate);
    if (days <= 7) return { text: 'Urgent', color: 'bg-red-500' };
    if (days <= 14) return { text: 'Soon', color: 'bg-yellow-500' };
    return null;
  };

  const getSupportTypeColor = (type: string) => {
    switch (type) {
      case 'Grant': return 'bg-blue-500';
      case 'Fellowship': return 'bg-purple-500';
      case 'Contest': return 'bg-green-500';
      case 'Prize': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Funding Dashboard</h1>
              <p className="text-gray-600">Welcome to the Misión Huascarán Grant Management System</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Opportunities</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading ? '...' : stats.totalOpportunities}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Funding</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : formatters.currency(stats.totalFunding)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Applications</p>
                <p className="text-2xl font-bold text-purple-600">
                  {isLoading ? '...' : stats.activeApplications}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Search & Filter Opportunities</h2>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Advanced Filters</span>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by funder, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sort By */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Sort By</h3>
                  </div>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="bg-white border-blue-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deadline">Deadline (Urgent First)</SelectItem>
                      <SelectItem value="amount">Grant Amount (High to Low)</SelectItem>
                      <SelectItem value="ranking">Match Score (Best First)</SelectItem>
                      <SelectItem value="alphabetical">Funder Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {/* Support Type */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <h3 className="font-medium text-green-900">Support Type</h3>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="bg-white border-green-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Grant">Grant</SelectItem>
                      <SelectItem value="Fellowship">Fellowship</SelectItem>
                      <SelectItem value="Contest">Contest</SelectItem>
                      <SelectItem value="Prize">Prize</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {/* Sector */}
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <h3 className="font-medium text-purple-900">Sector</h3>
                  </div>
                  <Select value={filterSector} onValueChange={setFilterSector}>
                    <SelectTrigger className="bg-white border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Community Development">Community Development</SelectItem>
                      <SelectItem value="Economic Development">Economic Development</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {/* Grant Amount */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <h3 className="font-medium text-orange-900">Grant Size</h3>
                  </div>
                  <Select value={filterAmount} onValueChange={setFilterAmount}>
                    <SelectTrigger className="bg-white border-orange-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Amounts</SelectItem>
                      <SelectItem value="small">Small (&lt; $50K)</SelectItem>
                      <SelectItem value="medium">Medium ($50K - $200K)</SelectItem>
                      <SelectItem value="large">Large ($200K+)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
            
            {/* Active Filters Display */}
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-blue-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterType !== 'all' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Type: {filterType}
                  <button 
                    onClick={() => setFilterType('all')}
                    className="ml-2 hover:text-green-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterSector !== 'all' && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Sector: {filterSector}
                  <button 
                    onClick={() => setFilterSector('all')}
                    className="ml-2 hover:text-purple-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterAmount !== 'all' && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Amount: {filterAmount}
                  <button 
                    onClick={() => setFilterAmount('all')}
                    className="ml-2 hover:text-orange-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoading ? 'Loading Opportunities...' : `${filteredOpportunities.length} Grant Opportunities`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isLoading ? 'Please wait...' : `Showing ${displayedOpportunities.length} of ${filteredOpportunities.length} opportunities`}
            </p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedOpportunities.map((opportunity) => {
                    const fields = opportunity.fields;
                    const urgencyBadge = getUrgencyBadge(fields['Close Date']);
                    const supportTypeColor = getSupportTypeColor(fields['Support Type']);
                    const description = fields['Opportunity Description'] || 'No description available';
                    const truncatedDescription = description.length > 120 ? description.substring(0, 120) + '...' : description;
                    
                    return (
                      <div 
                        key={opportunity.id} 
                        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 overflow-hidden group"
                      >
                        {/* Card Header */}
                        <div className="p-6 pb-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {fields['Funder Name'] || 'Unknown Funder'}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {fields['Opportunity Title'] || 'No title available'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <span className={`${supportTypeColor} text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm`}>
                                {fields['Support Type'] || 'Grant'}
                              </span>
                              {urgencyBadge && (
                                <span className={`${urgencyBadge.color} text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse`}>
                                  {urgencyBadge.text}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="px-6 pb-4">
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {truncatedDescription}
                          </p>
                          
                          {/* Funding Amount */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                              <span className="text-lg font-bold text-green-600">
                                {fields['Typical Grant Size'] 
                                  ? formatters.currency(fields['Typical Grant Size'])
                                  : 'Amount TBD'
                                }
                              </span>
                            </div>
                            {fields['Ranking Score'] && (
                              <div className="flex items-center">
                                <Award className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm font-medium text-yellow-600">
                                  {Math.round(fields['Ranking Score'])}% match
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Deadline */}
                          {fields['Close Date'] && (
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Deadline: {formatters.date(fields['Close Date'])}</span>
                              <span className="ml-2 text-xs text-gray-400">
                                ({formatters.daysUntilDeadline(fields['Close Date'])} days left)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="px-6 pb-6">
                          <Button
                            onClick={() => handleApplyNow(fields['Application Link'], fields['Funder Name'] || 'Unknown')}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                          >
                            <ExternalLink className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoadingMore ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Loading...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Load More ({filteredOpportunities.length - displayedOpportunities.length} remaining)
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {filteredOpportunities.length === 0 && !isLoading && (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 max-w-md mx-auto">
                      <Search className="h-16 w-16 mx-auto text-gray-400 mb-6" />
                      <p className="text-xl font-semibold text-gray-600 mb-2">No opportunities found</p>
                      <p className="text-gray-500">Try adjusting your search filters or search terms</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
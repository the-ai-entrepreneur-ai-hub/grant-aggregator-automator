import React, { useState } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Save, X, CheckCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface FundingSource {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive';
  lastScraped: string;
  opportunities: number;
}

interface RankingCriteria {
  missionAlignment: number;
  fundingSize: number;
  deadline: number;
  successRate: number;
  applicationComplexity: number;
}

const sampleSources: FundingSource[] = [
  {
    id: '1',
    name: 'Gates Foundation',
    url: 'https://gatesfoundation.org/grants',
    status: 'active',
    lastScraped: '2024-01-15T10:30:00Z',
    opportunities: 12
  },
  {
    id: '2',
    name: 'USAID Opportunities',
    url: 'https://usaid.gov/grants',
    status: 'active',
    lastScraped: '2024-01-14T15:20:00Z',
    opportunities: 8
  },
  {
    id: '3',
    name: 'Ford Foundation',
    url: 'https://fordfoundation.org/grants',
    status: 'inactive',
    lastScraped: '2024-01-10T09:15:00Z',
    opportunities: 5
  }
];

export default function AdminPanel() {
  const [sources, setSources] = useState<FundingSource[]>(sampleSources);
  const [rankingCriteria, setRankingCriteria] = useState<RankingCriteria>({
    missionAlignment: 40,
    fundingSize: 30,
    deadline: 15,
    successRate: 10,
    applicationComplexity: 5
  });
  const [newSource, setNewSource] = useState({ name: '', url: '' });
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const { toast } = useToast();

  const handleAddSource = () => {
    if (!newSource.name || !newSource.url) {
      toast({
        title: "Validation Error",
        description: "Please provide both name and URL for the funding source.",
        variant: "destructive"
      });
      return;
    }

    try {
      new URL(newSource.url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid URL for the funding source.",
        variant: "destructive"
      });
      return;
    }

    const source: FundingSource = {
      id: Date.now().toString(),
      name: newSource.name,
      url: newSource.url,
      status: 'active',
      lastScraped: new Date().toISOString(),
      opportunities: 0
    };

    setSources([...sources, source]);
    setNewSource({ name: '', url: '' });
    setIsAddingSource(false);
    
    toast({
      title: "Source Added",
      description: `${newSource.name} has been added successfully.`,
    });
  };

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
    toast({
      title: "Source Deleted",
      description: "The funding source has been removed.",
    });
  };

  const handleUpdateCriteria = () => {
    const total = Object.values(rankingCriteria).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      toast({
        title: "Validation Error",
        description: "Ranking criteria weights must total 100%.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Criteria Updated",
      description: "Ranking criteria have been saved successfully.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 animate-slide-in-bottom">
        <h1 className="text-3xl font-bold text-gradient-primary mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage funding sources, ranking criteria, and system settings</p>
      </div>

      <Tabs defaultValue="sources" className="space-y-6 animate-fade-in-staggered">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sources" className="tab-slide">Funding Sources</TabsTrigger>
          <TabsTrigger value="criteria" className="tab-slide">Ranking Criteria</TabsTrigger>
          <TabsTrigger value="manual" className="tab-slide">Manual Entry</TabsTrigger>
        </TabsList>

        {/* Funding Sources Tab */}
        <TabsContent value="sources" className="space-y-6 animate-slide-in-right">
          <Card className="card-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Funding Sources</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage websites and data sources for opportunity discovery
                </p>
              </div>
              <Button 
                onClick={() => setIsAddingSource(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Source Form */}
              {isAddingSource && (
                <Card className="border-2 border-primary/20 bg-primary-light/10">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="field-reveal stagger-1">
                        <label className="block text-sm font-medium mb-2">Source Name</label>
                        <Input
                          placeholder="e.g., Gates Foundation"
                          value={newSource.name}
                          onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                          className="glow-focus"
                        />
                      </div>
                      <div className="field-reveal stagger-2">
                        <label className="block text-sm font-medium mb-2">Website URL</label>
                        <Input
                          placeholder="https://example.org/grants"
                          value={newSource.url}
                          onChange={(e) => setNewSource({...newSource, url: e.target.value})}
                          className="glow-focus"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 field-reveal stagger-3">
                      <Button onClick={handleAddSource} className="btn-primary btn-pulse">
                        <Save className="h-4 w-4 mr-2" />
                        Save Source
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddingSource(false)}
                        className="interactive-scale"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sources List */}
              <div className="space-y-3">
                {sources.map((source) => (
                  <Card key={source.id} className="card-elegant">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{source.name}</h3>
                            <Badge 
                              className={source.status === 'active' ? 'badge-success' : ''}
                              variant={source.status === 'active' ? 'default' : 'secondary'}
                            >
                              {source.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              {source.url}
                            </span>
                            <span>Last scraped: {formatDate(source.lastScraped)}</span>
                            <span>{source.opportunities} opportunities</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(source.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSource(source.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranking Criteria Tab */}
        <TabsContent value="criteria" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Ranking Criteria Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adjust the weights for different factors in opportunity ranking (must total 100%)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mission Alignment: {rankingCriteria.missionAlignment}%
                  </label>
                  <Slider
                    value={[rankingCriteria.missionAlignment]}
                    onValueChange={(value) => 
                      setRankingCriteria({...rankingCriteria, missionAlignment: value[0]})
                    }
                    max={100}
                    min={0}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How well the funder's focus matches your NGO's mission
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Funding Size: {rankingCriteria.fundingSize}%
                  </label>
                  <Slider
                    value={[rankingCriteria.fundingSize]}
                    onValueChange={(value) => 
                      setRankingCriteria({...rankingCriteria, fundingSize: value[0]})
                    }
                    max={100}
                    min={0}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Size of the grant or funding amount
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Deadline Urgency: {rankingCriteria.deadline}%
                  </label>
                  <Slider
                    value={[rankingCriteria.deadline]}
                    onValueChange={(value) => 
                      setRankingCriteria({...rankingCriteria, deadline: value[0]})
                    }
                    max={100}
                    min={0}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How soon the application deadline approaches
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Success Rate: {rankingCriteria.successRate}%
                  </label>
                  <Slider
                    value={[rankingCriteria.successRate]}
                    onValueChange={(value) => 
                      setRankingCriteria({...rankingCriteria, successRate: value[0]})
                    }
                    max={100}
                    min={0}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Historical success rate for similar organizations
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Application Complexity: {rankingCriteria.applicationComplexity}%
                  </label>
                  <Slider
                    value={[rankingCriteria.applicationComplexity]}
                    onValueChange={(value) => 
                      setRankingCriteria({...rankingCriteria, applicationComplexity: value[0]})
                    }
                    max={100}
                    min={0}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ease of application process (lower complexity = higher weight)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm">
                  <span className="font-medium">Total: </span>
                  <span className={
                    Object.values(rankingCriteria).reduce((sum, val) => sum + val, 0) === 100 
                      ? 'text-success font-medium' 
                      : 'text-destructive font-medium'
                  }>
                    {Object.values(rankingCriteria).reduce((sum, val) => sum + val, 0)}%
                  </span>
                </div>
                <Button onClick={handleUpdateCriteria} className="btn-primary">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Criteria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Manual Opportunity Entry</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add funding opportunities manually when they can't be automatically discovered
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Funder Name *</label>
                  <Input placeholder="e.g., MacArthur Foundation" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website URL</label>
                  <Input placeholder="https://foundation.org" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type of Support *</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grant">Grant</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                      <SelectItem value="contest">Contest</SelectItem>
                      <SelectItem value="fellowship">Fellowship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Funding Amount</label>
                  <Input placeholder="e.g., $50,000 - $200,000" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Open Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Close Date *</label>
                  <Input type="date" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Brief Description *</label>
                <Textarea 
                  placeholder="Describe the funding opportunity, eligibility criteria, and focus areas..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Application Link *</label>
                <Input placeholder="https://foundation.org/apply" />
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Opportunity
                </Button>
                <Button variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
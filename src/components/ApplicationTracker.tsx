import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, AlertTriangle, User, Calendar, DollarSign, FileText, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { airtableAPI, formatters, withErrorHandling, type Application } from '@/lib/airtable';

interface ApplicationTrackerProps {
  opportunities?: any[];
}

export default function ApplicationTracker({ opportunities = [] }: ApplicationTrackerProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // New application form state
  const [newApplication, setNewApplication] = useState({
    opportunityId: '',
    internalReference: '',
    status: 'Identified' as Application['fields']['Status'],
    priority: 'Medium' as Application['fields']['Priority'],
    leadPerson: '',
    projectTitle: '',
    requestedAmount: '',
    internalDeadline: '',
    submissionDeadline: '',
    notes: ''
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await withErrorHandling(() => airtableAPI.getActiveApplications()) || [];
      setApplications(data);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Applications loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createApplication = async () => {
    try {
      // Validate required fields
      if (!newApplication.internalReference || !newApplication.projectTitle || !newApplication.leadPerson) {
        alert('Please fill in all required fields: Internal Reference, Project Title, and Lead Person');
        return;
      }

      const applicationData: Application['fields'] = {
        'Internal Reference': newApplication.internalReference,
        'Status': newApplication.status,
        'Priority': newApplication.priority,
        'Lead Person': newApplication.leadPerson,
        'Project Title': newApplication.projectTitle,
        'Requested Amount': parseFloat(newApplication.requestedAmount) || undefined,
        'Internal Deadline': newApplication.internalDeadline || undefined,
        'Submission Deadline': newApplication.submissionDeadline || undefined
      };

      // Direct API call to create application
      const response = await fetch(`https://api.airtable.com/v0/appR8MwS1pQs7Bnga/Applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer patrTARcp2imegWXX.6c00ccdd82f0b1fa64b9a837e3e3218fb87a7f0b29896644c51ea2c24f66b0a3`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: applicationData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const created = await response.json();
      
      if (created) {
        setApplications(prev => [...prev, created]);
        setIsCreateDialogOpen(false);
        resetForm();
        alert('Application created successfully!');
      }
    } catch (err) {
      console.error('Failed to create application:', err);
      alert('Failed to create application. Please try again.');
    }
  };

  const updateApplicationStatus = async (id: string, status: Application['fields']['Status']) => {
    try {
      const updated = await airtableAPI.updateApplication(id, { Status: status });
      if (updated) {
        setApplications(prev => 
          prev.map(app => app.id === id ? { ...app, fields: { ...app.fields, Status: status } } : app)
        );
      }
    } catch (err) {
      console.error('Failed to update application:', err);
    }
  };

  const resetForm = () => {
    setNewApplication({
      opportunityId: '',
      internalReference: '',
      status: 'Identified',
      priority: 'Medium',
      leadPerson: '',
      projectTitle: '',
      requestedAmount: '',
      internalDeadline: '',
      submissionDeadline: '',
      notes: ''
    });
  };

  const filteredApplications = applications.filter(app => {
    if (selectedStatus === 'all') return true;
    return app.fields.Status === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Researching': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Submitted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Under Review': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercent = (status: string) => {
    const progressMap = {
      'Identified': 10,
      'Researching': 25,
      'Preparing': 50,
      'Submitted': 75,
      'Under Review': 85,
      'Approved': 100,
      'Rejected': 0
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'badge-urgent';
      case 'High': return 'badge-harvest';
      case 'Medium': return 'badge-rural';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'badge-rural';
    }
  };

  const statusOptions = ['Identified', 'Researching', 'Preparing', 'Submitted', 'Under Review', 'Approved', 'Rejected'];

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-rural-heading">Application Tracker</h1>
          <p className="text-rural-subheading mt-2">
            Manage your grant applications from discovery to outcome
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Application</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="internalRef">Internal Reference</Label>
                <Input
                  id="internalRef"
                  value={newApplication.internalReference}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, internalReference: e.target.value }))}
                  placeholder="MH-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="leadPerson">Lead Person</Label>
                <Input
                  id="leadPerson"
                  value={newApplication.leadPerson}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, leadPerson: e.target.value }))}
                  placeholder="Team member name"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  value={newApplication.projectTitle}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, projectTitle: e.target.value }))}
                  placeholder="Rural Education Initiative"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newApplication.status} onValueChange={(value) => setNewApplication(prev => ({ ...prev, status: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newApplication.priority} onValueChange={(value) => setNewApplication(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="requestedAmount">Requested Amount ($)</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  value={newApplication.requestedAmount}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, requestedAmount: e.target.value }))}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="submissionDeadline">Submission Deadline</Label>
                <Input
                  id="submissionDeadline"
                  type="date"
                  value={newApplication.submissionDeadline}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, submissionDeadline: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createApplication} className="btn-primary">
                Create Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <Card className="card-organic mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Label>Filter by Status:</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {filteredApplications.length} applications found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Grid */}
      {error && (
        <Card className="card-organic border-destructive mb-6">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-organic">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-6 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredApplications.map((application) => {
            const fields = application.fields;
            const daysToDeadline = fields['Submission Deadline'] ? 
              formatters.daysUntilDeadline(fields['Submission Deadline']) : null;
            
            return (
              <Card key={application.id} className="card-organic hover-grow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Application Info */}
                    <div className="lg:col-span-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                            {fields['Project Title'] || 'Untitled Project'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {fields['Internal Reference']}
                          </p>
                        </div>
                        <Badge className={getPriorityColor(fields.Priority || 'Medium')}>
                          {fields.Priority}
                        </Badge>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{getProgressPercent(fields.Status || 'Identified')}%</span>
                        </div>
                        <Progress value={getProgressPercent(fields.Status || 'Identified')} className="h-2" />
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {fields['Lead Person'] && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{fields['Lead Person']}</span>
                          </div>
                        )}
                        {fields['Requested Amount'] && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatters.currency(fields['Requested Amount'])}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="lg:col-span-3">
                      <div className="space-y-3">
                        {fields['Internal Deadline'] && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-secondary" />
                            <div>
                              <div className="font-medium">Internal Deadline</div>
                              <div className="text-muted-foreground">
                                {formatters.date(fields['Internal Deadline'])}
                              </div>
                            </div>
                          </div>
                        )}
                        {fields['Submission Deadline'] && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-urgent" />
                            <div>
                              <div className="font-medium">Submission Deadline</div>
                              <div className="text-muted-foreground">
                                {formatters.date(fields['Submission Deadline'])}
                                {daysToDeadline !== null && (
                                  <span className={`ml-2 ${daysToDeadline <= 7 ? 'text-urgent font-medium' : ''}`}>
                                    ({daysToDeadline} days)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="lg:col-span-3 flex flex-col gap-3">
                      <div>
                        <Select 
                          value={fields.Status || 'Identified'} 
                          onValueChange={(value) => updateApplicationStatus(application.id, value as any)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Files
                        </Button>
                      </div>
                      
                      {daysToDeadline !== null && daysToDeadline <= 7 && (
                        <Badge className="badge-urgent animate-harvest-glow">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Deadline Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!isLoading && filteredApplications.length === 0 && (
            <Card className="card-organic">
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-lg font-serif mb-2">No applications found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking your grant applications
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Application
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
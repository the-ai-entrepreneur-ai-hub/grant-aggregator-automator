export interface Grant {
  id: string;
  title: string;
  description: string;
  amount: string;
  deadline: string;
  category: string;
  eligibility: string;
  applicationUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AirtableRecord {
  id: string;
  fields: {
    Title?: string;
    Description?: string;
    Amount?: string;
    Deadline?: string;
    Category?: string;
    Eligibility?: string;
    'Application URL'?: string;
    'Created At'?: string;
    'Updated At'?: string;
  };
  createdTime: string;
}
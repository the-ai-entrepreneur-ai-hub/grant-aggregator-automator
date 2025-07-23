# Netlify Environment Variables Setup

To fix the 401 authentication error, you need to set up environment variables in your Netlify dashboard.

## Required Environment Variables

Go to your Netlify site dashboard > Site Settings > Environment Variables and add:

```
VITE_AIRTABLE_BASE_ID = appR8MwS1pQs7Bnga
VITE_AIRTABLE_API_KEY = patrTARcp2imegWXX.760ec1e9aac667cdaf735ba6b36bfc3e00270da1d116fcfbd5fbc77b103577e0
VITE_AIRTABLE_TABLE_NAME = Funding Opportunities
```

## Steps:

1. Go to your Netlify dashboard
2. Select your site
3. Go to Site Settings > Environment Variables
4. Add each variable above
5. Redeploy your site

## Alternative: Use Netlify CLI

If you have Netlify CLI installed:

```bash
netlify env:set VITE_AIRTABLE_BASE_ID appR8MwS1pQs7Bnga
netlify env:set VITE_AIRTABLE_API_KEY patrTARcp2imegWXX.760ec1e9aac667cdaf735ba6b36bfc3e00270da1d116fcfbd5fbc77b103577e0
netlify env:set VITE_AIRTABLE_TABLE_NAME "Funding Opportunities"
```

## Test Credentials After Setup:

- **Admin**: admin@misionhuascaran.org / admin123
- **Team**: team@misionhuascaran.org / team123
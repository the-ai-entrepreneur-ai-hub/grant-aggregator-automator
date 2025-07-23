# Misión Huascarán Grant Aggregator - Airtable Setup Guide

## 🎯 Overview
This guide will help you set up the Airtable integration for the Misión Huascarán Grant Aggregator project. The Airtable API key and database configuration are stored securely in the GitHub repository.

## 📋 Prerequisites

1. **GitHub Access**: You need access to the repository `the-ai-entrepreneur-ai-hub/grant-aggregator-automator`
2. **Airtable Account**: Create an account at [airtable.com](https://airtable.com)
3. **Node.js**: Version 16 or higher installed on your system
4. **npm**: Package manager for Node.js

## 🔑 Step 1: Access Airtable API Key

### From GitHub Repository
1. Navigate to the repository: `https://github.com/the-ai-entrepreneur-ai-hub/grant-aggregator-automator`
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Find the following secrets:
   - `AIRTABLE_API_KEY`
   - `AIRTABLE_BASE_ID`
   - `AIRTABLE_TABLE_NAME`

### Alternative: Get Your Own API Key
If you don't have access to the repository secrets:

1. Go to [Airtable Account Settings](https://airtable.com/create/tokens)
2. Click **Create new token**
3. Configure the token:
   - **Name**: `Mision-Huascaran-Grant-Aggregator`
   - **Scopes**: 
     - `data.records:read`
     - `data.records:write`
     - `schema.bases:read`
   - **Access**: Select the appropriate base
4. Copy the generated API key

## 🗄️ Step 2: Database Setup

### Option A: Use Existing Base
If you have access to the existing Misión Huascarán base:
1. Copy the Base ID from the URL: `https://airtable.com/appXXXXXXXXXXXXXX`
2. The Base ID starts with `app` followed by alphanumeric characters

### Option B: Create New Base
1. Go to [Airtable](https://airtable.com) and create a new base
2. Import the schema from `airtable-base-schema.json` (provided in the repository)
3. Set up the tables according to the database documentation

## ⚙️ Step 3: Environment Configuration

### Local Development Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/the-ai-entrepreneur-ai-hub/grant-aggregator-automator.git
   cd grant-aggregator-automator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your credentials:
   ```env
   # Airtable Configuration
   VITE_AIRTABLE_API_KEY=your_api_key_here
   VITE_AIRTABLE_BASE_ID=your_base_id_here
   VITE_AIRTABLE_TABLE_NAME=Grant Opportunities

   # Application Configuration
   VITE_API_URL=http://localhost:3000
   VITE_APP_ENV=development
   ```

## 🚀 Step 4: Test the Integration

### Verify Connection
1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the Airtable connection**:
   ```bash
   npm run test:airtable
   ```

3. **Check the console** for successful connection messages

### Expected Output
You should see:
```
✅ Airtable connection successful
📊 Found X grant opportunities
🏢 Found Y organizations
🔍 Found Z keywords
```

## 🔧 Step 5: Production Deployment

### GitHub Pages Deployment
1. **Push your changes** to the repository
2. **GitHub Actions** will automatically deploy to GitHub Pages
3. **Environment variables** are automatically injected from GitHub Secrets

### Environment Variables for Production
In GitHub repository settings:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `VITE_AIRTABLE_API_KEY`
   - `VITE_AIRTABLE_BASE_ID`
   - `VITE_AIRTABLE_TABLE_NAME`

## 📊 Database Schema Import

### Import Schema to Airtable
1. **Download the schema file**: `airtable-base-schema.json`
2. **Use Airtable's import feature**:
   - Go to your base
   - Click **"Import data"**
   - Select **"Paste table data"**
   - Paste the schema content

### Manual Table Creation
If import doesn't work, create tables manually:

#### Grant Opportunities Table
- **Grant Name** (Single line text)
- **Organization** (Multiple select)
- **Description** (Long text)
- **Amount** (Currency)
- **Deadline** (Date)
- **Category** (Multiple select)
- **Keywords** (Multiple select)
- **Eligibility** (Long text)
- **Application Link** (URL)
- **Contact Email** (Email)
- **Status** (Single select: Active, Closed, Pending)
- **Priority** (Single select: High, Medium, Low)
- **Notes** (Long text)

## 🔍 Troubleshooting

### Common Issues

#### "Invalid API Key"
- **Solution**: Verify the API key is correct and has proper permissions
- **Check**: Ensure the token has `data.records:read` scope

#### "Base Not Found"
- **Solution**: Verify the Base ID is correct
- **Format**: Should start with `app` followed by 14 characters

#### "Permission Denied"
- **Solution**: Check that the API key has access to the base
- **Action**: Re-generate the token with correct base access

#### "Rate Limit Exceeded"
- **Solution**: Implement rate limiting in your code
- **Limit**: Airtable allows 5 requests per second per base

### Debug Mode
Enable debug logging by setting:
```env
VITE_DEBUG_MODE=true
```

## 📞 Support

### Getting Help
- **Technical Issues**: Create an issue in the GitHub repository
- **Airtable Support**: Contact Airtable support for API-related issues
- **Documentation**: Check `docs/DATABASE_DOCUMENTATION.md` for detailed schema

### Useful Links
- [Airtable API Documentation](https://airtable.com/api)
- [GitHub Repository](https://github.com/the-ai-entrepreneur-ai-hub/grant-aggregator-automator)
- [Database Documentation](./docs/DATABASE_DOCUMENTATION.md)

## ✅ Verification Checklist

- [ ] API key obtained and configured
- [ ] Base ID identified and set
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Development server running
- [ ] Airtable connection tested
- [ ] Sample data loaded
- [ ] Search functionality working
- [ ] GitHub Pages deployment successful

---

**Next Steps**: After completing the setup, proceed to the [User Guide](./docs/USER_GUIDE.md) for instructions on using the application.
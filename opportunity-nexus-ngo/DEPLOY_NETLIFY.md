# Deploy to Netlify Guide

## Quick Deploy Steps

### 1. Prepare Environment Variables
Before deploying, you'll need to set up your environment variables in Netlify:

**Required Environment Variables:**
- `VITE_AIRTABLE_API_KEY` - Your Airtable API key
- `VITE_AIRTABLE_BASE_ID` - Your Airtable base ID
- `VITE_AIRTABLE_TABLE_NAME` - Your table name (default: "Grant Opportunities")
- `VITE_API_URL` - API endpoint URL
- `VITE_APP_ENV` - Environment (production/staging/development)

### 2. Deploy Options

#### Option A: Deploy from Git (Recommended)
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables in Site settings > Environment variables
7. Deploy!

#### Option B: Manual Deploy (Drag & Drop)
1. Build the project locally:
   ```bash
   npm install
   npm run build
   ```
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the `dist` folder
4. Add environment variables in Site settings > Environment variables

#### Option C: Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Login to Netlify:
   ```bash
   netlify login
   ```
3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

### 3. Environment Variables Setup

After deployment, go to your site settings in Netlify:

1. Navigate to **Site settings** > **Environment variables**
2. Add the following variables:
   ```
   VITE_AIRTABLE_API_KEY=your_actual_api_key
   VITE_AIRTABLE_BASE_ID=your_actual_base_id
   VITE_AIRTABLE_TABLE_NAME=Grant Opportunities
   VITE_API_URL=https://api.airtable.com
   VITE_APP_ENV=production
   ```

### 4. Verify Deployment

After deployment, your app should be available at:
`https://[your-site-name].netlify.app`

### 5. Custom Domain (Optional)

1. Go to **Domain management** in your site settings
2. Add custom domain or use the provided Netlify subdomain

## Troubleshooting

### Build Issues
- Ensure all dependencies are listed in `package.json`
- Check that environment variables are properly set
- Verify Node.js version compatibility (Node 18+ recommended)

### Environment Variables Not Working
- Ensure variables are prefixed with `VITE_` for Vite compatibility
- Redeploy after adding/changing environment variables
- Check the deploy log for any errors

### 404 Errors on Refresh
- The `netlify.toml` file includes redirect rules for SPA routing
- Ensure the `_redirects` file is present in the `dist` folder

## Files Created/Modified

- ✅ `netlify.toml` - Netlify configuration
- ✅ `vite.config.ts` - Updated base path for Netlify
- ✅ `DEPLOY_NETLIFY.md` - This deployment guide

## Next Steps

1. Choose your preferred deployment method
2. Set up environment variables
3. Deploy your application
4. Test the deployed application
5. Share the live URL!

## Support

If you encounter issues:
- Check the deploy log in Netlify dashboard
- Verify all environment variables are set correctly
- Ensure your Airtable credentials are valid
- Test the build locally with `npm run build && npm run preview`
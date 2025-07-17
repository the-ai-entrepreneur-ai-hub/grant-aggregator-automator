# GitHub Pages Deployment Troubleshooting Guide

## 🚨 Current Issue: Jekyll Build Error

The deployment is failing with:
```
Error: Is a directory @ apply2files - /github/workspace/_site/assets
```

## ✅ Solution Steps

### 1. Disable Jekyll Processing
The `.nojekyll` file has been created in the `public/` directory to bypass Jekyll processing.

### 2. Fix Assets Directory Conflict
The issue occurs because GitHub Pages tries to process the `assets` directory as a Jekyll asset. Here's how to fix it:

### 3. Update Build Configuration

#### Option A: Use GitHub Actions (Recommended)
Create `.github/workflows/deploy.yml` for proper deployment:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Option B: Manual Deployment Fix
1. **Update package.json** scripts:
```json
"deploy": "npm run build && gh-pages -d dist --dotfiles"
```

2. **Ensure .nojekyll is copied**:
Add to `vite.config.ts`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/grant-aggregator-automator/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      external: []
    }
  },
  publicDir: 'public'
})
```

### 4. Verify Build Output
Run these commands to test locally:
```bash
npm run build
npx serve dist
```

### 5. Check Repository Settings
1. Go to repository Settings → Pages
2. Ensure source is set to "GitHub Actions"
3. Wait for deployment to complete (5-10 minutes)

## 🔧 Quick Fix Commands

```bash
# Install missing dependencies
npm install

# Build and test locally
npm run build
npm run preview

# Deploy with proper flags
npm run build
npx gh-pages -d dist --dotfiles --no-history
```

## 📋 Deployment Checklist

- [ ] `.nojekyll` file exists in `public/` directory
- [ ] `vite.config.ts` has correct base path
- [ ] GitHub Pages source is set to "GitHub Actions"
- [ ] Repository has Pages write permissions
- [ ] Build completes without errors
- [ ] All assets are properly included in `dist/`

## 🚨 Common Issues & Solutions

### Issue: "Is a directory" error
**Solution**: Use GitHub Actions instead of gh-pages CLI

### Issue: 404 on refresh
**Solution**: Ensure SPA routing is configured in GitHub Actions

### Issue: Missing assets
**Solution**: Check `public/` directory contents and vite.config.ts

## 🎯 Success Indicators

When deployment is successful:
- GitHub Actions workflow shows green checkmark
- Pages URL loads without 404 errors
- All assets (CSS, JS, images) load correctly
- Airtable integration works in production

## 📞 Next Steps

1. **Create GitHub Actions workflow** (Option A recommended)
2. **Push changes to main branch**
3. **Monitor deployment in Actions tab**
4. **Test live site functionality**
5. **Verify Airtable integration in production**
# Misión Huascarán Grant Aggregator

A comprehensive grant opportunity management system built with React, TypeScript, and Airtable integration. This application provides automated data collection, intelligent search, and deadline management for grant opportunities.

## 🎯 Project Overview

The **Misión Huascarán Grant Aggregator** is designed to streamline the process of finding, tracking, and managing grant opportunities for nonprofit organizations. It features:

- **Automated Data Collection**: Integration with multiple grant databases
- **Intelligent Search**: Advanced filtering and keyword matching
- **Deadline Management**: Automated alerts and tracking
- **Comprehensive Analytics**: Performance metrics and trend analysis
- **User-Friendly Interface**: Modern, responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Airtable account (free tier works)
- GitHub account for deployment

### 1. Clone and Setup
```bash
git clone https://github.com/the-ai-entrepreneur-ai-hub/grant-aggregator-automator.git
cd grant-aggregator-automator
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your Airtable credentials:
```env
VITE_AIRTABLE_API_KEY=your_api_key_here
VITE_AIRTABLE_BASE_ID=your_base_id_here
```

### 3. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📊 Database Architecture

The system uses Airtable as the backend with the following structure:

### Core Tables
- **Grant Opportunities**: Main repository for all grants
- **Organizations**: Directory of funding organizations
- **Keywords**: Controlled vocabulary for search
- **Categories**: Standardized categorization
- **Deadlines**: Detailed deadline tracking
- **Contacts**: Contact management
- **Notes**: Activity tracking

### Data Sources
- Foundation Directory Online (FDO)
- Grants.gov API
- European Commission Funding Portal
- Web scraping from foundation websites

## 🔧 Configuration

### Airtable Setup
1. **Create Airtable Account**: [airtable.com](https://airtable.com)
2. **Get API Key**: Account Settings → Developer → API Key
3. **Create Base**: Use `airtable-base-schema.json` to import structure
4. **Configure Environment**: Add credentials to `.env` file

### GitHub Pages Deployment
The project is configured for automatic deployment to GitHub Pages:
- **Production**: Pushes to `main` branch deploy automatically
- **Environment Variables**: Stored in GitHub Secrets
- **Custom Domain**: Configurable via `CNAME` file

## 📁 Project Structure

```
grant-aggregator-automator/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── config/             # Configuration files
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
├── docs/                   # Documentation
├── public/                 # Static assets
├── tests/                  # Test files
├── airtable-base-schema.json
├── SETUP_GUIDE.md
└── README.md
```

## 🎨 Features

### Search & Discovery
- **Advanced Search**: Multi-criteria filtering
- **Keyword Matching**: Intelligent search with weights
- **Geographic Filtering**: Location-based search
- **Category Browsing**: Sector-specific opportunities

### Management Tools
- **Deadline Tracking**: Automated alerts
- **Status Management**: Track application progress
- **Contact Management**: Organize relationships
- **Note Taking**: Activity logging

### Analytics
- **Success Metrics**: Track application rates
- **Trend Analysis**: Funding pattern insights
- **Performance Dashboard**: Visual analytics
- **Export Reports**: CSV and PDF generation

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run linting
npm run deploy       # Deploy to GitHub Pages
```

### Environment Variables
```env
# Required
VITE_AIRTABLE_API_KEY=your_api_key
VITE_AIRTABLE_BASE_ID=your_base_id

# Optional
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=development
VITE_DEBUG_MODE=false
```

## 🔍 API Integration

### Airtable API
The application uses Airtable's REST API with the following endpoints:
- **Base URL**: `https://api.airtable.com/v0/{base_id}`
- **Authentication**: Bearer token in Authorization header
- **Rate Limiting**: 5 requests per second per base

### Data Synchronization
- **Real-time Updates**: Webhook integration (future enhancement)
- **Scheduled Sync**: Daily data refresh
- **Manual Refresh**: User-triggered updates

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured interface
- **Tablet**: Optimized layout
- **Mobile**: Streamlined experience

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### GitHub Pages (Recommended)
1. **Fork Repository**: Create your own copy
2. **Set Secrets**: Add Airtable credentials to GitHub Secrets
3. **Push Changes**: Automatic deployment on push to main

### Netlify/Vercel
1. **Import Repository**: Connect to Git provider
2. **Set Environment Variables**: Add Airtable credentials
3. **Deploy**: Automatic deployment on push

### Custom Server
```bash
npm run build
npm run preview
```

## 📞 Support

### Documentation
- [Database Documentation](./docs/DATABASE_DOCUMENTATION.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [API Reference](./docs/API_REFERENCE.md)

### Getting Help
- **Issues**: Create GitHub issue for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@misionhuascaran.org

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Airtable**: For providing the database backend
- **React Community**: For the excellent ecosystem
- **Misión Huascarán Team**: For project requirements and testing

---

## 🔗 Quick Links

- **Live Demo**: [https://the-ai-entrepreneur-ai-hub.github.io/grant-aggregator-automator](https://the-ai-entrepreneur-ai-hub.github.io/grant-aggregator-automator)
- **Repository**: [https://github.com/the-ai-entrepreneur-ai-hub/grant-aggregator-automator](https://github.com/the-ai-entrepreneur-ai-hub/grant-aggregator-automator)
- **Airtable Base**: [Airtable Dashboard](https://airtable.com)

---

**Built with ❤️ by the Misión Huascarán Technical Team**
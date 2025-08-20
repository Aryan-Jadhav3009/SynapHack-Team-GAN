# SynapHack Deployment Guide

Complete deployment guide for the SynapHack hackathon platform using Vercel and Azure services.

## Quick Start

1. **Clone Repository**
   \`\`\`bash
   git clone <repository-url>
   cd synaphack-platform
   npm install
   \`\`\`

2. **Set up Azure Services** (see detailed steps below)

3. **Deploy to Vercel**
   \`\`\`bash
   npm i -g vercel
   vercel --prod
   \`\`\`

4. **Configure Environment Variables** in Vercel Dashboard

5. **Run Database Setup**
   \`\`\`bash
   npm run db:setup
   npm run db:seed
   \`\`\`

## Azure Services Setup

### 1. Azure SQL Database

\`\`\`bash
# Create resource group
az group create --name synaphack-rg --location eastus

# Create SQL Server
az sql server create \
  --name synaphack-sql-server \
  --resource-group synaphack-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password YourSecurePassword123!

# Create Database
az sql db create \
  --resource-group synaphack-rg \
  --server synaphack-sql-server \
  --name synaphack-db \
  --service-objective S0

# Configure firewall for Azure services
az sql server firewall-rule create \
  --resource-group synaphack-rg \
  --server synaphack-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
\`\`\`

### 2. Azure Blob Storage

\`\`\`bash
# Create storage account
az storage account create \
  --name synaphackstorage \
  --resource-group synaphack-rg \
  --location eastus \
  --sku Standard_LRS

# Create container for uploads
az storage container create \
  --name uploads \
  --account-name synaphackstorage \
  --public-access blob
\`\`\`

### 3. Azure SignalR Service

\`\`\`bash
az signalr create \
  --name synaphack-signalr \
  --resource-group synaphack-rg \
  --location eastus \
  --sku Free_F1 \
  --service-mode Default
\`\`\`

## Environment Variables

Add these to your Vercel project settings:

\`\`\`env
# Database
AZURE_SQL_CONNECTION_STRING="Server=tcp:synaphack-sql-server.database.windows.net,1433;Initial Catalog=synaphack-db;Persist Security Info=False;User ID=sqladmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Storage
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=synaphackstorage;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER="uploads"

# SignalR
AZURE_SIGNALR_CONNECTION_STRING="Endpoint=https://synaphack-signalr.service.signalr.net;AccessKey=YOUR_KEY;Version=1.0;"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key-here"
NEXTAUTH_URL="https://your-domain.vercel.app"
\`\`\`

## Production Checklist

- [ ] Azure SQL Database created and configured
- [ ] Azure Blob Storage set up with proper CORS
- [ ] Azure SignalR Service configured
- [ ] Environment variables set in Vercel
- [ ] Database schema deployed (`npx prisma db push`)
- [ ] Database seeded with initial data
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring and logging enabled

## Troubleshooting

### Database Connection Issues
- Verify firewall rules allow your IP
- Check connection string format
- Ensure database exists

### File Upload Problems
- Verify storage account CORS settings
- Check container permissions
- Validate connection string

### Build Failures
- Check all environment variables are set
- Verify Node.js version compatibility
- Review build logs in Vercel

## Monitoring

Set up Application Insights for monitoring:

\`\`\`bash
az monitor app-insights component create \
  --app synaphack-insights \
  --location eastus \
  --resource-group synaphack-rg
\`\`\`

Add to environment variables:
\`\`\`env
APPLICATIONINSIGHTS_CONNECTION_STRING="your-app-insights-connection-string"
\`\`\`

## Scaling

- **Database**: Monitor DTU usage, upgrade service tier as needed
- **Storage**: Consider CDN for static assets
- **Application**: Vercel auto-scales, monitor function execution times

For detailed troubleshooting and advanced configuration, see the main README.md file.

# SynapHack - Full-Stack Hackathon Platform

A comprehensive hackathon management platform built with Next.js, Azure SQL Database, and Azure services. SynapHack enables organizers to create and manage hackathons, participants to form teams and submit projects, and judges to evaluate submissions.

## Features

- **User Authentication**: Secure JWT-based authentication with role management
- **Hackathon Management**: Create, browse, and manage hackathons with registration
- **Team Formation**: Create teams, find teammates, and manage team membership
- **Project Submissions**: Submit projects with file uploads, demos, and repositories
- **Judging System**: Comprehensive scoring system for judges with detailed criteria
- **Admin Dashboard**: Platform management with user roles and analytics
- **Real-time Features**: Azure SignalR integration for live updates

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Azure SQL Database
- **Storage**: Azure Blob Storage
- **Real-time**: Azure SignalR Service
- **Authentication**: JWT with HTTP-only cookies
- **Deployment**: Vercel (Frontend/API), Azure (Database/Services)

## Prerequisites

- Node.js 18+ and npm
- Azure account with SQL Database, Blob Storage, and SignalR services
- Vercel account for deployment

## Local Development Setup

### 1. Clone and Install Dependencies

\`\`\`bash
git clone <repository-url>
cd synaphack-platform
npm install
\`\`\`

### 2. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Database
AZURE_SQL_CONNECTION_STRING="Server=tcp:<server>.database.windows.net,1433;Initial Catalog=<database>;Persist Security Info=False;User ID=<username>;Password=<password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=<account>;AccountKey=<key>;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER="uploads"

# Azure SignalR
AZURE_SIGNALR_CONNECTION_STRING="Endpoint=https://<name>.service.signalr.net;AccessKey=<key>;Version=1.0;"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### 3. Database Setup

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database (optional)
npm run db:seed
\`\`\`

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Azure Services Setup

### Azure SQL Database

1. Create an Azure SQL Database instance
2. Configure firewall rules to allow your IP and Azure services
3. Update the connection string in your environment variables
4. Run Prisma migrations: `npx prisma db push`

### Azure Blob Storage

1. Create a Storage Account in Azure
2. Create a container named "uploads" (or update AZURE_STORAGE_CONTAINER)
3. Configure CORS settings for your domain
4. Update the connection string in your environment variables

### Azure SignalR Service

1. Create a SignalR Service instance in Azure
2. Set service mode to "Default" or "Serverless"
3. Update the connection string in your environment variables

## Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   - Import your repository to Vercel
   - Configure build settings (Next.js preset is automatic)

2. **Environment Variables**:
   Add all environment variables from `.env.local` to Vercel:
   \`\`\`bash
   # In Vercel Dashboard > Project > Settings > Environment Variables
   AZURE_SQL_CONNECTION_STRING=<your-connection-string>
   AZURE_STORAGE_CONNECTION_STRING=<your-storage-string>
   AZURE_STORAGE_CONTAINER=uploads
   AZURE_SIGNALR_CONNECTION_STRING=<your-signalr-string>
   JWT_SECRET=<your-jwt-secret>
   \`\`\`

3. **Deploy**:
   \`\`\`bash
   # Using Vercel CLI
   npm i -g vercel
   vercel --prod
   
   # Or push to main branch for automatic deployment
   git push origin main
   \`\`\`

### Manual Deployment

1. **Build the Application**:
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy to Your Platform**:
   - Upload the `.next` folder and other necessary files
   - Set environment variables on your hosting platform
   - Ensure Node.js 18+ runtime

## Database Scripts

Run database setup scripts in the `scripts` folder:

\`\`\`bash
# Create initial tables
node scripts/setup-database.js

# Seed with sample data
node scripts/seed-database.js
\`\`\`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Hackathon Endpoints

- `GET /api/hackathons` - List hackathons
- `POST /api/hackathons` - Create hackathon (organizer only)
- `GET /api/hackathons/[id]` - Get hackathon details
- `PUT /api/hackathons/[id]` - Update hackathon (organizer only)
- `POST /api/hackathons/[id]/register` - Register for hackathon

### Team Endpoints

- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/[id]` - Get team details
- `PUT /api/teams/[id]` - Update team
- `POST /api/teams/[id]/join` - Join team

### Submission Endpoints

- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions/[id]` - Get submission details
- `PUT /api/submissions/[id]` - Update submission

### Admin Endpoints

- `GET /api/admin/stats` - Platform statistics (admin only)
- `GET /api/admin/users` - Manage users (admin only)

## User Roles

- **PARTICIPANT**: Can join hackathons, create/join teams, submit projects
- **ORGANIZER**: Can create and manage hackathons, view submissions
- **JUDGE**: Can evaluate submissions and provide scores
- **ADMIN**: Full platform access, user management, analytics

## File Upload

Files are uploaded to Azure Blob Storage with the following structure:
\`\`\`
uploads/
├── submissions/
│   ├── [submission-id]/
│   │   ├── demo-image.jpg
│   │   └── presentation.pdf
└── avatars/
    └── [user-id]/
        └── profile.jpg
\`\`\`

## Security Features

- JWT tokens with HTTP-only cookies
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting on API endpoints
- Secure file upload validation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify Azure SQL firewall settings
   - Check connection string format
   - Ensure database exists and is accessible

2. **File Upload Issues**:
   - Verify Azure Blob Storage CORS settings
   - Check container permissions
   - Validate storage account connection string

3. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Check cookie settings in production
   - Ensure NEXTAUTH_URL matches your domain

### Support

For issues and questions:
- Check the GitHub Issues page
- Review Azure service logs
- Check Vercel deployment logs

## License

MIT License - see LICENSE file for details.

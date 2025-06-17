# RepShield.io - Reddit Content Removal Service

[![CI/CD Pipeline](https://github.com/StraightUpSearch/RepShieldio/actions/workflows/ci.yml/badge.svg)](https://github.com/StraightUpSearch/RepShieldio/actions/workflows/ci.yml)
[![Security Scan](https://github.com/StraightUpSearch/RepShieldio/actions/workflows/security.yml/badge.svg)](https://github.com/StraightUpSearch/RepShieldio/actions/workflows/security.yml)
[![Performance](https://github.com/StraightUpSearch/RepShieldio/actions/workflows/performance.yml/badge.svg)](https://github.com/StraightUpSearch/RepShieldio/actions/workflows/performance.yml)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)

## 🚀 Overview

RepShield.io is a **simple ticketing system** for Reddit content removal services. The MVP focuses on providing the best service possible for leads who need professional help removing harmful Reddit content.

## ⚡ CI/CD Pipeline

This project features a comprehensive CI/CD pipeline with:
- **Automated Testing**: TypeScript compilation, E2E tests with Playwright
- **Security Scanning**: Daily vulnerability audits, CodeQL analysis
- **Performance Monitoring**: Lighthouse audits, bundle analysis, load testing  
- **Multi-Environment Deployment**: Staging and production with automated rollbacks
- **Quality Gates**: No broken code reaches production

[📖 View Pipeline Documentation](docs/CI-CD-SETUP.md)

### Current MVP Features (Phase 1)

- **Reddit URL Submission** - Users submit problematic Reddit URLs
- **Ticket Management** - Automatic ticket creation and tracking  
- **Email Notifications** - Instant alerts to specialists and customers
- **Specialist Communication** - Direct ticket replies and updates
- **User Authentication** - Register/login system for ticket tracking

### Future Features (Phase 2)

- **Brand Scanner** - Simple monitoring for Reddit mentions
- **Enhanced Analytics** - Basic reporting and insights

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Wouter** - Lightweight client-side routing
- **Framer Motion** - Smooth animations
- **TanStack Query** - Server state management
- **React Hook Form** - Performant form handling

### Backend
- **Node.js 20+** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type safety across the stack
- **Helmet** - Security middleware
- **Passport.js** - Authentication middleware
- **Zod** - Runtime type validation
- **ESBuild** - Fast JavaScript bundler

### Database & Storage
- **SQLite** - Embedded database (dev/staging)
- **PostgreSQL** - Production database
- **Drizzle ORM** - Type-safe database access
- **Express Sessions** - Session management

### External APIs & Services
- **SendGrid** - Email delivery service  
- **Telegram Bot API** - Admin notifications (optional)
- **Reddit API** - For future brand scanning (Phase 2)
- **ScrapingBee** - For future web scraping (Phase 2)

### Development & Testing
- **Playwright** - End-to-end testing
- **TypeScript Compiler** - Type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📋 Prerequisites

- **Node.js** 20.0.0 or higher
- **NPM** 10.0.0 or higher
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/repshieldio.git
cd repshieldio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the environment template
cp env-template.txt .env

# Edit the .env file with your API keys
# See ENVIRONMENT_VARIABLES.md for detailed setup
```

### 4. Database Setup
```bash
# Initialize the database
npm run db:push
```

### 5. Start Development Server
```bash
# Start both frontend and backend
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
repshieldio/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (contact, auth, dashboard)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and helpers
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── email.ts           # SendGrid email service
│   ├── simple-auth.ts     # Authentication logic
│   └── telegram.ts        # Admin notifications
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema (users, tickets)
├── migrations/             # Database migrations
├── tests/                  # End-to-end tests
└── docs/                   # Documentation
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:win          # Start development server (Windows)

# Building
npm run build            # Build for production
npm run check            # TypeScript type checking

# Database
npm run db:push          # Push database schema changes

# Testing
npm run test:e2e         # Run end-to-end tests
npm run test:e2e:ui      # Run tests with UI
npm run test:e2e:headed  # Run tests in headed mode
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./development.db"

# Core Configuration

# Email (Required for notifications)
SENDGRID_API_KEY="your_sendgrid_api_key"

# Telegram (Optional - for admin notifications)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
TELEGRAM_CHAT_ID="your_telegram_chat_id"

# Session
SESSION_SECRET="your_session_secret"
```

## 🧪 Testing

RepShield.io uses Playwright for comprehensive end-to-end testing:

```bash
# Run all tests
npm run test:e2e

# Run specific test
npx playwright test tests/repshield-complete-e2e.spec.ts

# Run tests in UI mode
npm run test:e2e:ui
```

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](PRODUCTION_DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [Security Policy](docs/SECURITY.md)
- [Tech Stack Details](LIVE_SCANNER_TECH_STACK.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` directory
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@repshield.io
- **Discord**: Join our community server

## 🚧 Roadmap

- [ ] Multi-language support
- [ ] Advanced AI threat detection
- [ ] Integration with more platforms
- [ ] Mobile application
- [ ] White-label solutions
- [ ] API for third-party integrations

---

**RepShield.io** - Protecting your digital reputation with AI-powered monitoring and professional removal services. 
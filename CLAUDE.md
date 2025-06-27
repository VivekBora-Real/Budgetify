# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BudgetApp is a comprehensive personal finance management application that helps users track expenses, manage budgets, monitor investments, and visualize their financial health through customizable dashboards.

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with ShadCN UI components
- **State Management**: Redux Toolkit for global state
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Testing**: Jest/Vitest with React Testing Library
- **Code Quality**: ESLint + Prettier

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator / Joi
- **File Upload**: Multer
- **Environment**: Node.js 18+

### Deployment
- **Hosting**: Render (both frontend and backend)
- **Database**: MongoDB Atlas
- **File Storage**: Local (consider cloud storage for production)

## Project Structure

### Frontend Structure
```
src/
├── components/       # Reusable UI components
├── features/        # Feature-based modules
│   ├── auth/       # Authentication (login, register)
│   ├── dashboard/  # Dashboard and widgets
│   ├── transactions/ # Transaction management
│   ├── accounts/   # Account management
│   ├── investments/ # Investment tracking
│   ├── loans/      # Loan management
│   ├── reminders/  # Payment reminders
│   └── warranty/   # Warranty tracking
├── hooks/          # Custom React hooks
├── services/       # API service layer
├── store/          # Redux store configuration
├── utils/          # Utility functions
└── tests/          # Test files
```

### Backend Structure
```
server/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Express middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── validators/     # Input validation
```

## Common Commands

### Initial Setup
```bash
# Frontend setup
cd frontend
npm install
cp .env.example .env

# Backend setup
cd backend
npm install
cp .env.example .env
```

### Development
```bash
# Frontend
npm run dev          # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run format      # Run Prettier

# Backend
npm run dev         # Start with nodemon
npm run build       # Compile TypeScript
npm start           # Start production server
npm run lint        # Run ESLint
npm run format      # Run Prettier
```

### Testing
```bash
# Frontend
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Backend
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:integration # Run integration tests
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5001/api
VITE_APP_ENV=development
```

### Backend (.env)
```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/budgetapp
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

## Key Features

1. **User Authentication**: JWT-based auth with refresh tokens
2. **Account Management**: Multiple account types (bank, credit card, cash)
3. **Transaction Tracking**: Income/expense with categories and tags
4. **Dashboard**: Customizable widgets with drag-and-drop
5. **Reminders**: Payment reminders for EMIs, insurance, etc.
6. **Warranty Tracking**: Product warranty management
7. **Investment Portfolio**: Track FDs, mutual funds, stocks
8. **Loan Management**: Track loans and EMIs

## API Conventions

- RESTful endpoints: `/api/resource`
- Authentication: Bearer token in Authorization header
- Request/Response: JSON format
- Error format: `{ error: { message: string, code: string } }`
- Pagination: `?page=1&limit=20`
- Filtering: `?category=food&dateFrom=2024-01-01`

## Database Models

Key collections:
- `users`: User accounts and preferences
- `accounts`: Bank/cash accounts
- `transactions`: Income/expense records
- `categories`: Transaction categories
- `reminders`: Payment reminders
- `warranties`: Product warranties
- `investments`: Investment portfolio
- `loans`: Loan records

## Development Best Practices

1. **Feature Folder Structure**: Organize code by feature, not file type
2. **TypeScript**: Use proper types, avoid `any`
3. **Testing**: Write tests for critical business logic
4. **Error Handling**: Consistent error handling with proper status codes
5. **Validation**: Validate all user inputs
6. **Security**: Never expose sensitive data, use environment variables
7. **Code Style**: Follow ESLint and Prettier configurations

## Git Workflow

1. Feature branches: `feature/feature-name`
2. Commit conventions: Use descriptive commit messages
3. Pull requests: Required for merging to main
4. Code review: All PRs should be reviewed

## Important Notes

- Always run linting before committing
- Keep environment variables secure
- Test API endpoints with proper authentication
- Update this file when adding new commands or changing architecture
- Always commit changes after each task completition
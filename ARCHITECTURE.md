# BudgetApp Architecture Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [System Architecture](#system-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Database Design](#database-design)
7. [Security Architecture](#security-architecture)
8. [Integration Architecture](#integration-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Performance Considerations](#performance-considerations)

## System Overview

BudgetApp follows a modern three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│                   (React + Redux + Tailwind)                 │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS/REST API
┌─────────────────────────────┴───────────────────────────────┐
│                    Application Layer                         │
│                  (Express.js + Node.js)                      │
└─────────────────────────────┬───────────────────────────────┘
                              │ MongoDB Protocol
┌─────────────────────────────┴───────────────────────────────┐
│                      Data Layer                              │
│                    (MongoDB Atlas)                           │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Principles

### 1. Separation of Concerns
- Clear boundaries between presentation, business logic, and data layers
- Feature-based modular structure for maintainability

### 2. Scalability First
- Stateless API design for horizontal scaling
- Database indexing strategy for performance
- Caching layer for frequently accessed data

### 3. Security by Design
- JWT-based authentication with refresh tokens
- Input validation at multiple layers
- Encrypted sensitive data storage

### 4. Developer Experience
- TypeScript for type safety
- Consistent coding patterns
- Comprehensive error handling

## System Architecture

### High-Level Component Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                            Frontend (React)                         │
├────────────────┬───────────────┬───────────────┬──────────────────┤
│  Landing Page  │     Auth      │   Dashboard   │  Feature Modules │
│                │  Components   │    Widgets    │  (Transactions,  │
│                │               │               │   Investments)   │
└────────────────┴───────┬───────┴───────────────┴──────────────────┘
                         │ API Calls (Axios + React Query)
┌────────────────────────┴───────────────────────────────────────────┐
│                         API Gateway Layer                           │
│                    (Express Middleware Stack)                       │
├─────────────┬──────────────┬──────────────┬───────────────────────┤
│    CORS     │     Auth     │   Rate       │   Error              │
│  Middleware │  Middleware  │  Limiting    │  Handler             │
└─────────────┴──────────────┴──────────────┴───────────────────────┘
                                    │
┌────────────────────────────────────┴───────────────────────────────┐
│                      Business Logic Layer                           │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│   User       │ Transaction  │  Analytics   │   Notification      │
│  Service     │   Service    │   Service    │    Service          │
└──────────────┴──────────────┴──────────────┴──────────────────────┘
                                    │
┌────────────────────────────────────┴───────────────────────────────┐
│                         Data Access Layer                           │
│                      (Mongoose ODM + MongoDB)                       │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│    User      │ Transaction  │  Investment  │    Reminder         │
│   Model      │    Model     │    Model     │     Model           │
└──────────────┴──────────────┴──────────────┴──────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── Router
│   ├── PublicRoute
│   │   └── LandingPage
│   └── PrivateRoute
│       ├── DashboardLayout
│       │   ├── Header
│       │   ├── Sidebar
│       │   └── MainContent
│       │       ├── Dashboard
│       │       ├── Transactions
│       │       ├── Accounts
│       │       ├── Investments
│       │       ├── Loans
│       │       ├── Reminders
│       │       └── Warranties
│       └── AuthLayout
│           ├── Login
│           └── Register
└── GlobalProviders
    ├── Redux Store
    ├── React Query
    └── Theme Provider
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Redux Store                          │
├──────────────┬──────────────┬──────────────┬───────────┤
│    Auth      │     UI       │   Dashboard  │  Features │
│   Slice      │    Slice     │    Slice     │   Slices  │
├──────────────┴──────────────┴──────────────┴───────────┤
│                  Redux Middleware                       │
│              (Redux Toolkit + RTK Query)                │
└─────────────────────────────────────────────────────────┘
```

### Frontend Folder Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Card/
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   └── Footer/
│   │   └── ui/
│   │       └── (ShadCN components)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── authSlice.ts
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── widgets/
│   │   │   │   └── DashboardGrid/
│   │   │   ├── hooks/
│   │   │   └── dashboardSlice.ts
│   │   └── [other features...]
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useDebounce.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   └── [feature].service.ts
│   ├── store/
│   │   ├── index.ts
│   │   └── rootReducer.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validators.ts
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
├── .env.example
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

### Data Flow Pattern

```
User Action → Component → Action/Hook → API Service → Backend
                ↓                           ↓
            Local State              React Query Cache
                ↓                           ↓
            UI Update ← ─ ─ ─ ─ ─ ─ Response Data
```

## Backend Architecture

### API Layer Design

```
┌─────────────────────────────────────────────────────────┐
│                  Express Application                     │
├─────────────────────────────────────────────────────────┤
│                     Middleware Stack                     │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│  CORS    │  Body    │  Auth    │  Rate    │  Error     │
│          │  Parser  │  Check   │  Limit   │  Handler   │
└──────────┴──────────┴──────────┴──────────┴────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                      Route Layer                         │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│  /auth   │  /users  │  /trans  │  /dash   │  /admin    │
│          │          │ actions  │  board   │            │
└──────────┴──────────┴──────────┴──────────┴────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                   Controller Layer                       │
├─────────────────────────────────────────────────────────┤
│  Request Validation → Business Logic → Response Format  │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                    Service Layer                         │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│  Auth    │  User    │  Trans   │  Analyt  │  Notif     │
│  Service │ Service  │  Service │  Service │  Service   │
└──────────┴──────────┴──────────┴──────────┴────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                 Data Access Layer                        │
└─────────────────────────────────────────────────────────┘
```

### Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── app.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── [feature].controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── transaction.model.ts
│   │   └── [feature].model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   └── [feature].service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── [feature].validator.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── .env.example
├── tsconfig.json
└── package.json
```

### Service Layer Pattern

```typescript
// Example Service Architecture
class TransactionService {
  // Dependency Injection
  constructor(
    private transactionModel: Model<Transaction>,
    private categoryService: CategoryService,
    private analyticsService: AnalyticsService
  ) {}

  // Business Logic Methods
  async createTransaction(data: CreateTransactionDto): Promise<Transaction>
  async getTransactions(filters: FilterDto): Promise<PaginatedResponse>
  async updateTransaction(id: string, data: UpdateDto): Promise<Transaction>
  async deleteTransaction(id: string): Promise<void>
  async bulkImport(transactions: Transaction[]): Promise<ImportResult>
}
```

## Database Design

### Schema Relationships

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    Users    │     │   Accounts   │     │Transactions │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ _id         │────<│ userId       │>────│ userId      │
│ email       │     │ name         │     │ accountId   │
│ password    │     │ type         │     │ amount      │
│ profile     │     │ balance      │     │ category    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                         │
       │                                         │
       ├──────────────┬──────────────┬──────────┤
       │              │              │          │
┌──────┴─────┐ ┌──────┴─────┐ ┌─────┴────┐ ┌──┴────────┐
│ Categories │ │ Reminders  │ │Warranties│ │Investments│
├────────────┤ ├────────────┤ ├──────────┤ ├───────────┤
│ userId     │ │ userId     │ │ userId   │ │ userId    │
│ name       │ │ title      │ │ product  │ │ type      │
│ icon       │ │ dueDate    │ │ expiry   │ │ value     │
└────────────┘ └────────────┘ └──────────┘ └───────────┘
```

### Indexing Strategy

```javascript
// Performance-critical indexes
users: { email: 1 } // Unique index for login
transactions: { 
  userId: 1, 
  date: -1,
  category: 1 
} // Compound index for filtering
accounts: { userId: 1, isActive: 1 }
reminders: { userId: 1, dueDate: 1, isActive: 1 }
```

### Data Aggregation Pipelines

```javascript
// Dashboard Statistics Pipeline
[
  { $match: { userId, date: { $gte: startDate } } },
  { $group: {
    _id: "$category",
    total: { $sum: "$amount" },
    count: { $sum: 1 }
  }},
  { $lookup: {
    from: "categories",
    localField: "_id",
    foreignField: "_id",
    as: "categoryDetails"
  }},
  { $sort: { total: -1 } }
]
```

## Security Architecture

### Authentication Flow

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │    API    │     │   Auth   │     │    DB    │
│          │     │  Gateway  │     │ Service  │     │          │
└────┬─────┘     └─────┬─────┘     └────┬─────┘     └────┬─────┘
     │                 │                 │                 │
     │  POST /login    │                 │                 │
     │────────────────>│                 │                 │
     │                 │ Validate Input  │                 │
     │                 │────────────────>│                 │
     │                 │                 │ Query User      │
     │                 │                 │────────────────>│
     │                 │                 │<────────────────│
     │                 │                 │ Verify Password │
     │                 │                 │                 │
     │                 │ Generate Tokens │                 │
     │                 │<────────────────│                 │
     │ Access + Refresh│                 │                 │
     │<────────────────│                 │                 │
     │                 │                 │                 │
```

### Security Layers

1. **Transport Security**
   - HTTPS enforcement
   - HSTS headers
   - Secure cookie flags

2. **Application Security**
   - Input validation (Joi/Express Validator)
   - SQL injection prevention (Parameterized queries)
   - XSS protection (Content Security Policy)
   - CSRF tokens for state-changing operations

3. **Authentication & Authorization**
   - JWT with short expiry (15 min access, 30 day refresh)
   - Role-based access control (RBAC)
   - Password hashing (bcrypt with salt rounds: 10)

4. **API Security**
   - Rate limiting (100 requests/15 min per IP)
   - API versioning
   - Request size limits
   - CORS configuration

## Integration Architecture

### Third-Party Integrations

```
┌─────────────────────────────────────────────────────────┐
│                   BudgetApp Backend                      │
├───────────┬───────────┬───────────┬────────────────────┤
│  Email    │  Storage  │  Payment  │    Analytics       │
│  Service  │  Service  │  Gateway  │    Service         │
└─────┬─────┴─────┬─────┴─────┬─────┴──────┬─────────────┘
      │           │           │            │
      │           │           │            │
┌─────┴─────┐ ┌───┴───┐ ┌────┴────┐ ┌─────┴──────┐
│ SendGrid  │ │  AWS  │ │ Stripe  │ │  Google    │
│   SMTP    │ │  S3   │ │   API   │ │ Analytics  │
└───────────┘ └───────┘ └─────────┘ └────────────┘
```

### Webhook Architecture

```
External Service → Webhook Endpoint → Queue → Processor → Database
                         │
                    Validation &
                    Verification
```

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                      Cloudflare                          │
│                   (CDN + DDoS Protection)                │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────┐
│                       Render                             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐     ┌─────────────────┐           │
│  │  React App      │     │  Express API    │           │
│  │  (Static Site)  │     │  (Web Service)  │           │
│  └─────────────────┘     └────────┬────────┘           │
└───────────────────────────────────┼─────────────────────┘
                                    │
                        ┌───────────┴────────────┐
                        │    MongoDB Atlas      │
                        │   (Replica Set M10)   │
                        └────────────────────────┘
```

### Environment Configuration

**Development**
```yaml
Frontend: http://localhost:5173
Backend: http://localhost:5000
Database: mongodb://localhost:27017/budgetapp-dev
```

**Staging**
```yaml
Frontend: https://budgetapp-staging.onrender.com
Backend: https://budgetapp-api-staging.onrender.com
Database: mongodb+srv://[staging-cluster]/budgetapp-staging
```

**Production**
```yaml
Frontend: https://budgetapp.com
Backend: https://api.budgetapp.com
Database: mongodb+srv://[prod-cluster]/budgetapp-prod
```

### CI/CD Pipeline

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Push   │     │  GitHub  │     │  Build   │     │  Deploy  │
│  Code   │────>│ Actions  │────>│  & Test  │────>│  Render  │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                 │
                      │                 ├── Lint
                      │                 ├── Unit Tests
                      │                 ├── Integration Tests
                      │                 └── Build Artifacts
                      │
                 Code Quality
                   Checks
```

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**
   ```javascript
   // Lazy load feature modules
   const Dashboard = lazy(() => import('./features/dashboard'));
   const Transactions = lazy(() => import('./features/transactions'));
   ```

2. **Bundle Optimization**
   - Tree shaking with Vite
   - Compression (gzip/brotli)
   - Asset optimization (images, fonts)

3. **Caching Strategy**
   - React Query cache configuration
   - Service Worker for offline support
   - Browser cache headers

### Backend Optimization

1. **Database Optimization**
   - Connection pooling
   - Query optimization
   - Aggregation pipelines
   - Proper indexing

2. **API Optimization**
   - Response compression
   - Pagination
   - Field filtering
   - Caching headers

3. **Resource Management**
   - Memory leak prevention
   - Graceful shutdown
   - Health checks
   - Resource monitoring

### Monitoring & Observability

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Application │────>│   Metrics    │────>│  Dashboards │
│   Logs      │     │  Collector   │     │ & Alerts    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       │                    │                     │
┌──────┴─────┐      ┌──────┴──────┐      ┌──────┴─────┐
│   Winston  │      │ Prometheus  │      │  Grafana   │
│   Logger   │      │   Metrics   │      │ Dashboard  │
└────────────┘      └─────────────┘      └────────────┘
```

## Disaster Recovery

### Backup Strategy
- Daily automated MongoDB backups
- Point-in-time recovery capability
- Geographic replication
- Regular backup restoration tests

### High Availability
- Multi-region deployment capability
- Load balancer health checks
- Automatic failover
- Zero-downtime deployments

## Conclusion

This architecture provides a solid foundation for building a scalable, secure, and maintainable budget management application. The modular design allows for easy feature additions and modifications while maintaining code quality and performance.
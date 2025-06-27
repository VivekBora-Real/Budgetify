# Product Requirements Document (PRD)
## BudgetApp - Personal Finance Management Application

### 1. Executive Summary

BudgetApp is a comprehensive personal finance management application designed to help users track expenses, manage budgets, monitor investments, and gain insights into their financial health through an intuitive dashboard and visualization tools.

### 2. Product Overview

#### 2.1 Vision
To provide users with a powerful yet simple tool to take control of their financial life, enabling better spending decisions and wealth management.

#### 2.2 Target Users
- Individuals seeking to manage personal finances
- Young professionals tracking expenses and investments
- Families managing household budgets
- Anyone wanting to monitor their net worth and financial obligations

### 3. Core Features

#### 3.1 User Authentication & Profile Management
- **Registration/Login**
  - Email-based registration with password
  - Secure authentication using JWT tokens
  - Password reset functionality
  - Session management
- **Profile Management**
  - Edit personal information
  - Upload profile picture
  - Currency preferences
  - Notification settings
  - Account security settings

#### 3.2 Account Management
- **Multiple Accounts**
  - Add bank accounts, credit cards, cash accounts
  - Set account balance
  - Account types: Savings, Current, Credit Card, Cash, Digital Wallet
  - Active/Inactive status
  - Account color coding for visual identification

#### 3.3 Transaction Management
- **Add Transactions**
  - Income/Expense types
  - Amount, date, and description
  - Link to specific account
  - Attach receipts/bills (image upload)
  - Recurring transaction support
- **Categorization**
  - Default categories: Food, Transport, Shopping, Entertainment, Bills, Healthcare, Education, etc.
  - Custom category creation
  - Category icons and colors
- **Tagging System**
  - Create custom tags
  - Multi-tag support per transaction
  - Tag-based filtering and search
- **Transaction Views**
  - List view with filters
  - Search functionality
  - Sort by date, amount, category
  - Bulk operations (delete, edit category)

#### 3.4 Dashboard
- **Customizable Widgets**
  - Drag-and-drop widget arrangement
  - Add/remove widgets
  - Resize widgets
- **Available Widgets**
  - Monthly spending overview (pie chart)
  - Income vs Expense (bar chart)
  - Category-wise breakdown
  - Recent transactions
  - Account balances summary
  - Monthly/Yearly trends (line chart)
  - Budget progress bars
  - Top spending categories
  - Net worth tracker
- **Time Period Selection**
  - Current month, last month
  - Custom date ranges
  - Year-to-date view
  - Comparative analysis (month-over-month)

#### 3.5 Additional Features

##### 3.5.1 Reminders
- **Payment Reminders**
  - Set recurring reminders (EMI, Insurance, Rent, etc.)
  - Notification preferences (email, in-app)
  - Reminder frequency (monthly, quarterly, yearly)
  - Amount and payee information
  - Mark as paid functionality
  - Upcoming payments calendar view

##### 3.5.2 Warranty Tracker
- **Product Warranty Management**
  - Add product details
  - Purchase date and price
  - Warranty period
  - Store/seller information
  - Upload warranty documents/receipts
  - Expiry notifications
  - Search and filter warranties
  - Warranty status (Active/Expired/Expiring Soon)

##### 3.5.3 Investment Portfolio
- **Investment Types**
  - Fixed Deposits (FD)
  - Recurring Deposits (RD)
  - Mutual Funds
  - Stocks
  - Bonds
  - Real Estate
  - Gold/Commodities
  - Cryptocurrency
- **Investment Details**
  - Current value
  - Invested amount
  - Returns calculation
  - Maturity dates
  - Institution/Platform details
- **Portfolio Analytics**
  - Total portfolio value
  - Asset allocation chart
  - Returns summary
  - Investment timeline

##### 3.5.4 Loan Management
- **Loan Types**
  - Home Loan
  - Personal Loan
  - Vehicle Loan
  - Education Loan
  - Credit Card Debt
- **Loan Details**
  - Principal amount
  - Interest rate
  - EMI amount
  - Tenure
  - Outstanding balance
  - Next payment date
  - Prepayment calculator
- **Loan Analytics**
  - Total debt
  - Monthly obligations
  - Interest paid vs principal
  - Loan completion timeline

#### 3.6 Landing Page
- **Hero Section**
  - Compelling headline and subtext
  - Call-to-action buttons (Sign Up, Learn More)
  - Hero image/animation
- **Features Section**
  - Icon-based feature highlights
  - Brief descriptions
  - Smooth scroll animations
- **Benefits Section**
  - Value propositions
  - User testimonials (future)
- **Pricing Section** (if applicable)
- **Footer**
  - Links to privacy policy, terms
  - Contact information
  - Social media links

### 4. Technical Specifications

#### 4.1 Frontend Architecture
```
src/
├── components/
│   ├── common/
│   ├── layout/
│   └── ui/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── transactions/
│   ├── accounts/
│   ├── investments/
│   ├── loans/
│   ├── reminders/
│   └── warranty/
├── hooks/
├── services/
├── store/
├── utils/
├── styles/
└── tests/
```

#### 4.2 Backend Architecture
```
server/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
└── tests/
```

#### 4.3 Database Schema

**Users Collection**
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    currency: String,
    timezone: String
  },
  preferences: {
    dashboardLayout: Object,
    notifications: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Accounts Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  type: String,
  balance: Number,
  currency: String,
  color: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Transactions Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  accountId: ObjectId,
  type: String (income/expense),
  amount: Number,
  category: String,
  tags: [String],
  description: String,
  date: Date,
  attachments: [String],
  isRecurring: Boolean,
  recurringDetails: Object,
  createdAt: Date,
  updatedAt: Date
}
```

**Categories Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  icon: String,
  color: String,
  type: String (income/expense),
  isDefault: Boolean,
  createdAt: Date
}
```

**Reminders Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  amount: Number,
  dueDate: Date,
  frequency: String,
  category: String,
  isActive: Boolean,
  lastNotified: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Warranties Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  productName: String,
  purchaseDate: Date,
  expiryDate: Date,
  price: Number,
  seller: String,
  documents: [String],
  notes: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Investments Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  type: String,
  investedAmount: Number,
  currentValue: Number,
  startDate: Date,
  maturityDate: Date,
  returns: Number,
  institution: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Loans Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  loanType: String,
  principal: Number,
  interestRate: Number,
  tenure: Number,
  emiAmount: Number,
  startDate: Date,
  outstandingAmount: Number,
  lender: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. API Endpoints

#### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

#### User Profile
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `POST /api/users/avatar`
- `PUT /api/users/preferences`

#### Accounts
- `GET /api/accounts`
- `POST /api/accounts`
- `PUT /api/accounts/:id`
- `DELETE /api/accounts/:id`

#### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `POST /api/transactions/bulk-delete`
- `GET /api/transactions/summary`

#### Categories
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

#### Dashboard
- `GET /api/dashboard/widgets`
- `PUT /api/dashboard/layout`
- `GET /api/dashboard/stats`

#### Reminders
- `GET /api/reminders`
- `POST /api/reminders`
- `PUT /api/reminders/:id`
- `DELETE /api/reminders/:id`
- `POST /api/reminders/:id/complete`

#### Warranties
- `GET /api/warranties`
- `POST /api/warranties`
- `PUT /api/warranties/:id`
- `DELETE /api/warranties/:id`

#### Investments
- `GET /api/investments`
- `POST /api/investments`
- `PUT /api/investments/:id`
- `DELETE /api/investments/:id`
- `GET /api/investments/summary`

#### Loans
- `GET /api/loans`
- `POST /api/loans`
- `PUT /api/loans/:id`
- `DELETE /api/loans/:id`
- `GET /api/loans/summary`

### 6. Security Considerations

- JWT-based authentication with refresh tokens
- Password hashing using bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting on API endpoints
- HTTPS enforcement in production
- Environment variable management
- MongoDB connection security
- File upload validation and size limits

### 7. Performance Requirements

- Page load time < 3 seconds
- API response time < 500ms for most endpoints
- Support for 10,000+ transactions per user
- Real-time dashboard updates
- Optimized database queries with proper indexing
- Client-side caching with React Query
- Image optimization for uploads

### 8. Deployment Configuration

#### Environment Variables

**Frontend (.env)**
```
REACT_APP_API_URL=
REACT_APP_ENVIRONMENT=
```

**Backend (.env)**
```
NODE_ENV=
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRE=
JWT_REFRESH_EXPIRE=
FRONTEND_URL=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
UPLOAD_SIZE_LIMIT=
```

### 9. Future Enhancements

- Mobile application (React Native)
- Budget planning and goals
- Bill splitting with friends
- Export data (CSV, PDF reports)
- Multi-currency support
- Bank account integration (Open Banking APIs)
- AI-powered spending insights
- Collaborative budgets for families
- Recurring transaction automation
- Tax calculation and filing assistance

### 10. Success Metrics

- User retention rate
- Daily/Monthly active users
- Average transactions per user
- Dashboard engagement time
- Feature adoption rates
- User satisfaction scores
- System uptime and performance
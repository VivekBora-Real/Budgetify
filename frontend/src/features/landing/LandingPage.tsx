import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Bell, 
  PieChart, 
  CreditCard,
  Moon,
  Sun,
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleTheme } from '../../store/slices/uiSlice';

const features = [
  {
    icon: PieChart,
    title: 'Smart Dashboard',
    description: 'Visualize your finances with customizable widgets and real-time insights.',
  },
  {
    icon: CreditCard,
    title: 'Multiple Accounts',
    description: 'Manage all your bank accounts, credit cards, and cash in one place.',
  },
  {
    icon: TrendingUp,
    title: 'Investment Tracking',
    description: 'Monitor your investments and track returns across different asset classes.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never miss a payment with automated reminders for bills and EMIs.',
  },
  {
    icon: Shield,
    title: 'Warranty Tracker',
    description: 'Keep track of product warranties and get notified before they expire.',
  },
  {
    icon: DollarSign,
    title: 'Expense Analytics',
    description: 'Detailed insights into your spending patterns and financial habits.',
  },
];

const benefits = [
  'Free to use forever',
  'Bank-level security',
  'Automatic categorization',
  'Multi-currency support',
  'Export to CSV/PDF',
  'Mobile responsive',
];

const LandingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">BudgetApp</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleTheme())}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Take Control of Your
            <span className="text-primary"> Financial Future</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track expenses, manage budgets, monitor investments, and achieve your financial goals 
            with our comprehensive personal finance management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Forever
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Manage Your Money
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Why Choose BudgetApp?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of users who have transformed their financial lives with our 
                intuitive and powerful budgeting tools.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8">
              <div className="bg-card rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Start Your Journey</h3>
                <p className="text-muted-foreground mb-6">
                  Take the first step towards financial freedom. Create your account in less 
                  than a minute and start tracking your finances today.
                </p>
                <Link to="/register">
                  <Button className="w-full">Create Free Account</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join BudgetApp today and start your journey towards better financial management. 
            It's free, secure, and takes less than a minute to get started.
          </p>
          <Link to="/register">
            <Button size="lg">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 BudgetApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
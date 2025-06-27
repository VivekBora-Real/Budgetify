import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet2, 
  TrendingUp, 
  Shield, 
  Zap, 
  PieChart, 
  CreditCard,
  Moon,
  Sun,
  ArrowRight,
  BarChart3,
  Sparkles,
  Lock,
  Smartphone,
  Globe,
  UserCircle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleTheme } from '../../store/slices/uiSlice';

const features = [
  {
    icon: PieChart,
    title: 'Smart Dashboard',
    description: 'Visualize your finances with interactive charts and real-time insights.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: CreditCard,
    title: 'Multiple Accounts',
    description: 'Manage all your bank accounts, credit cards, and cash in one place.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: 'Investment Tracking',
    description: 'Monitor your portfolio and track returns across different assets.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    description: 'AI-powered analytics to help you make smarter financial decisions.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your data is encrypted and protected with enterprise-grade security.',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    icon: BarChart3,
    title: 'Expense Analytics',
    description: 'Detailed breakdown of spending patterns and saving opportunities.',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '$2.5M+', label: 'Money Tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Freelancer',
    content: 'Budgetify transformed how I manage my finances. The investment tracking feature is a game-changer!',
  },
  {
    name: 'Mike Chen',
    role: 'Small Business Owner',
    content: 'Finally, a finance app that\'s both powerful and easy to use. Highly recommended!',
  },
  {
    name: 'Emily Davis',
    role: 'Teacher',
    content: 'The insights I get from Budgetify help me save more and spend smarter. Love it!',
  },
];

const LandingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet2 className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Budgetify
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleTheme())}
              className="hover:scale-110 transition-transform"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="hover:scale-105 transition-transform">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6 animate-bounce-slow">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Trusted by 50,000+ users worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Your Money,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60 animate-gradient">
              Simplified
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-in-up">
            Take control of your financial future with Budgetify's powerful tools. 
            Track expenses, manage investments, and achieve your goals - all in one beautiful app.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Link to="/register">
              <Button size="lg" className="group relative overflow-hidden hover:scale-105 transition-all duration-300 shadow-xl">
                <span className="relative z-10 flex items-center">
                  Start Free Forever
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="group hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                <UserCircle className="mr-2 h-5 w-5" />
                Try Demo Account
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fade-in-up delay-300">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary animate-count-up">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features to help you manage money like a pro
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-card border rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Getting Started is Easy
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to financial clarity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
            
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your free account in seconds' },
              { step: '2', title: 'Connect', desc: 'Add your accounts and start tracking' },
              { step: '3', title: 'Grow', desc: 'Get insights and achieve your goals' },
            ].map((item, index) => (
              <div key={index} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="relative z-10 bg-card border rounded-2xl p-8">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands who've taken control of their money. 
            Start your journey today - it's completely free!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="group shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span>Available Worldwide</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span>Mobile Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Wallet2 className="h-6 w-6 text-primary" />
              <span className="font-semibold">Budgetify</span>
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Budgetify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
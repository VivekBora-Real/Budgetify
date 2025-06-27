import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  CreditCard,
  PiggyBank,
  Banknote,
  Sparkles,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dashboardService from '@/services/dashboard.service';

interface BalanceOverviewProps {
  data?: any;
}

const BalanceOverviewWidget: React.FC<BalanceOverviewProps> = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardService.getOverview(),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 animate-pulse text-primary" />
              <span className="text-muted-foreground">Loading financial data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: 'Total Balance',
      value: formatCurrency(stats.totalBalance),
      icon: Wallet,
      trend: 12.5,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
      description: 'All accounts combined'
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(stats.monthlyIncome),
      icon: TrendingUp,
      trend: 8.2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600',
      description: 'This month\'s earnings'
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(stats.monthlyExpenses),
      icon: CreditCard,
      trend: -3.4,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-red-600',
      description: 'This month\'s spending'
    },
    {
      title: 'Savings Rate',
      value: formatPercentage(stats.savingsRate),
      icon: PiggyBank,
      trend: 5.1,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600',
      description: 'Income saved this month'
    },
    {
      title: 'Net Worth',
      value: formatCurrency(stats.netWorth),
      icon: Banknote,
      trend: 15.3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-indigo-600',
      description: 'Assets minus liabilities'
    },
    {
      title: 'Total Debt',
      value: formatCurrency(stats.debtAmount),
      icon: DollarSign,
      trend: -8.7,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-orange-600',
      description: 'Outstanding loans'
    },
  ];

  return (
    <Card className="h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Financial Overview</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">Updated just now</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div 
                key={index} 
                className="group relative bg-card border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Background gradient effect */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                  `bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo}`
                )} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                    </div>
                    <div className={cn(
                      'p-2.5 rounded-xl transition-transform group-hover:scale-110',
                      card.bgColor
                    )}>
                      <Icon className={cn('h-5 w-5', card.color)} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                    <div className="flex items-center gap-1">
                      {card.trend > 0 ? (
                        <ArrowUpIcon className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-semibold',
                          card.trend > 0 ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {Math.abs(card.trend)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Investment summary */}
        <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Investment Portfolio</p>
                <p className="text-xs text-muted-foreground">{stats.accountsCount} active accounts</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatCurrency(stats.investmentValue)}</p>
              <p className="text-xs text-green-600 font-medium">+18.4% YTD</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceOverviewWidget;
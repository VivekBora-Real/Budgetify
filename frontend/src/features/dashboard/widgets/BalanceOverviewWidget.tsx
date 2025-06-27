import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, Wallet, CreditCard } from 'lucide-react';
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
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-full">
            Loading...
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
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(stats.monthlyIncome),
      icon: ArrowUpIcon,
      trend: 8.2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(stats.monthlyExpenses),
      icon: ArrowDownIcon,
      trend: -3.4,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Savings Rate',
      value: formatPercentage(stats.savingsRate),
      icon: TrendingUp,
      trend: 5.1,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Net Worth',
      value: formatCurrency(stats.netWorth),
      icon: DollarSign,
      trend: 15.3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Total Debt',
      value: formatCurrency(stats.debtAmount),
      icon: CreditCard,
      trend: -8.7,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <div className={cn('p-2 rounded-full', card.bgColor)}>
                    <Icon className={cn('h-4 w-4', card.color)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{card.value}</p>
                  <div className="flex items-center gap-1">
                    {card.trend > 0 ? (
                      <ArrowUpIcon className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={cn(
                        'text-xs font-medium',
                        card.trend > 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {Math.abs(card.trend)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceOverviewWidget;
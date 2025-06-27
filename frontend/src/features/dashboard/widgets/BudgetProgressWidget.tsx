import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import dashboardService from '@/services/dashboard.service';

interface BudgetItem {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
  status: 'on-track' | 'warning' | 'exceeded';
}

interface BudgetProgressProps {
  budgets?: BudgetItem[];
}

const BudgetProgressWidget: React.FC<BudgetProgressProps> = () => {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['dashboard-budget-progress'],
    queryFn: () => dashboardService.getBudgetProgress(),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const getStatusColor = (status: BudgetItem['status']) => {
    const colors = {
      'on-track': 'text-green-600 bg-green-50',
      'warning': 'text-yellow-600 bg-yellow-50',
      'exceeded': 'text-red-600 bg-red-50',
    };
    return colors[status];
  };

  const getStatusIcon = (status: BudgetItem['status']) => {
    if (status === 'on-track') return CheckCircle;
    return AlertCircle;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 70) return 'bg-green-500';
    if (percentage <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
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

  const data = budgets || [];
  const totalBudget = data.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = data.reduce((sum, item) => sum + item.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Budget Progress</CardTitle>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {overallPercentage.toFixed(0)}% Used
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No budget data available
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Budget</span>
                <span className="font-medium">
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                </span>
              </div>
              <Progress 
                value={overallPercentage} 
                className="h-3"
                style={{
                  '--progress-background': getProgressColor(overallPercentage),
                } as any}
              />
            </div>
            
            <div className="space-y-3 mt-6">
              {data.map((budget, index) => {
                const StatusIcon = getStatusIcon(budget.status);
                return (
                  <div key={index} className="space-y-2 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{budget.category}</span>
                        <div className={cn('p-1 rounded-full', getStatusColor(budget.status))}>
                          <StatusIcon className="h-3 w-3" />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(budget.percentage, 100)} 
                      className="h-2"
                      style={{
                        '--progress-background': getProgressColor(budget.percentage),
                      } as any}
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {budget.percentage}% used
                      </span>
                      <span className={cn(
                        'font-medium',
                        budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {budget.remaining >= 0 ? 'Remaining: ' : 'Over: '}
                        {formatCurrency(budget.remaining)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgressWidget;
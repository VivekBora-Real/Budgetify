import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  Target,
  Wallet,
  ArrowRight,
  Activity,
  Sparkles,
  Info,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dashboardService from '@/services/dashboard.service';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Housing': Home,
      'Food & Dining': Utensils,
      'Transportation': Car,
      'Shopping': ShoppingBag,
      'Entertainment': Sparkles,
      'Utilities': Zap,
    };
    return icons[category] || Wallet;
  };

  const getStatusConfig = (status: BudgetItem['status']) => {
    const configs = {
      'on-track': {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-950',
        border: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        label: 'On Track',
        gradient: 'from-green-500 to-green-600'
      },
      'warning': {
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: AlertCircle,
        label: 'Warning',
        gradient: 'from-yellow-500 to-yellow-600'
      },
      'exceeded': {
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950',
        border: 'border-red-200 dark:border-red-800',
        icon: AlertCircle,
        label: 'Exceeded',
        gradient: 'from-red-500 to-red-600'
      },
    };
    return configs[status];
  };

  const getProgressGradient = (percentage: number) => {
    if (percentage <= 50) return 'from-green-500 to-emerald-500';
    if (percentage <= 75) return 'from-yellow-500 to-amber-500';
    if (percentage <= 90) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 animate-pulse text-primary" />
              <span className="text-muted-foreground">Loading budget data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = budgets || [];
  const totalBudget = data.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = data.reduce((sum, item) => sum + item.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const totalRemaining = totalBudget - totalSpent;

  // Count statuses
  const statusCounts = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Budget Progress</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/budget')}
            className="hover:bg-primary/10"
          >
            Manage
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-3">No budgets set</p>
            <Button 
              size="sm" 
              onClick={() => navigate('/budget')}
              className="bg-primary/10 hover:bg-primary/20 text-primary"
            >
              Create your first budget
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Progress Card */}
            <div className={cn(
              "p-4 rounded-xl border transition-all",
              overallPercentage > 90 ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800' :
              overallPercentage > 75 ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' :
              'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className={cn(
                    "h-4 w-4",
                    overallPercentage > 90 ? 'text-red-600' :
                    overallPercentage > 75 ? 'text-yellow-600' :
                    'text-green-600'
                  )} />
                  <span className="text-sm font-medium">Overall Budget Health</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {overallPercentage.toFixed(0)}% Used
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={Math.min(overallPercentage, 100)} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">
                    {formatCurrency(totalSpent)} spent
                  </span>
                  <span className={cn(
                    "font-medium",
                    totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {totalRemaining >= 0 ? formatCurrency(totalRemaining) + ' left' : formatCurrency(totalRemaining) + ' over'}
                  </span>
                </div>
              </div>
              
              {/* Status Summary */}
              <div className="flex gap-2 mt-3">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const config = getStatusConfig(status as BudgetItem['status']);
                  return (
                    <div key={status} className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg text-xs",
                      config.bg,
                      config.border,
                      "border"
                    )}>
                      <config.icon className={cn("h-3 w-3", config.color)} />
                      <span className={config.color}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Category Budgets */}
            <div className="space-y-3">
              {data.map((budget, index) => {
                const statusConfig = getStatusConfig(budget.status);
                const CategoryIcon = getCategoryIcon(budget.category);
                const progressGradient = getProgressGradient(budget.percentage);
                
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "group p-4 rounded-xl border transition-all hover:shadow-md",
                      "hover:border-primary/20",
                      budget.status === 'exceeded' && "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg transition-transform group-hover:scale-110",
                          statusConfig.bg
                        )}>
                          <CategoryIcon className={cn("h-4 w-4", statusConfig.color)} />
                        </div>
                        <div>
                          <p className="font-medium">{budget.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {budget.percentage.toFixed(0)}% of {formatCurrency(budget.budget)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(budget.spent)}</p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs border",
                            statusConfig.border,
                            statusConfig.bg,
                            statusConfig.color
                          )}
                        >
                          <statusConfig.icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Progress 
                        value={Math.min(budget.percentage, 100)} 
                        className="h-2"
                      />
                      <div 
                        className={cn(
                          "absolute top-0 left-0 h-full rounded-full bg-gradient-to-r opacity-80",
                          progressGradient
                        )}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className={cn(
                        "text-xs font-medium",
                        budget.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {budget.remaining >= 0 
                          ? `${formatCurrency(budget.remaining)} remaining` 
                          : `${formatCurrency(budget.remaining)} over budget`}
                      </span>
                      {budget.status === 'warning' && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Slow down spending
                        </span>
                      )}
                      {budget.status === 'exceeded' && (
                        <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Budget exceeded
                        </span>
                      )}
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
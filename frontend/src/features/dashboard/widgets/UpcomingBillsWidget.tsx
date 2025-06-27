import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Zap,
  Home,
  Shield,
  Receipt,
  Activity,
  Bell,
  TrendingUp,
  Repeat,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import dashboardService, { UpcomingBill } from '@/services/dashboard.service';

interface UpcomingBillsProps {
  bills?: UpcomingBill[];
}

const UpcomingBillsWidget: React.FC<UpcomingBillsProps> = () => {
  const { data: bills, isLoading } = useQuery({
    queryKey: ['dashboard-upcoming-bills'],
    queryFn: () => dashboardService.getUpcomingBills(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
  });
  const today = new Date();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), today);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Bills & Utilities': Zap,
      'Rent': Home,
      'Loan Payment': CreditCard,
      'Insurance': Shield,
    };
    return icons[category] || Receipt;
  };

  const getDueDateDisplay = (dueDate: string) => {
    const date = new Date(dueDate);
    const days = getDaysUntilDue(dueDate);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (days < 0) return 'Overdue';
    if (days <= 7) return `In ${days} days`;
    return format(date, 'MMM d');
  };

  const getDueDateStatus = (daysUntil: number, isPaid: boolean) => {
    if (isPaid) return { 
      color: 'text-green-600 dark:text-green-400', 
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      dotColor: 'bg-green-500',
      priority: 0
    };
    if (daysUntil < 0) return { 
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      dotColor: 'bg-red-500',
      priority: 4
    };
    if (daysUntil === 0) return { 
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      dotColor: 'bg-red-500',
      priority: 3
    };
    if (daysUntil <= 3) return { 
      color: 'text-orange-600 dark:text-orange-400', 
      bg: 'bg-orange-50 dark:bg-orange-950',
      border: 'border-orange-200 dark:border-orange-800',
      dotColor: 'bg-orange-500',
      priority: 2
    };
    return { 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      dotColor: 'bg-blue-500',
      priority: 1
    };
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20 overflow-hidden">
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 animate-pulse text-primary" />
            <span className="text-muted-foreground">Loading bills...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = bills || [];
  const sortedBills = [...data].sort((a, b) => {
    const daysA = getDaysUntilDue(a.dueDate);
    const daysB = getDaysUntilDue(b.dueDate);
    const statusA = getDueDateStatus(daysA, a.isPaid);
    const statusB = getDueDateStatus(daysB, b.isPaid);
    return statusB.priority - statusA.priority || daysA - daysB;
  });

  const unpaidBills = data.filter(bill => !bill.isPaid);
  const totalUpcoming = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const overdueBills = unpaidBills.filter(bill => getDaysUntilDue(bill.dueDate) < 0);
  const dueSoonBills = unpaidBills.filter(bill => {
    const days = getDaysUntilDue(bill.dueDate);
    return days >= 0 && days <= 3;
  });

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Upcoming Bills</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">This month</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-6 pb-6">
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-3">No bills tracked</p>
            <p className="text-xs text-muted-foreground">Bills will appear here</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Total Due</span>
                  <TrendingUp className="h-3 w-3 text-primary" />
                </div>
                <p className="font-bold text-lg">{formatCurrency(totalUpcoming)}</p>
                <p className="text-xs text-muted-foreground">{unpaidBills.length} unpaid bills</p>
              </div>
              
              <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-orange-600 dark:text-orange-400">Attention</span>
                  <AlertCircle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="font-bold text-lg text-orange-600 dark:text-orange-400">
                  {overdueBills.length + dueSoonBills.length}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {overdueBills.length > 0 && `${overdueBills.length} overdue`}
                  {overdueBills.length > 0 && dueSoonBills.length > 0 && ', '}
                  {dueSoonBills.length > 0 && `${dueSoonBills.length} due soon`}
                </p>
              </div>
            </div>

            {/* Bills List */}
            <div className="space-y-2">
              {sortedBills.slice(0, 5).map((bill) => {
                const daysUntil = getDaysUntilDue(bill.dueDate);
                const status = getDueDateStatus(daysUntil, bill.isPaid);
                const CategoryIcon = getCategoryIcon(bill.category);
                
                return (
                  <div
                    key={bill.id}
                    className={cn(
                      'group p-3 rounded-lg border transition-all',
                      'hover:shadow-sm hover:border-primary/20',
                      bill.isPaid && 'opacity-60',
                      daysUntil < 0 && !bill.isPaid && 'bg-red-50/50 dark:bg-red-950/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        status.bg
                      )}>
                        <CategoryIcon className={cn("h-4 w-4", status.color)} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={cn(
                            'font-medium text-sm truncate', 
                            bill.isPaid && 'line-through text-muted-foreground'
                          )}>
                            {bill.name}
                          </p>
                          {bill.isRecurring && (
                            <Badge 
                              variant="outline" 
                              className="text-xs h-5 px-1"
                            >
                              <Repeat className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{bill.category}</span>
                          <span>•</span>
                          <span>{format(new Date(bill.dueDate), 'MMM d')}</span>
                        </div>
                      </div>
                      
                      {/* Right side */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(bill.amount)}</p>
                          <div className="flex items-center gap-1 justify-end">
                            <div className={cn("w-2 h-2 rounded-full", status.dotColor)} />
                            <span className={cn("text-xs", status.color)}>
                              {getDueDateDisplay(bill.dueDate)}
                            </span>
                          </div>
                        </div>
                        {!bill.isPaid && (
                          <Button 
                            size="sm" 
                            variant={daysUntil <= 0 ? 'destructive' : 'outline'}
                            className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {data.length > 5 && (
              <div className="mt-3 pt-3 border-t text-center">
                <span className="text-xs text-muted-foreground">
                  Showing 5 of {data.length} bills
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBillsWidget;
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Home,
  Shield,
  Receipt,
  Activity,
  ArrowRight,
  Bell,
  TrendingUp,
  Repeat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import dashboardService, { UpcomingBill } from '@/services/dashboard.service';
import { useNavigate } from 'react-router-dom';

interface UpcomingBillsProps {
  bills?: UpcomingBill[];
}

const UpcomingBillsWidget: React.FC<UpcomingBillsProps> = () => {
  const navigate = useNavigate();
  const { data: bills, isLoading } = useQuery({
    queryKey: ['dashboard-upcoming-bills'],
    queryFn: () => dashboardService.getUpcomingBills(),
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
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days <= 7) return `${days} days`;
    return format(date, 'MMM d');
  };

  const getDueDateStatus = (daysUntil: number, isPaid: boolean, dueDate: string) => {
    if (isPaid) return { 
      color: 'text-green-600 dark:text-green-400', 
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      label: 'Paid',
      icon: CheckCircle,
      priority: 0
    };
    if (daysUntil < 0) return { 
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      label: 'Overdue',
      icon: AlertTriangle,
      priority: 4
    };
    if (daysUntil === 0) return { 
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      label: 'Due Today',
      icon: AlertTriangle,
      priority: 3
    };
    if (daysUntil <= 3) return { 
      color: 'text-orange-600 dark:text-orange-400', 
      bg: 'bg-orange-50 dark:bg-orange-950',
      border: 'border-orange-200 dark:border-orange-800',
      label: 'Due Soon',
      icon: Clock,
      priority: 2
    };
    return { 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      label: getDueDateDisplay(dueDate),
      icon: Calendar,
      priority: 1
    };
  };

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 animate-pulse text-primary" />
              <span className="text-muted-foreground">Loading bills...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = bills || [];
  const sortedBills = [...data].sort((a, b) => {
    const daysA = getDaysUntilDue(a.dueDate);
    const daysB = getDaysUntilDue(b.dueDate);
    const statusA = getDueDateStatus(daysA, a.isPaid, a.dueDate);
    const statusB = getDueDateStatus(daysB, b.isPaid, b.dueDate);
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
    <Card className="h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Upcoming Bills</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/bills')}
            className="hover:bg-primary/10"
          >
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-3">No bills tracked</p>
            <Button 
              size="sm" 
              onClick={() => navigate('/bills')}
              className="bg-primary/10 hover:bg-primary/20 text-primary"
            >
              Add your first bill
            </Button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <p className="font-bold text-lg">{formatCurrency(totalUpcoming)}</p>
              </div>
              
              {overdueBills.length > 0 && (
                <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs text-red-600 dark:text-red-400">Overdue</span>
                  </div>
                  <p className="font-bold text-lg text-red-600 dark:text-red-400">{overdueBills.length}</p>
                </div>
              )}
              
              {dueSoonBills.length > 0 && (
                <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-1">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs text-orange-600 dark:text-orange-400">Due Soon</span>
                  </div>
                  <p className="font-bold text-lg text-orange-600 dark:text-orange-400">{dueSoonBills.length}</p>
                </div>
              )}
            </div>

            {/* Bills List */}
            <div className="space-y-3">
              {sortedBills.slice(0, 5).map((bill) => {
                const daysUntil = getDaysUntilDue(bill.dueDate);
                const status = getDueDateStatus(daysUntil, bill.isPaid, bill.dueDate);
                const CategoryIcon = getCategoryIcon(bill.category);
                
                return (
                  <div
                    key={bill.id}
                    className={cn(
                      'group p-4 rounded-xl border transition-all hover:shadow-md',
                      'hover:border-primary/20',
                      bill.isPaid && 'opacity-60',
                      daysUntil < 0 && !bill.isPaid && 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2.5 rounded-lg transition-transform group-hover:scale-110",
                          status.bg
                        )}>
                          <CategoryIcon className={cn("h-4 w-4", status.color)} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              'font-medium', 
                              bill.isPaid && 'line-through text-muted-foreground'
                            )}>
                              {bill.name}
                            </p>
                            {bill.isRecurring && (
                              <Badge 
                                variant="outline" 
                                className="text-xs border-primary/20 bg-primary/5"
                              >
                                <Repeat className="h-3 w-3 mr-1" />
                                {bill.frequency}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(bill.dueDate), 'MMM d, yyyy')}</span>
                            <span>•</span>
                            <span>{bill.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(bill.amount)}</p>
                          <Badge 
                            variant="outline"
                            className={cn(
                              'text-xs border gap-1',
                              status.border,
                              status.bg,
                              status.color
                            )}
                          >
                            <status.icon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        {!bill.isPaid && (
                          <Button 
                            size="sm" 
                            variant={daysUntil <= 0 ? 'destructive' : 'outline'}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {data.length > 5 && (
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full hover:bg-primary/5"
                  onClick={() => navigate('/bills')}
                >
                  <span className="text-sm text-muted-foreground">
                    View all {data.length} bills
                  </span>
                  <ArrowRight className="h-3 w-3 ml-2 text-muted-foreground" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBillsWidget;
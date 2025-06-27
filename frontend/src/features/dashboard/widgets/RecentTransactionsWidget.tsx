import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  Receipt,
  ShoppingBag,
  Car,
  Home,
  Heart,
  Gamepad2,
  Briefcase,
  Utensils,
  Zap,
  Activity,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import dashboardService from '@/services/dashboard.service';

interface Transaction {
  _id: string;
  accountId: {
    _id: string;
    name: string;
    type: string;
    color: string;
  };
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  tags: string[];
  isRecurring: boolean;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

const RecentTransactionsWidget: React.FC<RecentTransactionsProps> = () => {
  const navigate = useNavigate();
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['dashboard-recent-transactions'],
    queryFn: () => dashboardService.getRecentTransactions(5),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Income': Briefcase,
      'Food & Dining': Utensils,
      'Shopping': ShoppingBag,
      'Transportation': Car,
      'Utilities': Zap,
      'Entertainment': Gamepad2,
      'Healthcare': Heart,
      'Housing': Home,
      'Other': Receipt,
    };
    return icons[category] || Receipt;
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      'Income': { 
        bg: 'bg-green-50 dark:bg-green-950', 
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800'
      },
      'Food & Dining': { 
        bg: 'bg-orange-50 dark:bg-orange-950', 
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800'
      },
      'Shopping': { 
        bg: 'bg-purple-50 dark:bg-purple-950', 
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800'
      },
      'Transportation': { 
        bg: 'bg-yellow-50 dark:bg-yellow-950', 
        text: 'text-yellow-700 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800'
      },
      'Utilities': { 
        bg: 'bg-blue-50 dark:bg-blue-950', 
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800'
      },
      'Entertainment': { 
        bg: 'bg-pink-50 dark:bg-pink-950', 
        text: 'text-pink-700 dark:text-pink-300',
        border: 'border-pink-200 dark:border-pink-800'
      },
      'Healthcare': { 
        bg: 'bg-red-50 dark:bg-red-950', 
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800'
      },
    };
    return styles[category] || { 
      bg: 'bg-gray-50 dark:bg-gray-950', 
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-800'
    };
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const transactionDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return format(transactionDate, 'MMM d');
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20 overflow-hidden">
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 animate-pulse text-primary" />
            <span className="text-muted-foreground">Loading transactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/transactions')}
            className="hover:bg-primary/10 transition-colors"
          >
            View All
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-6 pb-6">
        <div className="flex-1 flex flex-col space-y-3">
          {!transactions || transactions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
              <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-3">No transactions yet</p>
              <Button 
                size="sm" 
                onClick={() => navigate('/transactions')}
                className="bg-primary/10 hover:bg-primary/20 text-primary"
              >
                Add your first transaction
              </Button>
              </div>
            </div>
          ) : (
            transactions.map((transaction: Transaction) => {
              const CategoryIcon = getCategoryIcon(transaction.category);
              const categoryStyle = getCategoryStyle(transaction.category);
              
              return (
                <div
                  key={transaction._id}
                  className="group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'p-3 rounded-xl transition-transform group-hover:scale-110',
                        transaction.type === 'income' 
                          ? 'bg-gradient-to-br from-green-500 to-green-600' 
                          : categoryStyle.bg
                      )}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowDownRight className="h-5 w-5 text-white" />
                      ) : (
                        <CategoryIcon className={cn('h-5 w-5', categoryStyle.text)} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-1">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs border',
                            categoryStyle.border,
                            categoryStyle.text,
                            categoryStyle.bg
                          )}
                        >
                          {transaction.category}
                        </Badge>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: transaction.accountId.color || '#6366f1' }} 
                          />
                          {transaction.accountId.name}
                        </span>
                        {transaction.isRecurring && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <Badge variant="secondary" className="text-xs">
                              Recurring
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={cn(
                          'font-bold text-lg',
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-900 dark:text-gray-100'
                        )}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(transaction.date)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {transactions && transactions.length > 0 && (
          <div className="pt-3 border-t">
            <Button 
              variant="ghost" 
              className="w-full hover:bg-primary/5"
              onClick={() => navigate('/transactions')}
            >
              <span className="text-sm text-muted-foreground">
                View all transactions
              </span>
              <ArrowUpRight className="h-3 w-3 ml-2 text-muted-foreground" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsWidget;
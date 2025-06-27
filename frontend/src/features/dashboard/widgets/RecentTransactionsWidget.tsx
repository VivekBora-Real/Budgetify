import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';
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
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Income': 'bg-green-100 text-green-800',
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Utilities': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Transportation': 'bg-yellow-100 text-yellow-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Healthcare': 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/transactions')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Start by adding your first transaction.
            </div>
          ) : (
            transactions.map((transaction: Transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    )}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowDownRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', getCategoryColor(transaction.category))}
                      >
                        {transaction.category}
                      </Badge>
                      <span>•</span>
                      <span>{transaction.accountId.name}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.date), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-semibold',
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant="default" className="text-xs">
                      completed
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsWidget;
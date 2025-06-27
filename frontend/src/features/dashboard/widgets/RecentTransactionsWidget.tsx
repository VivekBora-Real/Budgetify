import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  account: string;
  status: 'completed' | 'pending' | 'failed';
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

const RecentTransactionsWidget: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      description: 'Salary Deposit',
      category: 'Income',
      amount: 5000.00,
      type: 'income',
      date: new Date('2024-01-15'),
      account: 'Checking',
      status: 'completed',
    },
    {
      id: '2',
      description: 'Grocery Store',
      category: 'Food & Dining',
      amount: 125.50,
      type: 'expense',
      date: new Date('2024-01-14'),
      account: 'Credit Card',
      status: 'completed',
    },
    {
      id: '3',
      description: 'Electric Bill',
      category: 'Utilities',
      amount: 85.00,
      type: 'expense',
      date: new Date('2024-01-13'),
      account: 'Checking',
      status: 'pending',
    },
    {
      id: '4',
      description: 'Freelance Payment',
      category: 'Income',
      amount: 1200.00,
      type: 'income',
      date: new Date('2024-01-12'),
      account: 'Checking',
      status: 'completed',
    },
    {
      id: '5',
      description: 'Restaurant',
      category: 'Food & Dining',
      amount: 65.00,
      type: 'expense',
      date: new Date('2024-01-11'),
      account: 'Credit Card',
      status: 'completed',
    },
  ];

  const data = transactions || mockTransactions;

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

  const getStatusBadge = (status: Transaction['status']) => {
    const variants: Record<Transaction['status'], string> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };
    return variants[status];
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((transaction) => (
            <div
              key={transaction.id}
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
                    <span>{transaction.account}</span>
                    <span>•</span>
                    <span>{format(transaction.date, 'MMM d')}</span>
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
                  <Badge variant={getStatusBadge(transaction.status) as any} className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsWidget;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  category: string;
  isPaid: boolean;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'annually';
}

interface UpcomingBillsProps {
  bills?: Bill[];
}

const UpcomingBillsWidget: React.FC<UpcomingBillsProps> = ({ bills }) => {
  const mockBills: Bill[] = [
    {
      id: '1',
      name: 'Rent Payment',
      amount: 1800,
      dueDate: new Date('2024-02-01'),
      category: 'Housing',
      isPaid: false,
      isRecurring: true,
      frequency: 'monthly',
    },
    {
      id: '2',
      name: 'Internet & Cable',
      amount: 120,
      dueDate: new Date('2024-01-28'),
      category: 'Utilities',
      isPaid: false,
      isRecurring: true,
      frequency: 'monthly',
    },
    {
      id: '3',
      name: 'Car Insurance',
      amount: 350,
      dueDate: new Date('2024-01-25'),
      category: 'Insurance',
      isPaid: true,
      isRecurring: true,
      frequency: 'quarterly',
    },
    {
      id: '4',
      name: 'Gym Membership',
      amount: 50,
      dueDate: new Date('2024-01-30'),
      category: 'Health',
      isPaid: false,
      isRecurring: true,
      frequency: 'monthly',
    },
    {
      id: '5',
      name: 'Electricity Bill',
      amount: 85,
      dueDate: new Date('2024-02-05'),
      category: 'Utilities',
      isPaid: false,
      isRecurring: true,
      frequency: 'monthly',
    },
  ];

  const data = bills || mockBills;
  const today = new Date();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    return differenceInDays(dueDate, today);
  };

  const getDueDateStatus = (daysUntil: number, isPaid: boolean) => {
    if (isPaid) return { color: 'text-green-600 bg-green-50', label: 'Paid' };
    if (daysUntil < 0) return { color: 'text-red-600 bg-red-50', label: 'Overdue' };
    if (daysUntil <= 3) return { color: 'text-orange-600 bg-orange-50', label: 'Due Soon' };
    return { color: 'text-blue-600 bg-blue-50', label: `${daysUntil} days` };
  };

  const unpaidBills = data.filter(bill => !bill.isPaid);
  const totalUpcoming = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Bills</CardTitle>
        <Badge variant="outline" className="gap-1">
          <CreditCard className="h-3 w-3" />
          {formatCurrency(totalUpcoming)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((bill) => {
            const daysUntil = getDaysUntilDue(bill.dueDate);
            const status = getDueDateStatus(daysUntil, bill.isPaid);
            
            return (
              <div
                key={bill.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  bill.isPaid && 'opacity-60'
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={cn('font-medium', bill.isPaid && 'line-through')}>
                      {bill.name}
                    </p>
                    {bill.isRecurring && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {bill.frequency}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(bill.dueDate, 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span>{bill.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(bill.amount)}</p>
                    <Badge 
                      variant="secondary"
                      className={cn('text-xs', status.color)}
                    >
                      {!bill.isPaid && daysUntil <= 3 && (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {status.label}
                    </Badge>
                  </div>
                  {!bill.isPaid && (
                    <Button size="sm" variant="outline">
                      Pay
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="link" className="w-full">
            View All Bills →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingBillsWidget;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface ExpenseBreakdownProps {
  data?: ExpenseCategory[];
  period?: string;
}

const ExpenseBreakdownWidget: React.FC<ExpenseBreakdownProps> = ({ 
  data,
  period = 'This Month' 
}) => {
  const mockData: ExpenseCategory[] = [
    { category: 'Housing', amount: 1800, percentage: 33.8, color: '#3b82f6' },
    { category: 'Food & Dining', amount: 850, percentage: 16.0, color: '#10b981' },
    { category: 'Transportation', amount: 600, percentage: 11.3, color: '#f59e0b' },
    { category: 'Utilities', amount: 400, percentage: 7.5, color: '#8b5cf6' },
    { category: 'Shopping', amount: 550, percentage: 10.3, color: '#ec4899' },
    { category: 'Entertainment', amount: 350, percentage: 6.6, color: '#06b6d4' },
    { category: 'Healthcare', amount: 300, percentage: 5.6, color: '#f97316' },
    { category: 'Other', amount: 470, percentage: 8.8, color: '#6b7280' },
  ];

  const expenseData = data || mockData;
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Expense Breakdown</CardTitle>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-40">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
          <div className="space-y-3">
            {expenseData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
                <Progress 
                  value={category.percentage} 
                  className="h-2"
                  style={{
                    '--progress-background': category.color,
                  } as any}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdownWidget;
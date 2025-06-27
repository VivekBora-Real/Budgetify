import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import dashboardService from '@/services/dashboard.service';

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
  period = 'This Month' 
}) => {
  const { data: expenseData, isLoading } = useQuery({
    queryKey: ['dashboard-expense-breakdown'],
    queryFn: () => dashboardService.getExpenseBreakdown(),
  });

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

  const data = expenseData || [];
  const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Expense Breakdown</CardTitle>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expenses recorded this month
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </div>
            
            {/* Category List */}
            <div className="space-y-3">
              {data.map((category, index) => (
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
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdownWidget;
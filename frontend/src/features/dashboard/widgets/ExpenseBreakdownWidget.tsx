import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
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
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');
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
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-sm">{payload[0].name || payload[0].payload.category}</p>
          <p className="text-lg font-bold">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 animate-pulse text-primary" />
              <span className="text-muted-foreground">Analyzing expenses...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = expenseData || [];
  const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0);
  const topCategory = data.length > 0 ? data[0] : null;

  return (
    <Card className="h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PieChartIcon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Expense Breakdown</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{period}</span>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                size="icon"
                variant={viewMode === 'pie' ? 'secondary' : 'ghost'}
                className="h-7 w-7"
                onClick={() => setViewMode('pie')}
              >
                <PieChartIcon className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === 'bar' ? 'secondary' : 'ghost'}
                className="h-7 w-7"
                onClick={() => setViewMode('bar')}
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <PieChartIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No expenses recorded</p>
            <p className="text-sm text-muted-foreground">Start tracking to see insights</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Total Expenses</span>
                </div>
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold mb-1">{formatCurrency(totalExpenses)}</p>
              {topCategory && (
                <p className="text-xs text-muted-foreground">
                  Highest: {topCategory.category} ({topCategory.percentage.toFixed(0)}%)
                </p>
              )}
            </div>

            {/* Chart */}
            <div className="h-64 relative">
              {viewMode === 'pie' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="amount"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12 }} 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="amount" 
                      radius={[8, 8, 0, 0]}
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {viewMode === 'pie' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                    <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Category List */}
            <div className="space-y-3">
              {data.slice(0, 5).map((category, index) => (
                <div 
                  key={index} 
                  className="group p-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-md transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{category.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {formatCurrency(category.amount)}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <Progress 
                    value={category.percentage} 
                    className="h-2"
                    style={{
                      '--progress-foreground': category.color,
                    } as any}
                  />
                </div>
              ))}
            </div>

            {data.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full hover:bg-primary/5"
              >
                <span className="text-sm text-muted-foreground">
                  View all {data.length} categories
                </span>
                <ChevronRight className="h-3 w-3 ml-2 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdownWidget;
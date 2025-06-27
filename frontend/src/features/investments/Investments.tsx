import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  PieChart,
  BarChart3,
  Bitcoin,
  LineChart,
  Home,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatDisplayCurrency, formatCurrency } from '@/lib/utils';
import investmentService, { Investment, InvestmentQueryParams } from '@/services/investment.service';
import InvestmentDialog from './components/InvestmentDialog';

const investmentTypeConfig = {
  stocks: { label: 'Stocks', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: LineChart, gradient: 'from-blue-500/10 to-blue-600/10' },
  bonds: { label: 'Bonds', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', icon: DollarSign, gradient: 'from-green-500/10 to-green-600/10' },
  mutual_funds: { label: 'Mutual Funds', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: PieChart, gradient: 'from-purple-500/10 to-purple-600/10' },
  etf: { label: 'ETF', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', icon: BarChart3, gradient: 'from-orange-500/10 to-orange-600/10' },
  crypto: { label: 'Crypto', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', icon: Bitcoin, gradient: 'from-yellow-500/10 to-yellow-600/10' },
  real_estate: { label: 'Real Estate', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', icon: Home, gradient: 'from-indigo-500/10 to-indigo-600/10' },
  other: { label: 'Other', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20', icon: Activity, gradient: 'from-gray-500/10 to-gray-600/10' },
};

const Investments: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('purchaseDate');
  const [sortOrder, _setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const queryParams: InvestmentQueryParams = {
    ...(filterType !== 'all' && { type: filterType }),
    sortBy,
    order: sortOrder,
  };

  const { data: investmentData, isLoading } = useQuery({
    queryKey: ['investments', queryParams],
    queryFn: () => investmentService.getInvestments(queryParams),
  });

  const { data: stats } = useQuery({
    queryKey: ['investment-stats'],
    queryFn: () => investmentService.getInvestmentStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: investmentService.deleteInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-stats'] });
      toast({
        title: 'Success',
        description: 'Investment deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete investment',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (investment: Investment) => {
    setSelectedInvestment(investment);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this investment?')) {
      deleteMutation.mutate(id);
    }
  };

  // formatCurrency is now imported from utils

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const filteredInvestments = investmentData?.investments?.filter((inv: Investment) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      inv.name.toLowerCase().includes(search) ||
      inv.symbol?.toLowerCase().includes(search) ||
      inv.broker.toLowerCase().includes(search)
    );
  }) || [];

  const summary = investmentData?.summary || stats?.overall || {
    totalInvested: 0,
    currentValue: 0,
    totalGainLoss: 0,
    totalGainLossPercentage: 0,
    count: 0,
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Investment Portfolio
          </h1>
          <p className="text-muted-foreground mt-1">
            Track performance and manage your investment portfolio
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedInvestment(null);
            setDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  {formatDisplayCurrency(summary.totalInvested)}
                </p>
                <p className="text-xs text-muted-foreground">Principal amount</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-2xl">
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {formatDisplayCurrency(summary.currentValue)}
                </p>
                <p className="text-xs text-muted-foreground">Market value</p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-2xl">
                <BarChart3 className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "hover:shadow-lg transition-all duration-300",
          summary.totalGainLoss >= 0 
            ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20"
            : "bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Gain/Loss</p>
                <p className={cn(
                  "text-3xl font-bold",
                  summary.totalGainLoss >= 0 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-red-600 dark:text-red-400"
                )}>
                  {summary.totalGainLoss >= 0 ? '+' : '-'}{formatDisplayCurrency(Math.abs(summary.totalGainLoss))}
                </p>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  summary.totalGainLoss >= 0 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-red-600 dark:text-red-400"
                )}>
                  {summary.totalGainLoss >= 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span>{formatPercentage(Math.abs(summary.totalGainLossPercentage))}</span>
                </div>
              </div>
              <div className={cn(
                "p-3 rounded-2xl",
                summary.totalGainLoss >= 0 
                  ? "bg-emerald-500/20" 
                  : "bg-red-500/20"
              )}>
                {summary.totalGainLoss >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Positions</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {summary.count}
                </p>
                <p className="text-xs text-muted-foreground">Active investments</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-2xl">
                <PieChart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-muted/50">
        <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Investment Holdings
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor and manage your investment positions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search investments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[200px] h-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[150px] h-9">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(investmentTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[150px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchaseDate">Purchase Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="currentValue">Current Value</SelectItem>
                  <SelectItem value="gainLoss">Gain/Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading your investments...</p>
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <PieChart className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || filterType !== 'all'
                  ? 'No investments found'
                  : 'No investments yet'}
              </h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start building your portfolio by adding your first investment'}
              </p>
              {!searchTerm && filterType === 'all' && (
                <Button
                  onClick={() => {
                    setSelectedInvestment(null);
                    setDialogOpen(true);
                  }}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Investment
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Investment</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold text-right">Quantity</TableHead>
                    <TableHead className="font-semibold text-right">Cost Basis</TableHead>
                    <TableHead className="font-semibold text-right">Current Value</TableHead>
                    <TableHead className="font-semibold text-right">Gain/Loss</TableHead>
                    <TableHead className="font-semibold">Purchase Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredInvestments.map((investment: Investment) => {
                  const totalValue = investment.quantity * investment.currentPrice;
                  const investedAmount = investment.quantity * investment.purchasePrice;
                  const gainLoss = totalValue - investedAmount;
                  const gainLossPercentage = investedAmount > 0 ? (gainLoss / investedAmount) * 100 : 0;
                  const typeConfig = investmentTypeConfig[investment.type];

                  return (
                    <TableRow key={investment._id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl",
                            `bg-gradient-to-br ${typeConfig.gradient}`
                          )}>
                            <typeConfig.icon className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold">{investment.name}</div>
                            {investment.symbol && (
                              <div className="text-sm text-muted-foreground">{investment.symbol}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn('gap-1.5 border', typeConfig.color)}
                        >
                          <typeConfig.icon className="h-3 w-3" />
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {investment.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold">
                            {formatDisplayCurrency(investedAmount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{formatCurrency(investment.purchasePrice)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold">
                            {formatDisplayCurrency(totalValue)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{formatCurrency(investment.currentPrice)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={cn(
                          "space-y-0.5",
                          gainLoss >= 0 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : "text-red-600 dark:text-red-400"
                        )}>
                          <div className="font-semibold flex items-center justify-end gap-1">
                            {gainLoss >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatDisplayCurrency(Math.abs(gainLoss))}
                          </div>
                          <div className="text-sm font-medium">
                            {gainLoss >= 0 ? '+' : '-'}{formatPercentage(Math.abs(gainLossPercentage))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(investment.purchaseDate), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(investment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Investment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(investment._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Investment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <InvestmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        investment={selectedInvestment}
      />
    </div>
  );
};

export default Investments;
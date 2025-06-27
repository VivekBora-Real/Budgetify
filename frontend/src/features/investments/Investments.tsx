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
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import investmentService, { Investment, InvestmentQueryParams } from '@/services/investment.service';
import InvestmentDialog from './components/InvestmentDialog';

const investmentTypeConfig = {
  stocks: { label: 'Stocks', color: 'bg-blue-100 text-blue-800', icon: BarChart3 },
  bonds: { label: 'Bonds', color: 'bg-green-100 text-green-800', icon: DollarSign },
  mutual_funds: { label: 'Mutual Funds', color: 'bg-purple-100 text-purple-800', icon: PieChart },
  etf: { label: 'ETF', color: 'bg-orange-100 text-orange-800', icon: BarChart3 },
  crypto: { label: 'Crypto', color: 'bg-yellow-100 text-yellow-800', icon: DollarSign },
  real_estate: { label: 'Real Estate', color: 'bg-indigo-100 text-indigo-800', icon: Building2 },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800', icon: DollarSign },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Portfolio</h1>
          <p className="text-muted-foreground">Track and manage your investments</p>
        </div>
        <Button
          onClick={() => {
            setSelectedInvestment(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">Principal amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.currentValue)}</div>
            <p className="text-xs text-muted-foreground">Market value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {summary.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(Math.abs(summary.totalGainLoss))}
            </div>
            <p className={cn(
              "text-xs",
              summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {summary.totalGainLoss >= 0 ? '+' : '-'}{formatPercentage(Math.abs(summary.totalGainLossPercentage))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.count}</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Investment Holdings</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search investments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(investmentTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
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
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading investments...</div>
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterType !== 'all'
                ? 'No investments found matching your criteria'
                : 'No investments yet. Start by adding your first investment.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost Basis</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Gain/Loss</TableHead>
                  <TableHead>Purchase Date</TableHead>
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
                    <TableRow key={investment._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{investment.name}</div>
                          {investment.symbol && (
                            <div className="text-sm text-muted-foreground">{investment.symbol}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('gap-1', typeConfig.color)}>
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{investment.quantity}</TableCell>
                      <TableCell>
                        <div>
                          <div>{formatCurrency(investedAmount)}</div>
                          <div className="text-sm text-muted-foreground">
                            @{formatCurrency(investment.purchasePrice)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{formatCurrency(totalValue)}</div>
                          <div className="text-sm text-muted-foreground">
                            @{formatCurrency(investment.currentPrice)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          gainLoss >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          <div className="font-medium">
                            {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                          </div>
                          <div className="text-sm">
                            {gainLoss >= 0 ? '+' : ''}{formatPercentage(gainLossPercentage)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(investment.purchaseDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(investment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(investment._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
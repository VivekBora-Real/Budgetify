import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  Calendar,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Receipt,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FileText,
  Tag,
  Clock,
  ShoppingBag,
  Car,
  Home,
  Heart,
  Gamepad2,
  Briefcase,
  Utensils,
  Zap,
  Activity,
  PiggyBank,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import TransactionDialog from './components/TransactionDialog';
import TransactionFilters from './components/TransactionFilters';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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

interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
}

const Transactions: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    accountId: '',
    startDate: '',
    endDate: '',
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Reset page when debounced search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Fetch transactions with debouncing for search
  const { data: transactionsData, isLoading } = useQuery<{ data: Transaction[]; pagination: any }>({
    queryKey: ['transactions', { 
      page: currentPage, 
      search: debouncedSearchTerm,
      ...filters,
      sortBy,
      sortOrder
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/transactions?${params}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  });

  // Fetch transaction stats
  const { data: statsData } = useQuery({
    queryKey: ['transaction-stats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', 'month');
      const response = await api.get(`/transactions/stats?${params}`);
      return response.data.data as TransactionStats;
    },
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    try {
      // Build query params for export
      const params = new URLSearchParams();
      
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Use backend export endpoint
      const response = await api.get(`/transactions/export?${params}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: 'Transactions exported successfully.',
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Unable to export transactions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatCompactCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };
  
  const formatDisplayCurrency = (amount: number) => {
    // Use compact format for values >= 10K
    return Math.abs(amount) >= 10000 ? formatCompactCurrency(amount) : formatCurrency(amount);
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
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
    return colors[category] || { 
      bg: 'bg-gray-50 dark:bg-gray-950', 
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-800'
    };
  };

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;
  const stats = statsData || {
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    transactionCount: 0,
    categoryBreakdown: [],
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your financial activities
          </p>
        </div>
        <Button 
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => {
            setSelectedTransaction(null);
            setShowDialog(true);
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Income</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatDisplayCurrency(stats.totalIncome)}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12.5% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-green-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity">
                <ArrowDownRight className="h-8 w-8 text-green-900" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Expenses</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {formatDisplayCurrency(stats.totalExpense)}
                </p>
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <TrendingDown className="h-3 w-3" />
                  <span>-5.2% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-red-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity">
                <ArrowUpRight className="h-8 w-8 text-red-900" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">Net Balance</p>
                <p className={cn(
                  "text-2xl font-bold",
                  stats.netAmount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {formatDisplayCurrency(stats.netAmount)}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <PiggyBank className="h-3 w-3" />
                  <span>Savings this month</span>
                </div>
              </div>
              <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-all">
                <PiggyBank className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Transactions</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.transactionCount}
                </p>
                <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                  <Activity className="h-3 w-3" />
                  <span>This month</span>
                </div>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity">
                <Receipt className="h-8 w-8 text-purple-900" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description, category, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-muted-foreground/20 focus:bg-background transition-colors"
              />
            </div>
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="min-w-[120px]"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.values(filters).filter(Boolean).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.values(filters).filter(Boolean).length}
                </Badge>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="min-w-[120px]"
              onClick={() => handleExport()}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-6">
              <TransactionFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters);
                  setCurrentPage(1); // Reset to first page when filters change
                }}
                className="p-4 bg-muted/50 rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sort by:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('date')}
                className={cn(sortBy === 'date' && 'text-primary')}
              >
                Date
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('amount')}
                className={cn(sortBy === 'amount' && 'text-primary')}
              >
                Amount
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 animate-pulse text-primary" />
                <span className="text-muted-foreground">Loading transactions...</span>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-12">
              <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                <Receipt className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground mb-2">No transactions found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first transaction'}
              </p>
              {!searchTerm && !Object.values(filters).some(Boolean) && (
                <Button onClick={() => {
                  setSelectedTransaction(null);
                  setShowDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[600px] divide-y">
                {transactions.map((transaction: Transaction) => {
                const CategoryIcon = getCategoryIcon(transaction.category);
                const categoryStyle = getCategoryColor(transaction.category);
                
                return (
                  <div
                    key={transaction._id}
                    className="group hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="p-4 lg:p-6">
                      <div className="flex items-center gap-4">
                        {/* Icon and Type Indicator */}
                        <div className="relative">
                          <div className={cn(
                            "p-3 rounded-xl transition-transform group-hover:scale-110",
                            transaction.type === 'income' 
                              ? 'bg-gradient-to-br from-green-500 to-green-600' 
                              : categoryStyle.bg
                          )}>
                            {transaction.type === 'income' ? (
                              <ArrowDownRight className="h-5 w-5 text-white" />
                            ) : (
                              <CategoryIcon className={cn('h-5 w-5', categoryStyle.text)} />
                            )}
                          </div>
                          {transaction.isRecurring && (
                            <div className="absolute -top-1 -right-1 p-1 bg-primary rounded-full">
                              <Clock className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <p className="font-medium text-base line-clamp-1">
                                {transaction.description}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                                <span className="flex items-center gap-1.5">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: transaction.accountId.color || '#6366f1' }} 
                                  />
                                  {transaction.accountId.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {transaction.tags.length > 0 && (
                                <div className="flex items-center gap-1.5 pt-1">
                                  <Tag className="h-3 w-3 text-muted-foreground" />
                                  {transaction.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Amount and Actions */}
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className={cn(
                                  "text-lg font-bold",
                                  transaction.type === 'income' 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-gray-900 dark:text-gray-100'
                                )}>
                                  {transaction.type === 'income' ? '+' : '-'}
                                  {formatCurrency(transaction.amount)}
                                </p>
                                {transaction.attachments.length > 0 && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                    <FileText className="h-3 w-3" />
                                    {transaction.attachments.length} file{transaction.attachments.length > 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(transaction._id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} transactions
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? 'default' : 'outline'}
                        size="sm"
                        className="w-10"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  {pagination.pages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={currentPage === pagination.pages ? 'default' : 'outline'}
                        size="sm"
                        className="w-10"
                        onClick={() => setCurrentPage(pagination.pages)}
                      >
                        {pagination.pages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <TransactionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        transaction={selectedTransaction}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
        }}
      />
    </div>
  );
};

export default Transactions;
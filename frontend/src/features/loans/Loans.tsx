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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingDown,
  CreditCard,
  MoreVertical,
  Edit,
  Trash2,
  Wallet,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  User,
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowDown,
  Banknote,
  Calculator
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn, formatDisplayCurrency, formatCurrency } from '@/lib/utils';
import loanService, { Loan, LoanQueryParams, RecordPaymentDto } from '@/services/loan.service';
import LoanDialog from './components/LoanDialog';

const loanTypeConfig = {
  personal: { 
    label: 'Personal', 
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', 
    icon: User,
    gradient: 'from-blue-500/10 to-blue-600/10'
  },
  mortgage: { 
    label: 'Mortgage', 
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', 
    icon: Home,
    gradient: 'from-green-500/10 to-green-600/10'
  },
  auto: { 
    label: 'Auto', 
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', 
    icon: Car,
    gradient: 'from-purple-500/10 to-purple-600/10'
  },
  student: { 
    label: 'Student', 
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', 
    icon: GraduationCap,
    gradient: 'from-orange-500/10 to-orange-600/10'
  },
  business: { 
    label: 'Business', 
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', 
    icon: Briefcase,
    gradient: 'from-indigo-500/10 to-indigo-600/10'
  },
  other: { 
    label: 'Other', 
    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20', 
    icon: CreditCard,
    gradient: 'from-gray-500/10 to-gray-600/10'
  },
};

const Loans: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, _setSortBy] = useState<string>('nextPaymentDate');
  const [sortOrder, _setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<Record<string, number>>({});

  const queryParams: LoanQueryParams = {
    ...(filterType !== 'all' && { type: filterType }),
    ...(filterStatus !== 'all' && { status: filterStatus }),
    sortBy,
    order: sortOrder,
  };

  const { data: loanData, isLoading } = useQuery({
    queryKey: ['loans', queryParams],
    queryFn: () => loanService.getLoans(queryParams),
  });

  const { data: stats } = useQuery({
    queryKey: ['loan-stats'],
    queryFn: () => loanService.getLoanStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: loanService.deleteLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-stats'] });
      toast({
        title: 'Success',
        description: 'Loan deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete loan',
        variant: 'destructive',
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, payment }: { id: string; payment: RecordPaymentDto }) =>
      loanService.recordPayment(id, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-stats'] });
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
      setPaymentAmount({});
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to record payment',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this loan?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePayment = (loanId: string) => {
    const amount = paymentAmount[loanId];
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      });
      return;
    }
    paymentMutation.mutate({ id: loanId, payment: { amount } });
  };

  // formatCurrency is now imported from utils

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getDaysUntilPayment = (date: string) => {
    return differenceInDays(new Date(date), new Date());
  };

  const filteredLoans = loanData?.loans?.filter((loan: Loan) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      loan.loanName.toLowerCase().includes(search) ||
      loan.lender.toLowerCase().includes(search)
    );
  }) || [];

  const summary = loanData?.summary || stats?.overall || {
    totalPrincipal: 0,
    totalBalance: 0,
    totalPaidOff: 0,
    totalMonthlyPayment: 0,
    activeLoans: 0,
    paidOffLoans: 0,
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Loans & Debt
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your loans and manage debt repayment
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedLoan(null);
            setDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Loan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Debt</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatDisplayCurrency(summary.totalBalance)}
                </p>
                <p className="text-xs text-muted-foreground">Outstanding balance</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-2xl">
                <CreditCard className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Monthly Payment</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {formatDisplayCurrency(summary.totalMonthlyPayment)}
                </p>
                <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                  <Calendar className="h-3 w-3" />
                  <span>Due monthly</span>
                </div>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-2xl">
                <Calculator className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatDisplayCurrency(summary.totalPaidOff)}
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <ArrowDown className="h-3 w-3" />
                  <span>Total repaid</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-2xl">
                <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Loans</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.activeLoans}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.paidOffLoans} completed
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-2xl">
                <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.upcomingPayments && stats.upcomingPayments.length > 0 && (
        <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-lg">Upcoming Payments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingPayments.map((payment, index) => {
                const daysUntil = getDaysUntilPayment(payment.nextPaymentDate);
                const isUrgent = daysUntil <= 7;
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md",
                      isUrgent 
                        ? "border-red-500/30 bg-red-50/50 dark:bg-red-950/20" 
                        : "border-muted hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isUrgent 
                          ? "bg-red-500/20" 
                          : "bg-muted"
                      )}>
                        <Banknote className={cn(
                          "h-4 w-4",
                          isUrgent 
                            ? "text-red-600 dark:text-red-400" 
                            : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <p className="font-semibold">{payment.loanName}</p>
                        <p className="text-sm text-muted-foreground">
                          Due {format(new Date(payment.nextPaymentDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatDisplayCurrency(payment.monthlyPayment)}
                      </p>
                      <Badge 
                        variant={isUrgent ? "destructive" : "secondary"} 
                        className="text-xs"
                      >
                        {isUrgent && <AlertCircle className="h-3 w-3 mr-1" />}
                        {daysUntil} days
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-muted/50">
        <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Loan Portfolio
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track all your loans
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search loans..."
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
                  {Object.entries(loanTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px] h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paid_off">Paid Off</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading your loans...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <CreditCard className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'No loans found'
                  : 'No loans yet'}
              </h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start tracking your loans by adding your first loan'}
              </p>
              {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                <Button
                  onClick={() => {
                    setSelectedLoan(null);
                    setDialogOpen(true);
                  }}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Loan
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Loan Details</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold text-right">Balance</TableHead>
                    <TableHead className="font-semibold text-right">Monthly Payment</TableHead>
                    <TableHead className="font-semibold">Progress</TableHead>
                    <TableHead className="font-semibold">Next Payment</TableHead>
                    <TableHead className="font-semibold">Quick Pay</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredLoans.map((loan: Loan) => {
                  const progressPercentage = loan.principalAmount > 0 
                    ? ((loan.principalAmount - loan.currentBalance) / loan.principalAmount) * 100 
                    : 0;
                  const typeConfig = loanTypeConfig[loan.loanType];
                  const Icon = typeConfig.icon;
                  const daysUntilPayment = getDaysUntilPayment(loan.nextPaymentDate);

                  return (
                    <TableRow key={loan._id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl",
                            `bg-gradient-to-br ${typeConfig.gradient}`
                          )}>
                            <Icon className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold">{loan.loanName}</div>
                            <div className="text-sm text-muted-foreground">{loan.lender}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn('gap-1.5 border', typeConfig.color)}
                        >
                          <Icon className="h-3 w-3" />
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold">
                            {formatDisplayCurrency(loan.currentBalance)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            of {formatDisplayCurrency(loan.principalAmount)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold">
                            {formatDisplayCurrency(loan.monthlyPayment)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatPercentage(loan.interestRate)} APR
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 min-w-[120px]">
                          <Progress 
                            value={progressPercentage} 
                            className="h-2 bg-muted"
                          />
                          <div className="text-xs font-medium text-muted-foreground">
                            {formatPercentage(progressPercentage)} complete
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {loan.status === 'active' ? (
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "p-1.5 rounded-lg",
                              daysUntilPayment <= 7 
                                ? "bg-red-100 dark:bg-red-900/20" 
                                : "bg-muted"
                            )}>
                              <Calendar className={cn(
                                "h-3 w-3",
                                daysUntilPayment <= 7 
                                  ? "text-red-600 dark:text-red-400" 
                                  : "text-muted-foreground"
                              )} />
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {format(new Date(loan.nextPaymentDate), 'MMM d')}
                              </div>
                              <div className={cn(
                                "text-xs",
                                daysUntilPayment <= 7 
                                  ? "text-red-600 dark:text-red-400 font-medium" 
                                  : "text-muted-foreground"
                              )}>
                                {daysUntilPayment} days
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Badge 
                            variant="secondary" 
                            className="capitalize"
                          >
                            {loan.status === 'paid_off' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {loan.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {loan.status === 'active' && (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={paymentAmount[loan._id] || ''}
                                onChange={(e) => setPaymentAmount({
                                  ...paymentAmount,
                                  [loan._id]: parseFloat(e.target.value) || 0
                                })}
                                className="w-28 pl-6 h-8"
                              />
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handlePayment(loan._id)}
                              disabled={paymentMutation.isPending}
                              className="h-8"
                            >
                              Pay
                            </Button>
                          </div>
                        )}
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
                            <DropdownMenuItem onClick={() => handleEdit(loan)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Loan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(loan._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Loan
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

      <LoanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        loan={selectedLoan}
      />
    </div>
  );
};

export default Loans;
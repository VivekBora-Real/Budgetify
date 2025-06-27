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
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import loanService, { Loan, LoanQueryParams, RecordPaymentDto } from '@/services/loan.service';
import LoanDialog from './components/LoanDialog';

const loanTypeConfig = {
  personal: { label: 'Personal', color: 'bg-blue-100 text-blue-800', icon: User },
  mortgage: { label: 'Mortgage', color: 'bg-green-100 text-green-800', icon: Home },
  auto: { label: 'Auto', color: 'bg-purple-100 text-purple-800', icon: Car },
  student: { label: 'Student', color: 'bg-orange-100 text-orange-800', icon: GraduationCap },
  business: { label: 'Business', color: 'bg-indigo-100 text-indigo-800', icon: Briefcase },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800', icon: CreditCard },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loans & Debt</h1>
          <p className="text-muted-foreground">Manage and track your loans</p>
        </div>
        <Button
          onClick={() => {
            setSelectedLoan(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Loan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">Current balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalMonthlyPayment)}</div>
            <p className="text-xs text-muted-foreground">Total monthly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalPaidOff)}
            </div>
            <p className="text-xs text-muted-foreground">Total paid off</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              {summary.paidOffLoans} paid off
            </p>
          </CardContent>
        </Card>
      </div>

      {stats?.upcomingPayments && stats.upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{payment.loanName}</p>
                    <p className="text-sm text-muted-foreground">
                      Due {format(new Date(payment.nextPaymentDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(payment.monthlyPayment)}</p>
                    <Badge variant="secondary" className="text-xs">
                      In {getDaysUntilPayment(payment.nextPaymentDate)} days
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Loans</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search loans..."
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
                  {Object.entries(loanTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
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
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading loans...</div>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'No loans found matching your criteria'
                : 'No loans yet. Start by adding your first loan.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Monthly Payment</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Quick Pay</TableHead>
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
                    <TableRow key={loan._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-full', typeConfig.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{loan.loanName}</div>
                            <div className="text-sm text-muted-foreground">{loan.lender}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('gap-1', typeConfig.color)}>
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(loan.currentBalance)}</div>
                          <div className="text-sm text-muted-foreground">
                            of {formatCurrency(loan.principalAmount)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(loan.monthlyPayment)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatPercentage(loan.interestRate)} APR
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={progressPercentage} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {formatPercentage(progressPercentage)} paid
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {loan.status === 'active' ? (
                          <div>
                            <div className="text-sm">
                              {format(new Date(loan.nextPaymentDate), 'MMM d')}
                            </div>
                            <Badge 
                              variant={daysUntilPayment <= 7 ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {daysUntilPayment} days
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline">{loan.status.replace('_', ' ')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {loan.status === 'active' && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={paymentAmount[loan._id] || ''}
                              onChange={(e) => setPaymentAmount({
                                ...paymentAmount,
                                [loan._id]: parseFloat(e.target.value) || 0
                              })}
                              className="w-24"
                            />
                            <Button
                              size="sm"
                              onClick={() => handlePayment(loan._id)}
                              disabled={paymentMutation.isPending}
                            >
                              Pay
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(loan)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(loan._id)}
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

      <LoanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        loan={selectedLoan}
      />
    </div>
  );
};

export default Loans;
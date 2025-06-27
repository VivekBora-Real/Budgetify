import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import loanService, { CreateLoanDto, Loan } from '@/services/loan.service';
import { format, addYears } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon,
  User,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  CreditCard,
  DollarSign,
  Building2,
  FileText,
  Calculator,
  Percent,
  Clock,
  Plus,
  Edit2,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan?: Loan | null;
}

const loanTypes = [
  { 
    value: 'personal', 
    label: 'Personal Loan', 
    icon: User,
    description: 'General purpose loans',
    activeClasses: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
    iconActiveClasses: 'bg-blue-500 text-white',
    textActiveClasses: 'text-blue-700 dark:text-blue-300'
  },
  { 
    value: 'mortgage', 
    label: 'Mortgage', 
    icon: Home,
    description: 'Home loans',
    activeClasses: 'border-green-500 bg-green-50 dark:bg-green-950/20',
    iconActiveClasses: 'bg-green-500 text-white',
    textActiveClasses: 'text-green-700 dark:text-green-300'
  },
  { 
    value: 'auto', 
    label: 'Auto Loan', 
    icon: Car,
    description: 'Vehicle financing',
    activeClasses: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20',
    iconActiveClasses: 'bg-purple-500 text-white',
    textActiveClasses: 'text-purple-700 dark:text-purple-300'
  },
  { 
    value: 'student', 
    label: 'Student Loan', 
    icon: GraduationCap,
    description: 'Education loans',
    activeClasses: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
    iconActiveClasses: 'bg-orange-500 text-white',
    textActiveClasses: 'text-orange-700 dark:text-orange-300'
  },
  { 
    value: 'business', 
    label: 'Business Loan', 
    icon: Briefcase,
    description: 'Business financing',
    activeClasses: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
    iconActiveClasses: 'bg-indigo-500 text-white',
    textActiveClasses: 'text-indigo-700 dark:text-indigo-300'
  },
  { 
    value: 'other', 
    label: 'Other', 
    icon: CreditCard,
    description: 'Other loan types',
    activeClasses: 'border-gray-500 bg-gray-50 dark:bg-gray-950/20',
    iconActiveClasses: 'bg-gray-500 text-white',
    textActiveClasses: 'text-gray-700 dark:text-gray-300'
  },
];

const LoanDialog: React.FC<LoanDialogProps> = ({
  open,
  onOpenChange,
  loan,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!loan;

  const form = useForm<CreateLoanDto>({
    defaultValues: {
      loanName: '',
      loanType: 'personal',
      lender: '',
      principalAmount: 0,
      currentBalance: 0,
      interestRate: 0,
      monthlyPayment: 0,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addYears(new Date(), 5), 'yyyy-MM-dd'),
      nextPaymentDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  useEffect(() => {
    if (loan) {
      form.reset({
        loanName: loan.loanName,
        loanType: loan.loanType,
        lender: loan.lender,
        principalAmount: loan.principalAmount,
        currentBalance: loan.currentBalance,
        interestRate: loan.interestRate,
        monthlyPayment: loan.monthlyPayment,
        startDate: format(new Date(loan.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(loan.endDate), 'yyyy-MM-dd'),
        nextPaymentDate: format(new Date(loan.nextPaymentDate), 'yyyy-MM-dd'),
        notes: loan.notes || '',
      });
    } else {
      form.reset({
        loanName: '',
        loanType: 'personal',
        lender: '',
        principalAmount: 0,
        currentBalance: 0,
        interestRate: 0,
        monthlyPayment: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addYears(new Date(), 5), 'yyyy-MM-dd'),
        nextPaymentDate: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
    }
  }, [loan, form]);

  const createMutation = useMutation({
    mutationFn: loanService.createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-stats'] });
      toast({
        title: 'Success',
        description: 'Loan created successfully',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create loan',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLoanDto }) =>
      loanService.updateLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-stats'] });
      toast({
        title: 'Success',
        description: 'Loan updated successfully',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update loan',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateLoanDto) => {
    const submitData = {
      ...data,
      currentBalance: data.currentBalance || data.principalAmount,
    };

    if (isEditing && loan) {
      updateMutation.mutate({ id: loan._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const calculateMonthlyPayment = () => {
    const principal = form.watch('principalAmount');
    const rate = form.watch('interestRate') / 100 / 12;
    const startDate = new Date(form.watch('startDate'));
    const endDate = new Date(form.watch('endDate'));
    const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    if (principal && rate && months > 0) {
      const monthlyPayment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      form.setValue('monthlyPayment', parseFloat(monthlyPayment.toFixed(2)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditing ? (
              <>
                <Edit2 className="h-5 w-5 text-primary" />
                Edit Loan
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary" />
                Add New Loan
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your loan details and payment information' : 'Track a new loan and manage your debt repayment'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Loan Type Selection */}
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium">Loan Type</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {loanTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = field.value === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          className={cn(
                            "relative p-4 rounded-xl border-2 transition-all duration-200",
                            "hover:shadow-md hover:border-primary/50",
                            "flex flex-col items-center gap-2 text-center",
                            isSelected 
                              ? type.activeClasses 
                              : "border-muted hover:border-muted-foreground/30"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-full transition-colors",
                            isSelected 
                              ? type.iconActiveClasses 
                              : "bg-muted text-muted-foreground"
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className={cn(
                              "text-sm font-medium block",
                              isSelected && type.textActiveClasses
                            )}>
                              {type.label}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">
                              {type.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loanName"
                rules={{ required: 'Loan name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Loan Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Home Mortgage, Car Loan" 
                        className="h-11"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lender"
                rules={{ required: 'Lender is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Lender/Bank
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Wells Fargo, Chase Bank" 
                        className="h-11"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Loan Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="principalAmount"
                  rules={{ 
                    required: 'Principal amount is required',
                    min: { value: 0, message: 'Amount must be positive' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            className="pl-8 h-11 text-lg font-semibold"
                            {...field} 
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              if (!isEditing) {
                                form.setValue('currentBalance', parseFloat(e.target.value) || 0);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentBalance"
                  rules={{ 
                    required: 'Current balance is required',
                    min: { value: 0, message: 'Balance must be positive' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            className="pl-8 h-11 text-lg font-semibold"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interestRate"
                  rules={{ 
                    required: 'Interest rate is required',
                    min: { value: 0, message: 'Rate must be positive' },
                    max: { value: 100, message: 'Rate must be less than 100%' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-primary" />
                        Interest Rate (APR)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            className="pr-8 h-11"
                            {...field} 
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              calculateMonthlyPayment();
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            %
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyPayment"
                  rules={{ 
                    required: 'Monthly payment is required',
                    min: { value: 0, message: 'Payment must be positive' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-primary" />
                        Monthly Payment
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            className="pl-8 h-11 text-lg font-semibold"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                Loan Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Start Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full h-11 justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(new Date(field.value), 'PPP')
                              ) : (
                                <span>Select start date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                              calculateMonthlyPayment();
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  rules={{ required: 'End date is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full h-11 justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(new Date(field.value), 'PPP')
                              ) : (
                                <span>Select end date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                              calculateMonthlyPayment();
                            }}
                            disabled={(date) =>
                              date < new Date(form.watch('startDate'))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextPaymentDate"
                  rules={{ required: 'Next payment date is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Payment Due</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full h-11 justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(new Date(field.value), 'PPP')
                              ) : (
                                <span>Select payment date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Notes 
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this loan, terms, or special conditions..."
                      rows={3}
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Loan Summary */}
            {(form.watch('principalAmount') > 0 && (form.watch('currentBalance') ?? 0) >= 0) && (
              <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                <div className="absolute top-2 right-2">
                  <TrendingUp className="h-8 w-8 text-primary/20" />
                </div>
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Loan Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${(form.watch('principalAmount') - (form.watch('currentBalance') ?? 0)).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold">
                      ${(form.watch('currentBalance') ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-primary">
                        {((1 - (form.watch('currentBalance') ?? 0) / form.watch('principalAmount')) * 100).toFixed(1)}%
                      </p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ 
                            width: `${((1 - (form.watch('currentBalance') ?? 0) / form.watch('principalAmount')) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="secondary"
                onClick={calculateMonthlyPayment}
                disabled={!form.watch('principalAmount') || !form.watch('interestRate')}
                className="min-w-[140px]"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Payment
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="min-w-[120px]"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Update Loan
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Loan
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDialog;
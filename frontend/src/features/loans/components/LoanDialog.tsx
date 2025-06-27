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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import loanService, { CreateLoanDto, Loan } from '@/services/loan.service';
import { format, addYears } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan?: Loan | null;
}

const loanTypes = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'student', label: 'Student Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'other', label: 'Other' },
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Loan' : 'Add Loan'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your loan details' : 'Add a new loan to track your debt'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loanName"
                rules={{ required: 'Loan name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Home Mortgage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loanTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <FormLabel>Lender/Bank</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wells Fargo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(parseFloat(e.target.value) || 0);
                          if (!isEditing) {
                            form.setValue('currentBalance', parseFloat(e.target.value) || 0);
                          }
                        }}
                      />
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
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
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
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(parseFloat(e.target.value) || 0);
                          calculateMonthlyPayment();
                        }}
                      />
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
                    <FormLabel>Monthly Payment</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                rules={{ required: 'Start date is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                  <FormItem className="col-span-2">
                    <FormLabel>Next Payment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this loan..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch('principalAmount') > 0 && (form.watch('currentBalance') ?? 0) >= 0) && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Loan Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="ml-2 font-medium">
                      ${(form.watch('principalAmount') - (form.watch('currentBalance') ?? 0)).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="ml-2 font-medium">
                      {((1 - (form.watch('currentBalance') ?? 0) / form.watch('principalAmount')) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
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
              >
                Calculate Payment
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDialog;
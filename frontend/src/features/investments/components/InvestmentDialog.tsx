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
import investmentService, { CreateInvestmentDto, Investment } from '@/services/investment.service';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon,
  LineChart,
  DollarSign,
  PieChart,
  BarChart3,
  Bitcoin,
  Home,
  Activity,
  Building2,
  Hash,
  TrendingUp,
  FileText,
  Plus,
  Edit2,
  Loader2,
  Calculator,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment?: Investment | null;
}

const investmentTypes = [
  { 
    value: 'stocks', 
    label: 'Stocks', 
    icon: LineChart,
    activeClasses: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
    iconActiveClasses: 'bg-blue-500 text-white',
    textActiveClasses: 'text-blue-700 dark:text-blue-300'
  },
  { 
    value: 'bonds', 
    label: 'Bonds', 
    icon: DollarSign,
    activeClasses: 'border-green-500 bg-green-50 dark:bg-green-950/20',
    iconActiveClasses: 'bg-green-500 text-white',
    textActiveClasses: 'text-green-700 dark:text-green-300'
  },
  { 
    value: 'mutual_funds', 
    label: 'Mutual Funds', 
    icon: PieChart,
    activeClasses: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20',
    iconActiveClasses: 'bg-purple-500 text-white',
    textActiveClasses: 'text-purple-700 dark:text-purple-300'
  },
  { 
    value: 'etf', 
    label: 'ETF', 
    icon: BarChart3,
    activeClasses: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
    iconActiveClasses: 'bg-orange-500 text-white',
    textActiveClasses: 'text-orange-700 dark:text-orange-300'
  },
  { 
    value: 'crypto', 
    label: 'Cryptocurrency', 
    icon: Bitcoin,
    activeClasses: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
    iconActiveClasses: 'bg-yellow-500 text-white',
    textActiveClasses: 'text-yellow-700 dark:text-yellow-300'
  },
  { 
    value: 'real_estate', 
    label: 'Real Estate', 
    icon: Home,
    activeClasses: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
    iconActiveClasses: 'bg-indigo-500 text-white',
    textActiveClasses: 'text-indigo-700 dark:text-indigo-300'
  },
  { 
    value: 'other', 
    label: 'Other', 
    icon: Activity,
    activeClasses: 'border-gray-500 bg-gray-50 dark:bg-gray-950/20',
    iconActiveClasses: 'bg-gray-500 text-white',
    textActiveClasses: 'text-gray-700 dark:text-gray-300'
  },
];

const InvestmentDialog: React.FC<InvestmentDialogProps> = ({
  open,
  onOpenChange,
  investment,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!investment;

  const form = useForm<CreateInvestmentDto>({
    defaultValues: {
      name: '',
      type: 'stocks',
      symbol: '',
      quantity: 0,
      purchasePrice: 0,
      currentPrice: 0,
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      broker: '',
      notes: '',
      currency: 'USD',
      tags: [],
    },
  });

  useEffect(() => {
    if (investment) {
      form.reset({
        name: investment.name,
        type: investment.type,
        symbol: investment.symbol,
        quantity: investment.quantity,
        purchasePrice: investment.purchasePrice,
        currentPrice: investment.currentPrice,
        purchaseDate: format(new Date(investment.purchaseDate), 'yyyy-MM-dd'),
        broker: investment.broker,
        notes: investment.notes,
        currency: investment.currency,
        tags: investment.tags,
      });
    } else {
      form.reset({
        name: '',
        type: 'stocks',
        symbol: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: 0,
        purchaseDate: format(new Date(), 'yyyy-MM-dd'),
        broker: '',
        notes: '',
        currency: 'USD',
        tags: [],
      });
    }
  }, [investment, form]);

  const createMutation = useMutation({
    mutationFn: investmentService.createInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-stats'] });
      toast({
        title: 'Success',
        description: 'Investment created successfully',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create investment',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateInvestmentDto }) =>
      investmentService.updateInvestment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-stats'] });
      toast({
        title: 'Success',
        description: 'Investment updated successfully',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update investment',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateInvestmentDto) => {
    if (isEditing && investment) {
      updateMutation.mutate({ id: investment._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const totalValue = form.watch('quantity') * form.watch('currentPrice');
  const investedAmount = form.watch('quantity') * form.watch('purchasePrice');
  const gainLoss = totalValue - investedAmount;
  const gainLossPercentage = investedAmount > 0 ? (gainLoss / investedAmount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditing ? (
              <>
                <Edit2 className="h-5 w-5 text-primary" />
                Edit Investment
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary" />
                Add New Investment
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your investment details and current valuation' : 'Track a new investment in your portfolio'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Investment Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium">Investment Type</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {investmentTypes.map((type) => {
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
                          <span className={cn(
                            "text-sm font-medium",
                            isSelected && type.textActiveClasses
                          )}>
                            {type.label}
                          </span>
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
                name="name"
                rules={{ required: 'Investment name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      Investment Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Apple Inc., Bitcoin" 
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
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      Symbol/Ticker 
                      <span className="text-xs text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., AAPL, BTC" 
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
                name="broker"
                rules={{ required: 'Broker is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Broker/Platform
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Fidelity, Robinhood, Coinbase" 
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
                name="purchaseDate"
                rules={{ required: 'Purchase date is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      Purchase Date
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
                              <span>Select purchase date</span>
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
                            date > new Date() || date < new Date('1900-01-01')
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

            {/* Quantity and Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                Investment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  rules={{ 
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity must be positive' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity/Shares</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            step="0.001"
                            placeholder="0" 
                            className="h-11 pr-12 text-lg font-semibold"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            units
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchasePrice"
                  rules={{ 
                    required: 'Purchase price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            className="h-11 pl-8 text-lg font-semibold"
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
                  name="currentPrice"
                  rules={{ 
                    required: 'Current price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            className="h-11 pl-8 text-lg font-semibold"
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
                      placeholder="Add any notes, reasons for investment, or target prices..."
                      rows={3}
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Investment Summary */}
            {(form.watch('quantity') > 0 && form.watch('purchasePrice') > 0 && form.watch('currentPrice') > 0) && (
              <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                <div className="absolute top-2 right-2">
                  <TrendingUp className="h-8 w-8 text-primary/20" />
                </div>
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Investment Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Invested Amount</p>
                    <p className="text-2xl font-bold">
                      ${investedAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="text-2xl font-bold">
                      ${totalValue.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      gainLoss >= 0 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {gainLoss >= 0 ? '+' : '-'}${Math.abs(gainLoss).toFixed(2)}
                    </p>
                    <p className={cn(
                      "text-sm font-medium",
                      gainLoss >= 0 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {gainLoss >= 0 ? '+' : '-'}{Math.abs(gainLossPercentage).toFixed(2)}%
                    </p>
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
                        Update Investment
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Investment
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

export default InvestmentDialog;
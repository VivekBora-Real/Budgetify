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
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment?: Investment | null;
}

const investmentTypes = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'etf', label: 'ETF' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Investment' : 'Add Investment'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your investment details' : 'Add a new investment to your portfolio'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Investment name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Apple Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select investment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {investmentTypes.map((type) => (
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
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol/Ticker (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AAPL" {...field} />
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
                    <FormLabel>Broker/Platform</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fidelity, Robinhood" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input 
                        type="number" 
                        step="0.001"
                        placeholder="0" 
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
                name="purchasePrice"
                rules={{ 
                  required: 'Purchase price is required',
                  min: { value: 0, message: 'Price must be positive' }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price per Unit</FormLabel>
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
                name="currentPrice"
                rules={{ 
                  required: 'Current price is required',
                  min: { value: 0, message: 'Price must be positive' }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Price per Unit</FormLabel>
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
                name="purchaseDate"
                rules={{ required: 'Purchase date is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this investment..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch('quantity') > 0 && form.watch('purchasePrice') > 0 && form.watch('currentPrice') > 0) && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Investment Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Invested Amount:</span>
                    <span className="ml-2 font-medium">${investedAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Value:</span>
                    <span className="ml-2 font-medium">${totalValue.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gain/Loss:</span>
                    <span className={cn(
                      'ml-2 font-medium',
                      gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      ${gainLoss.toFixed(2)} ({gainLossPercentage.toFixed(2)}%)
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

export default InvestmentDialog;
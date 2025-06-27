import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Tag,
  DollarSign,
  FileText,
  Repeat,
  Briefcase,
  ShoppingBag,
  Car,
  Home,
  Heart,
  Gamepad2,
  Utensils,
  Zap,
  GraduationCap,
  Plane,
  Sparkles,
  Gift,
  Building2,
  TrendingUp,
  Users,
  RefreshCw,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/utils/constants';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: any;
  onSuccess?: () => void;
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    accountId: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date(),
    tags: [] as string[],
    isRecurring: false,
  });
  const [tagInput, setTagInput] = useState('');

  // Fetch accounts
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/accounts');
      return response.data.data;
    },
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (transaction) {
        return api.put(`/transactions/${transaction._id}`, data);
      }
      return api.post('/transactions', data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: transaction
          ? 'Transaction updated successfully'
          : 'Transaction created successfully',
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        accountId: transaction.accountId._id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        date: new Date(transaction.date),
        tags: transaction.tags || [],
        isRecurring: transaction.isRecurring || false,
      });
    } else {
      setFormData({
        accountId: '',
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date(),
        tags: [],
        isRecurring: false,
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.amount || !formData.category || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: formData.date.toISOString(),
    };

    mutation.mutate(payload);
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      // Expense categories
      'Food & Dining': Utensils,
      'Transportation': Car,
      'Shopping': ShoppingBag,
      'Entertainment': Gamepad2,
      'Bills & Utilities': Zap,
      'Healthcare': Heart,
      'Education': GraduationCap,
      'Travel': Plane,
      'Personal Care': Sparkles,
      'Gifts & Donations': Gift,
      'Investments': TrendingUp,
      'Business': Building2,
      // Income categories
      'Salary': Briefcase,
      'Freelance': Users,
      'Rental': Home,
      'Refunds': RefreshCw,
      'Other': FileText,
    };
    return icons[category] || FileText;
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const accounts = accountsData || [];

  // Quick amount buttons
  const quickAmounts = formData.type === 'expense' 
    ? [10, 25, 50, 100, 250, 500]
    : [100, 500, 1000, 2500, 5000, 10000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {transaction ? (
                <>
                  <FileText className="h-5 w-5 text-primary" />
                  Edit Transaction
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-primary" />
                  Add New Transaction
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {transaction 
                ? 'Update the transaction details below'
                : 'Record your income or expense'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transaction Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                  className={cn(
                    "relative p-3 rounded-lg border-2 transition-all duration-200",
                    "hover:shadow-md hover:border-primary/50",
                    formData.type === 'income' 
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full transition-colors",
                      formData.type === 'income' 
                        ? "bg-green-500 text-white" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      <ArrowDownRight className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "font-medium text-sm",
                      formData.type === 'income' && "text-green-700 dark:text-green-300"
                    )}>
                      Income
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                  className={cn(
                    "relative p-3 rounded-lg border-2 transition-all duration-200",
                    "hover:shadow-md hover:border-primary/50",
                    formData.type === 'expense' 
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full transition-colors",
                      formData.type === 'expense' 
                        ? "bg-red-500 text-white" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "font-medium text-sm",
                      formData.type === 'expense' && "text-red-700 dark:text-red-300"
                    )}>
                      Expense
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Amount
              </Label>
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-8 text-lg font-semibold"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category }))}
                      className={cn(
                        "p-3 rounded-lg border transition-all duration-200",
                        "hover:shadow-sm hover:border-primary/50",
                        "flex flex-col items-center gap-2 text-center",
                        formData.category === category 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        formData.category === category && "text-primary"
                      )} />
                      <span className="text-xs font-medium line-clamp-1">
                        {category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account and Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Account
                </Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account: any) => (
                      <SelectItem key={account._id} value={account._id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                          <span>{account.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({account.type})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this transaction for?"
                required
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Tags
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addTag}
                    disabled={!tagInput}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Repeat className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
                    Recurring Transaction
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    This transaction repeats regularly
                  </p>
                </div>
              </div>
              <Switch
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isRecurring: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="min-w-[100px]"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                transaction ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
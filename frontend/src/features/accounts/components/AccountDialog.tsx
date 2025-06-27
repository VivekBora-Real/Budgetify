import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { Switch } from '@/components/ui/switch';
import { 
  Palette,
  Wallet,
  Building2,
  CreditCard,
  Coins,
  Smartphone,
  User,
  FileText,
  DollarSign,
  Globe,
  Power,
  Plus,
  Edit2,
  Loader2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ACCOUNT_TYPES, CURRENCIES, COLORS } from '@/utils/constants';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: any;
  onSuccess?: () => void;
}

const AccountDialog: React.FC<AccountDialogProps> = ({
  open,
  onOpenChange,
  account,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    type: 'savings',
    balance: '',
    currency: 'USD',
    color: '#3b82f6',
    description: '',
    isActive: true,
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (account) {
        return api.put(`/accounts/${account._id}`, data);
      }
      return api.post('/accounts', data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: account
          ? 'Account updated successfully'
          : 'Account created successfully',
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
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        currency: account.currency,
        color: account.color,
        description: account.description || '',
        isActive: account.isActive,
      });
    } else {
      setFormData({
        name: '',
        type: 'savings',
        balance: '0',
        currency: 'USD',
        color: '#3b82f6',
        description: '',
        isActive: true,
      });
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      balance: parseFloat(formData.balance),
    };

    mutation.mutate(payload);
  };

  const getAccountTypeIcon = (type: string) => {
    const icons = {
      savings: Wallet,
      current: Building2,
      credit_card: CreditCard,
      cash: Coins,
      digital_wallet: Smartphone,
    };
    return icons[type as keyof typeof icons] || Wallet;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {account ? (
                <>
                  <Edit2 className="h-5 w-5 text-primary" />
                  Edit Account
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-primary" />
                  Create New Account
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {account 
                ? 'Update your account details and settings'
                : 'Add a new account to track your finances'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Account Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Main Checking, Emergency Fund"
                className="h-11"
                required
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACCOUNT_TYPES.map((type) => {
                  const Icon = getAccountTypeIcon(type.value);
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      disabled={!!account} // Can't change type after creation
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all duration-200",
                        "hover:shadow-md hover:border-primary/50",
                        "flex flex-col items-center gap-2 text-center",
                        formData.type === type.value 
                          ? "border-primary bg-primary/10" 
                          : "border-muted hover:border-muted-foreground/30",
                        !!account && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-full transition-colors",
                        formData.type === type.value 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        formData.type === type.value && "text-primary"
                      )}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!!account && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <FileText className="h-3 w-3" />
                  Account type cannot be changed after creation
                </p>
              )}
            </div>

            {/* Initial Balance (only for new accounts) */}
            {!account && (
              <div className="space-y-2">
                <Label htmlFor="balance" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Initial Balance
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                    className="pl-8 h-11 text-lg font-semibold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            )}

            {/* Currency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Currency
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{currency.symbol}</span>
                        <span>{currency.label}</span>
                        <span className="text-xs text-muted-foreground">({currency.value})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Account Color
              </Label>
              <div className="p-4 bg-muted/30 rounded-xl border">
                <div className="flex gap-3 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "relative w-10 h-10 rounded-xl border-2 transition-all duration-200",
                        "hover:scale-110 hover:shadow-md",
                        formData.color === color
                          ? "border-gray-900 dark:border-gray-100 scale-110 shadow-lg"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    >
                      {formData.color === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Choose a color to help identify this account
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Description
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add notes about this account"
                className="h-11"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Power className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                    Account Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.isActive 
                      ? "This account is active and included in calculations" 
                      : "This account is inactive and excluded from calculations"}
                  </p>
                </div>
              </div>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isActive: checked }))
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
                account ? 'Update Account' : 'Create Account'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDialog;
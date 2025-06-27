import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  CreditCard,
  Wallet,
  Building2,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  TrendingUp,
  Users,
  Shield,
  Smartphone,
  Coins,
  Sparkles
} from 'lucide-react';
import { cn, formatDisplayCurrency, formatCurrency } from '@/lib/utils';
import api from '@/services/api';
import AccountDialog from './components/AccountDialog';
import { useToast } from '@/hooks/use-toast';
import { ACCOUNT_TYPES } from '@/utils/constants';

interface Account {
  _id: string;
  name: string;
  type: 'savings' | 'current' | 'credit_card' | 'cash' | 'digital_wallet';
  balance: number;
  currency: string;
  color: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountStats {
  statsByType: Record<string, {
    count: number;
    totalBalance: number;
    accounts: Array<{
      id: string;
      name: string;
      balance: number;
      color: string;
    }>;
  }>;
  totalBalance: number;
  accountCount: number;
}

const Accounts: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Fetch accounts
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounts', { isActive: showInactive ? undefined : true }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (!showInactive) params.append('isActive', 'true');
      const response = await api.get(`/accounts?${params}`);
      return response.data;
    },
  });

  // Fetch account stats
  const { data: _statsData } = useQuery({
    queryKey: ['account-stats'],
    queryFn: async () => {
      const response = await api.get('/accounts/stats');
      return response.data.data as AccountStats;
    },
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account-stats'] });
      toast({
        title: 'Success',
        description: 'Account deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to delete account',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  // formatCurrency is now imported from utils

  const getAccountIcon = (type: string) => {
    const icons = {
      savings: Wallet,
      current: Building2,
      credit_card: CreditCard,
      cash: Coins,
      digital_wallet: Smartphone,
    };
    return icons[type as keyof typeof icons] || Wallet;
  };

  const accounts = accountsData?.data || [];
  const summary = accountsData?.summary || {
    totalAccounts: 0,
    activeAccounts: 0,
    totalBalance: 0,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Accounts
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your financial accounts in one place
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedAccount(null);
            setShowDialog(true);
          }}
          className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
                  {formatDisplayCurrency(summary.totalBalance)}
                </p>
                <div className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12.5% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-2xl">
                <DollarSign className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.activeAccounts}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.totalAccounts - summary.activeAccounts} inactive
                </p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-2xl">
                <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {summary.totalAccounts}
                </p>
                <p className="text-xs text-muted-foreground">
                  Across all categories
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-2xl">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Your Accounts
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInactive(!showInactive)}
          className="hover:bg-primary/10 transition-all duration-200"
        >
          {showInactive ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
          {showInactive ? 'Showing All' : 'Active Only'}
        </Button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading your accounts...</p>
              </div>
            </CardContent>
          </Card>
        ) : accounts.length === 0 ? (
          <Card className="col-span-full border-dashed bg-muted/5">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Wallet className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No accounts yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Start tracking your finances by adding your first account
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedAccount(null);
                    setShowDialog(true);
                  }}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Account
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account: Account) => {
            const Icon = getAccountIcon(account.type);
            const accountType = ACCOUNT_TYPES.find(t => t.value === account.type);
            
            return (
              <Card 
                key={account._id} 
                className={cn(
                  "relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer",
                  "border-muted/50 hover:border-primary/50",
                  !account.isActive && "opacity-60"
                )}
                style={{
                  background: `linear-gradient(135deg, ${account.color}10 0%, transparent 100%)`
                }}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1 group-hover:h-1.5 transition-all duration-300"
                  style={{ backgroundColor: account.color }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-3 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300"
                        style={{ 
                          backgroundColor: `${account.color}20`,
                          color: account.color 
                        }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold">{account.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                            style={{
                              backgroundColor: `${account.color}15`,
                              color: account.color,
                              borderColor: `${account.color}30`
                            }}
                          >
                            {accountType?.label}
                          </Badge>
                          {!account.isActive && (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(account)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Account
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(account._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold tracking-tight">
                        {formatDisplayCurrency(account.balance, account.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current Balance
                      </p>
                    </div>
                    {account.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {account.description}
                      </p>
                    )}
                    <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last updated</span>
                      <span>{new Date(account.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Account Dialog */}
      <AccountDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        account={selectedAccount}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
          queryClient.invalidateQueries({ queryKey: ['account-stats'] });
        }}
      />
    </div>
  );
};

export default Accounts;
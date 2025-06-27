import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  CreditCard,
  Wallet,
  Building2,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    const icons = {
      savings: Wallet,
      current: Building2,
      credit_card: CreditCard,
      cash: DollarSign,
      digital_wallet: CreditCard,
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your financial accounts
          </p>
        </div>
        <Button onClick={() => {
          setSelectedAccount(null);
          setShowDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalBalance)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-bold">{summary.activeAccounts}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{summary.totalAccounts}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInactive(!showInactive)}
        >
          {showInactive ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
          {showInactive ? 'Showing All' : 'Showing Active Only'}
        </Button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              Loading accounts...
            </CardContent>
          </Card>
        ) : accounts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              No accounts found. Create your first account to get started.
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
                  "relative overflow-hidden",
                  !account.isActive && "opacity-60"
                )}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: account.color }}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ 
                        backgroundColor: `${account.color}20`,
                        color: account.color 
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {accountType?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(account._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      {!account.isActive && (
                        <Badge variant="secondary" className="mt-1">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {account.description && (
                      <p className="text-sm text-muted-foreground">
                        {account.description}
                      </p>
                    )}
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
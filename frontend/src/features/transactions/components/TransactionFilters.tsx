import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/utils/constants';

interface TransactionFiltersProps {
  filters: {
    type: string;
    category: string;
    accountId: string;
    startDate: string;
    endDate: string;
  };
  onFiltersChange: (filters: any) => void;
  className?: string;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  className,
}) => {
  // Add accounts fetching if needed
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: '',
      category: '',
      accountId: '',
      startDate: '',
      endDate: '',
    });
  };

  const categories = filters.type === 'income' 
    ? INCOME_CATEGORIES 
    : filters.type === 'expense' 
    ? EXPENSE_CATEGORIES 
    : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4', className)}>
      {/* Type Filter */}
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Account Filter */}
      <div className="space-y-2">
        <Label>Account</Label>
        <Select
          value={filters.accountId || 'all'}
          onValueChange={(value) => handleFilterChange('accountId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />
      </div>

      {/* End Date */}
      <div className="space-y-2">
        <Label>End Date</Label>
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />
      </div>

      {/* Clear Filters */}
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;
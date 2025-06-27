import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Moon, Sun, DollarSign } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleTheme } from '../../store/slices/uiSlice';
import { Button } from '@/components/ui/button';

const AuthLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">BudgetApp</span>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>&copy; 2024 BudgetApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { widgetComponents } from './widgets';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Settings, 
  Plus, 
  Grid3x3, 
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Wallet,
  PiggyBank,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  setEditMode,
  selectWidget,
  removeWidget,
  toggleWidgetVisibility,
  resetLayout,
} from './dashboardSlice';
import AddWidgetDialog from './components/AddWidgetDialog';
import type { WidgetConfig } from './types';
import { useQuery } from '@tanstack/react-query';
import dashboardService from '@/services/dashboard.service';

// Welcome messages
const welcomeMessages = [
  "Ready to conquer your finances? 🚀",
  "Let's make today financially awesome! 💰",
  "Your financial journey continues! 🌟",
  "Time to check those money goals! 🎯",
  "Welcome back, money master! 💪",
];

// Quick stats component
const QuickStat = ({ icon: Icon, label, value, trend, color }: any) => (
  <div className={`bg-gradient-to-br ${color} p-4 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 cursor-pointer group`}>
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-6 w-6 opacity-80" />
      {trend && (
        <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
          {trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
    </div>
    <div className="absolute bottom-0 right-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
      <Icon className="h-24 w-24" />
    </div>
  </div>
);

// Financial tip component
const FinancialTip = () => {
  const tips = [
    "💡 Did you know? Saving 10% of your income can lead to financial freedom!",
    "🎯 Set specific financial goals to stay motivated!",
    "📊 Review your expenses weekly to identify savings opportunities!",
    "🌱 Small daily savings can grow into significant amounts!",
    "⚡ Automate your savings for better consistency!",
  ];
  
  const [currentTip, setCurrentTip] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-full">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-medium animate-fade-in">{tips[currentTip]}</p>
      </div>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { layout, isEditMode, selectedWidgetId } = useAppSelector(
    (state) => state.dashboard
  );
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [welcomeMessage] = useState(() => 
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
  );

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Fetch summary data
  const { data: summaryData } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getOverview(),
  });

  const handleToggleEditMode = () => {
    dispatch(setEditMode(!isEditMode));
  };

  const handleSelectWidget = (widgetId: string | null) => {
    if (isEditMode) {
      dispatch(selectWidget(widgetId));
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    dispatch(removeWidget(widgetId));
  };

  const handleToggleVisibility = (widgetId: string) => {
    dispatch(toggleWidgetVisibility(widgetId));
  };

  const handleResetLayout = () => {
    if (confirm('Are you sure you want to reset the dashboard to default layout?')) {
      dispatch(resetLayout());
    }
  };

  const renderWidget = (widget: WidgetConfig) => {
    const WidgetComponent = widgetComponents[widget.type];
    if (!WidgetComponent) return null;

    const gridStyle = {
      gridColumn: `span ${widget.position.w}`,
      gridRow: `span ${widget.position.h}`,
    };

    return (
      <div
        key={widget.id}
        style={gridStyle}
        className={cn(
          'relative group transition-all duration-300 transform hover:scale-[1.02]',
          isEditMode && 'cursor-move',
          selectedWidgetId === widget.id && 'ring-2 ring-primary shadow-lg',
          !widget.isVisible && 'opacity-50'
        )}
        onClick={() => handleSelectWidget(widget.id)}
      >
        {isEditMode && (
          <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility(widget.id);
              }}
            >
              {widget.isVisible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="h-6 w-6 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveWidget(widget.id);
              }}
            >
              ×
            </Button>
          </div>
        )}
        
        <div className={cn(
          'h-full',
          !widget.isVisible && 'pointer-events-none'
        )}>
          <WidgetComponent {...widget.settings} />
        </div>

        {isEditMode && (
          <div className="absolute inset-0 border-2 border-dashed border-transparent hover:border-primary/30 rounded-lg pointer-events-none" />
        )}
      </div>
    );
  };

  const visibleWidgets = layout.widgets.filter(w => w.isVisible || isEditMode);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 mb-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {getGreeting()}! 👋
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {welcomeMessage}
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <QuickStat
                  icon={Wallet}
                  label="Total Balance"
                  value={`$${summaryData?.totalBalance?.toLocaleString() || '0'}`}
                  trend={5.2}
                  color="from-blue-500 to-blue-600"
                />
                <QuickStat
                  icon={TrendingUp}
                  label="This Month"
                  value={`+$${summaryData?.monthlyIncome?.toLocaleString() || '0'}`}
                  trend={12.5}
                  color="from-green-500 to-green-600"
                />
                <QuickStat
                  icon={PiggyBank}
                  label="Savings Rate"
                  value={`${summaryData?.savingsRate?.toFixed(1) || '0'}%`}
                  color="from-purple-500 to-purple-600"
                />
                <QuickStat
                  icon={Target}
                  label="Net Worth"
                  value={`$${summaryData?.netWorth?.toLocaleString() || '0'}`}
                  trend={8.3}
                  color="from-orange-500 to-orange-600"
                />
              </div>
            </div>
            
            {/* Customize Button */}
            <div className="hidden lg:block">
              <Button
                variant={isEditMode ? 'default' : 'outline'}
                size="lg"
                onClick={handleToggleEditMode}
                className="shadow-lg hover:shadow-xl transition-all"
              >
                {isEditMode ? (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Layout
                  </>
                ) : (
                  <>
                    <Settings className="h-5 w-5 mr-2" />
                    Customize
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
          <div className="w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Financial Tip */}
      <FinancialTip />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Plus, label: 'Add Transaction', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', href: '/transactions' },
          { icon: Bell, label: 'View Bills', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', href: '/bills' },
          { icon: TrendingUp, label: 'Investments', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', href: '/investments' },
          { icon: Calendar, label: 'Budget Plan', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', href: '/budget' },
        ].map((action, index) => (
          <Card
            key={index}
            className={`p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${action.bg}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${action.bg}`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="font-medium">{action.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Mode Banner */}
      {isEditMode && (
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full animate-pulse">
                <Grid3x3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Customization Mode Active</p>
                <p className="text-sm text-muted-foreground">
                  Drag widgets to reorder • Click to select • {layout.widgets.length} widgets active
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddWidget(true)}
                className="shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetLayout}
                className="shadow-sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Widgets Grid */}
      <div 
        className={cn(
          'grid gap-4 animate-fade-in-up',
          `grid-cols-${layout.gridCols}`,
          isEditMode && 'min-h-[600px] bg-gradient-to-br from-muted/20 to-muted/10 p-4 rounded-2xl border-2 border-dashed border-muted-foreground/20'
        )}
        style={{
          gridTemplateColumns: `repeat(${layout.gridCols}, 1fr)`,
          gridAutoRows: 'minmax(120px, 1fr)',
        }}
      >
        {visibleWidgets.map(renderWidget)}
      </div>

      <AddWidgetDialog
        open={showAddWidget}
        onOpenChange={setShowAddWidget}
      />
    </div>
  );
};

export default Dashboard;
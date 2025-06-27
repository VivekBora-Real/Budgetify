import React, { useState } from 'react';
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
  EyeOff
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

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { layout, isEditMode, selectedWidgetId } = useAppSelector(
    (state) => state.dashboard
  );
  const [showAddWidget, setShowAddWidget] = useState(false);

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
          'relative group transition-all',
          isEditMode && 'cursor-move',
          selectedWidgetId === widget.id && 'ring-2 ring-primary',
          !widget.isVisible && 'opacity-50'
        )}
        onClick={() => handleSelectWidget(widget.id)}
      >
        {isEditMode && (
          <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6"
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
              className="h-6 w-6"
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
          <div className="absolute inset-0 border-2 border-dashed border-transparent hover:border-muted-foreground/30 rounded-lg pointer-events-none" />
        )}
      </div>
    );
  };

  const visibleWidgets = layout.widgets.filter(w => w.isVisible || isEditMode);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddWidget(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetLayout}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Layout
              </Button>
            </>
          )}
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleEditMode}
          >
            {isEditMode ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Done Editing
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </>
            )}
          </Button>
        </div>
      </div>

      {isEditMode && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-sm">
            <Grid3x3 className="h-4 w-4" />
            <span>Edit Mode: Click widgets to select, drag to reorder</span>
            <span className="text-muted-foreground">
              • {layout.widgets.length} widgets • {layout.gridCols}x{layout.gridRows} grid
            </span>
          </div>
        </Card>
      )}

      <div 
        className={cn(
          'grid gap-4',
          `grid-cols-${layout.gridCols}`,
          isEditMode && 'min-h-[600px] bg-muted/10 p-4 rounded-lg border-2 border-dashed'
        )}
        style={{
          gridTemplateColumns: `repeat(${layout.gridCols}, 1fr)`,
          gridAutoRows: 'minmax(100px, 1fr)',
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
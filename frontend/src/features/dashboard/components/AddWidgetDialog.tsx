import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addWidget } from '../dashboardSlice';
import { widgetDefinitions } from '../widgets';
import type { WidgetConfig } from '../types';

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const { layout } = useAppSelector((state) => state.dashboard);

  const handleAddWidget = (type: WidgetConfig['type']) => {
    const definition = widgetDefinitions.find(w => w.type === type);
    if (!definition) return;

    // Find an empty spot in the grid
    const existingPositions = layout.widgets.map(w => ({
      x: w.position.x,
      y: w.position.y,
      w: w.position.w,
      h: w.position.h,
    }));

    // Simple placement algorithm - find first available spot
    let x = 0, y = 0;
    let placed = false;

    for (y = 0; y < layout.gridRows && !placed; y++) {
      for (x = 0; x <= layout.gridCols - definition.defaultSize.w && !placed; x++) {
        // Check if this position overlaps with any existing widget
        const overlaps = existingPositions.some(pos => {
          const xOverlap = x < pos.x + pos.w && x + definition.defaultSize.w > pos.x;
          const yOverlap = y < pos.y + pos.h && y + definition.defaultSize.h > pos.y;
          return xOverlap && yOverlap;
        });

        if (!overlaps) {
          placed = true;
          break;
        }
      }
    }

    if (!placed) {
      // If no space found, place at the bottom
      y = Math.max(...existingPositions.map(p => p.y + p.h), 0);
      x = 0;
    }

    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type: type,
      title: definition.title,
      position: {
        x,
        y,
        w: definition.defaultSize.w,
        h: definition.defaultSize.h,
      },
      isVisible: true,
    };

    dispatch(addWidget(newWidget));
    onOpenChange(false);
  };

  // Check which widgets are already on the dashboard
  const existingWidgetTypes = layout.widgets.map(w => w.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Choose a widget to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {widgetDefinitions.map((widget) => {
            const count = existingWidgetTypes.filter(t => t === widget.type).length;
            
            return (
              <Card
                key={widget.type}
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleAddWidget(widget.type)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{widget.title}</h3>
                    {count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {count} added
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {widget.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Size: {widget.defaultSize.w}x{widget.defaultSize.h}
                    </span>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWidgetDialog;
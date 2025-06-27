import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WidgetConfig, DashboardLayout } from './types';

interface DashboardState {
  layout: DashboardLayout;
  isEditMode: boolean;
  selectedWidgetId: string | null;
  isLoading: boolean;
  error: string | null;
}

const defaultWidgets: WidgetConfig[] = [
  {
    id: 'balance-overview-1',
    type: 'balance-overview',
    title: 'Balance Overview',
    position: { x: 0, y: 0, w: 6, h: 4 },
    isVisible: true,
  },
  {
    id: 'recent-transactions-1',
    type: 'recent-transactions',
    title: 'Recent Transactions',
    position: { x: 6, y: 0, w: 6, h: 4 },
    isVisible: true,
  },
  {
    id: 'expense-breakdown-1',
    type: 'expense-breakdown',
    title: 'Expense Breakdown',
    position: { x: 0, y: 4, w: 4, h: 4 },
    isVisible: true,
  },
  {
    id: 'budget-progress-1',
    type: 'budget-progress',
    title: 'Budget Progress',
    position: { x: 4, y: 4, w: 4, h: 4 },
    isVisible: true,
  },
  {
    id: 'upcoming-bills-1',
    type: 'upcoming-bills',
    title: 'Upcoming Bills',
    position: { x: 8, y: 4, w: 4, h: 4 },
    isVisible: true,
  },
];

const initialState: DashboardState = {
  layout: {
    widgets: defaultWidgets,
    gridCols: 12,
    gridRows: 8,
  },
  isEditMode: false,
  selectedWidgetId: null,
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<DashboardLayout>) => {
      state.layout = action.payload;
    },
    addWidget: (state, action: PayloadAction<WidgetConfig>) => {
      state.layout.widgets.push(action.payload);
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.layout.widgets = state.layout.widgets.filter(
        (widget) => widget.id !== action.payload
      );
      if (state.selectedWidgetId === action.payload) {
        state.selectedWidgetId = null;
      }
    },
    updateWidget: (state, action: PayloadAction<WidgetConfig>) => {
      const index = state.layout.widgets.findIndex(
        (widget) => widget.id === action.payload.id
      );
      if (index !== -1) {
        state.layout.widgets[index] = action.payload;
      }
    },
    toggleWidgetVisibility: (state, action: PayloadAction<string>) => {
      const widget = state.layout.widgets.find(
        (widget) => widget.id === action.payload
      );
      if (widget) {
        widget.isVisible = !widget.isVisible;
      }
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
      if (!action.payload) {
        state.selectedWidgetId = null;
      }
    },
    selectWidget: (state, action: PayloadAction<string | null>) => {
      state.selectedWidgetId = action.payload;
    },
    resetLayout: (state) => {
      state.layout.widgets = defaultWidgets;
      state.isEditMode = false;
      state.selectedWidgetId = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLayout,
  addWidget,
  removeWidget,
  updateWidget,
  toggleWidgetVisibility,
  setEditMode,
  selectWidget,
  resetLayout,
  setLoading,
  setError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
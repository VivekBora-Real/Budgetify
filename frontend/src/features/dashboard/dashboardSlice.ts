import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardWidget } from '../../types';

interface DashboardState {
  widgets: DashboardWidget[];
  isEditMode: boolean;
  selectedWidget: string | null;
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: 'monthly-overview',
    type: 'monthly-overview',
    position: { x: 0, y: 0 },
    size: { width: 4, height: 2 },
  },
  {
    id: 'account-balances',
    type: 'account-balances',
    position: { x: 4, y: 0 },
    size: { width: 2, height: 2 },
  },
  {
    id: 'expense-chart',
    type: 'expense-chart',
    position: { x: 0, y: 2 },
    size: { width: 3, height: 2 },
  },
  {
    id: 'recent-transactions',
    type: 'recent-transactions',
    position: { x: 3, y: 2 },
    size: { width: 3, height: 2 },
  },
];

const initialState: DashboardState = {
  widgets: defaultWidgets,
  isEditMode: false,
  selectedWidget: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setWidgets: (state, action: PayloadAction<DashboardWidget[]>) => {
      state.widgets = action.payload;
    },
    addWidget: (state, action: PayloadAction<DashboardWidget>) => {
      state.widgets.push(action.payload);
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter((widget) => widget.id !== action.payload);
    },
    updateWidget: (state, action: PayloadAction<DashboardWidget>) => {
      const index = state.widgets.findIndex((widget) => widget.id === action.payload.id);
      if (index !== -1) {
        state.widgets[index] = action.payload;
      }
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
      if (!action.payload) {
        state.selectedWidget = null;
      }
    },
    selectWidget: (state, action: PayloadAction<string | null>) => {
      state.selectedWidget = action.payload;
    },
    resetDashboard: (state) => {
      state.widgets = defaultWidgets;
      state.isEditMode = false;
      state.selectedWidget = null;
    },
  },
});

export const {
  setWidgets,
  addWidget,
  removeWidget,
  updateWidget,
  setEditMode,
  selectWidget,
  resetDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
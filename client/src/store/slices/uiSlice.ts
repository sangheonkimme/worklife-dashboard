import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpened: boolean;
  colorScheme: 'light' | 'dark';
  isLoading: boolean;
}

const initialState: UiState = {
  sidebarOpened: false,
  colorScheme: 'dark',
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpened = !state.sidebarOpened;
    },
    setSidebarOpened: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpened = action.payload;
    },
    toggleColorScheme: (state) => {
      state.colorScheme = state.colorScheme === 'dark' ? 'light' : 'dark';
    },
    setColorScheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.colorScheme = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpened,
  toggleColorScheme,
  setColorScheme,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isWidgetOpen: false,
  messages: [
    {
      id: 'welcome_1',
      sender: 'ai',
      text: 'Hello! I am your **ShopNest AI Shopping Assistant**. I can help you find products, check order status, compare items, or answer store policy questions. What can I do for you today?',
      products: [],
      sources: [],
      timestamp: new Date().toISOString(),
    },
  ],
  isStreaming: false,
  streamingText: '',
  activeConfirmation: null, // { action, orderIdentifier, message }
};

export const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    toggleWidget: (state) => {
      state.isWidgetOpen = !state.isWidgetOpen;
    },
    openWidget: (state) => {
      state.isWidgetOpen = true;
    },
    closeWidget: (state) => {
      state.isWidgetOpen = false;
    },
    addMessage: (state, action) => {
      state.messages.push({
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        ...action.payload,
      });
    },
    setStreaming: (state, action) => {
      state.isStreaming = action.payload;
      if (!action.payload) state.streamingText = '';
    },
    appendStreamingText: (state, action) => {
      state.streamingText += action.payload;
    },
    clearChat: (state) => {
      state.messages = [initialState.messages[0]];
    },
    setActiveConfirmation: (state, action) => {
      state.activeConfirmation = action.payload;
    },
    clearActiveConfirmation: (state) => {
      state.activeConfirmation = null;
    },
  },
});

export const {
  toggleWidget,
  openWidget,
  closeWidget,
  addMessage,
  setStreaming,
  appendStreamingText,
  clearChat,
  setActiveConfirmation,
  clearActiveConfirmation,
} = aiSlice.actions;

export default aiSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  unreadByUser: {},
};

const getUserId = (message) => String(message?.userId || '');

const chatNotificationSlice = createSlice({
  name: 'chatNotifications',
  initialState,
  reducers: {
    addChatNotification: (state, action) => {
      const message = action.payload;
      const userId = getUserId(message);

      if (!userId || String(message?.chatType || '').toLowerCase() !== 'user') return;

      const notification = {
        id: message.id || message._id || `${userId}-${message.dateTime || Date.now()}`,
        userId,
        userName: message.userName || message.name || message.user?.userName || message.user?.name || '',
        message: message.message || '',
        dateTime: message.dateTime || new Date().toISOString(),
      };

      state.items.unshift(notification);
      state.unreadByUser[userId] = (state.unreadByUser[userId] || 0) + 1;
    },
    clearChatNotificationsByUser: (state, action) => {
      const userId = String(action.payload || '');
      if (!userId) return;

      state.items = state.items.filter((item) => String(item.userId) !== userId);
      delete state.unreadByUser[userId];
    },
    clearAllChatNotifications: (state) => {
      state.items = [];
      state.unreadByUser = {};
    },
  },
});

export const {
  addChatNotification,
  clearChatNotificationsByUser,
  clearAllChatNotifications,
} = chatNotificationSlice.actions;

export default chatNotificationSlice.reducer;

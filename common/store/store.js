import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import articleReducer from './auth/articleSlice';
import liveSessionReducer from './auth/liveSessionSlice';
import chatNotificationReducer from './auth/chatNotificationSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  articles: articleReducer,
  liveSession: liveSessionReducer,
  chatNotifications: chatNotificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

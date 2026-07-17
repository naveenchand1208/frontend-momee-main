'use client';

import './page.css';
import Image from 'next/image';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import {
  clearAllChatNotifications,
  clearChatNotificationsByUser,
} from '@/common/store/auth/chatNotificationSlice';
import { Colors } from '@/common/constants/colorEnum';

const formatNotificationTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ChatNotificationsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.chatNotifications.items);
  const unreadByUser = useSelector((state) => state.chatNotifications.unreadByUser);

  const sortedNotifications = useMemo(() => {
    return [...(notifications || [])].sort((a, b) => {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });
  }, [notifications]);

  const unreadCount = Object.values(unreadByUser || {}).reduce((total, count) => total + count, 0);

  const handleNotificationView = (notification) => {
    dispatch(clearChatNotificationsByUser(notification.userId));
    router.push(`/chat/${notification.userId}`);
  };

  const breadcrumbAction = sortedNotifications.length > 0
    ? [{
      label: 'Clear All',
      type: 'button',
      size: 'extraSmall',
      backgroundColor: Colors.Primary1,
      onClick: () => dispatch(clearAllChatNotifications()),
    }]
    : null;

  return (
    <div className="chat-notifications-page">
      <Breadcrumb
        items={[{ label: 'Chat Notifications' }]}
        actionButton={breadcrumbAction}
      />

      <div className="chat-notifications-header">
        <div>
          <h4 className="chat-notifications-title">Chat Notifications</h4>
          <p className="chat-notifications-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No unread messages'}
          </p>
        </div>
      </div>

      <div className="chat-notifications-list">
        {sortedNotifications.length === 0 ? (
          <div className="chat-notifications-empty">
            <Image
              src="/assets/icons/notification-icon.svg"
              alt="No notifications"
              width={34}
              height={34}
            />
            <div>
              <h5>No chat notifications</h5>
              <p>New user messages will appear here.</p>
            </div>
          </div>
        ) : (
          sortedNotifications.map((notification) => {
            const userUnreadCount = unreadByUser?.[notification.userId] || 0;

            return (
              <button
                type="button"
                key={notification.id}
                className="chat-notifications-row"
                onClick={() => handleNotificationView(notification)}
              >
                <span className="chat-notifications-avatar">
                  {(notification.userName || `U${notification.userId}`).slice(0, 1).toUpperCase()}
                </span>

                <span className="chat-notifications-content">
                  <span className="chat-notifications-row-top">
                    <span className="chat-notifications-user">
                      {notification.userName || `User ${notification.userId}`}
                    </span>
                    <span className="chat-notifications-time">
                      {formatNotificationTime(notification.dateTime)}
                    </span>
                  </span>

                  <span className="chat-notifications-message">
                    {notification.message || 'New message received'}
                  </span>
                </span>

                {userUnreadCount > 0 && (
                  <span className="chat-notifications-count">
                    {userUnreadCount > 99 ? '99+' : userUnreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

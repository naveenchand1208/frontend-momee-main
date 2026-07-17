'use client';

import './page.css';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import {
  clearAllChatNotifications,
  clearChatNotificationsByUser,
} from '@/common/store/auth/chatNotificationSlice';
import { Colors } from '@/common/constants/colorEnum';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { showError } from '@/common/toast/toastService';

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

const getUserRouteFromMomType = (momType) => {
  if (momType === 'pregMom') return 'preg-mom';
  if (momType === 'newMom') return 'new-mom';
  return '';
};

export default function ChatNotificationsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [openingUserId, setOpeningUserId] = useState('');
  const [userNamesById, setUserNamesById] = useState({});
  const notifications = useSelector((state) => state.chatNotifications.items);
  const unreadByUser = useSelector((state) => state.chatNotifications.unreadByUser);

  const sortedNotifications = useMemo(() => {
    return [...(notifications || [])].sort((a, b) => {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });
  }, [notifications]);

  const unreadCount = Object.values(unreadByUser || {}).reduce((total, count) => total + count, 0);

  useEffect(() => {
    const missingNameUserIds = [...new Set(
      sortedNotifications
        .filter((notification) => !notification.userName && !userNamesById[notification.userId])
        .map((notification) => notification.userId)
    )];

    if (missingNameUserIds.length === 0) return;

    let isMounted = true;
    const fetchUserNames = async () => {
      const nameEntries = await Promise.all(
        missingNameUserIds.map(async (userId) => {
          const profileResponse = await apiRequest(
            apiRoutes.viewPregMom,
            'POST',
            { params: { id: userId } },
            router
          );

          const userName = profileResponse?.data?.userName || profileResponse?.data?.name || '';
          return [userId, userName];
        })
      );

      if (!isMounted) return;

      setUserNamesById((prev) => {
        const next = { ...prev };
        nameEntries.forEach(([userId, userName]) => {
          next[userId] = userName || `User ${userId}`;
        });
        return next;
      });
    };

    fetchUserNames();

    return () => {
      isMounted = false;
    };
  }, [router, sortedNotifications, userNamesById]);

  const getNotificationUserName = (notification) => {
    return notification.userName || userNamesById[notification.userId] || `User ${notification.userId}`;
  };

  const findUserRoute = async (userId) => {
    const profileResponse = await apiRequest(
      apiRoutes.viewPregMom,
      'POST',
      { params: { id: userId } },
      router
    );

    const profileRoute = getUserRouteFromMomType(profileResponse?.data?.momType);
    if (profileResponse?.response && profileRoute) {
      return {
        route: profileRoute,
        id: profileResponse?.data?.id || profileResponse?.data?._id || userId,
      };
    }

    const [pregMomResponse, newMomResponse] = await Promise.all([
      apiRequest(apiRoutes.userList, 'POST', {
        params: {
          pagination: 'false',
          momType: 'pregMom',
          searchKey: userId,
        },
      }, router),
      apiRequest(apiRoutes.userList, 'POST', {
        params: {
          pagination: 'false',
          momType: 'newMom',
          searchKey: userId,
        },
      }, router),
    ]);

    const pregMom = pregMomResponse?.data?.docs?.find((user) => {
      return String(user?.id || user?._id || user?.userId) === String(userId);
    });
    if (pregMom) {
      return { route: 'preg-mom', id: pregMom.id || pregMom._id || userId };
    }

    const newMom = newMomResponse?.data?.docs?.find((user) => {
      return String(user?.id || user?._id || user?.userId) === String(userId);
    });
    if (newMom) {
      return { route: 'new-mom', id: newMom.id || newMom._id || userId };
    }

    return null;
  };

  const handleNotificationView = async (notification) => {
    const userId = String(notification.userId || '');
    if (!userId || openingUserId) return;

    setOpeningUserId(userId);
    try {
      const userDestination = await findUserRoute(userId);

      if (!userDestination) {
        showError('User not found in Preg Mom or New Mom.');
        return;
      }

      dispatch(clearChatNotificationsByUser(userId));
      router.push(`/${userDestination.route}/${userDestination.id}?tab=chatSystem`);
    } finally {
      setOpeningUserId('');
    }
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
            const isOpening = String(openingUserId) === String(notification.userId);
            const displayName = getNotificationUserName(notification);

            return (
              <button
                type="button"
                key={notification.id}
                className="chat-notifications-row"
                disabled={Boolean(openingUserId)}
                onClick={() => handleNotificationView(notification)}
              >
                <span className="chat-notifications-avatar">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>

                <span className="chat-notifications-content">
                  <span className="chat-notifications-row-top">
                    <span className="chat-notifications-user">
                      {displayName}
                    </span>
                    <span className="chat-notifications-time">
                      {formatNotificationTime(notification.dateTime)}
                    </span>
                  </span>

                  <span className="chat-notifications-message">
                    {notification.message || 'New message received'}
                  </span>
                </span>

                {isOpening ? (
                  <span className="chat-notifications-loader">
                    <CircularProgress size={18} />
                  </span>
                ) : userUnreadCount > 0 && (
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

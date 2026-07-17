// hooks/useSocket.js
'use client';
import { showSuccess } from '@/common/toast/toastService';
import { addChatNotification } from '@/common/store/auth/chatNotificationSlice';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';

let socketInstance = null;

export const normalizeChatMessage = (message = {}) => {
    const userId = message?.userId || message.user?.id || message.user?._id || message.senderId || message.fromUserId || '';
    const chatType = String(message.chatType || message.senderType || message.type || '').toLowerCase();

    return {
        ...message,
        userId: String(userId || ''),
        chatType,
        message: message.message || message.text || '',
        dateTime: message.dateTime || message.createdAt || message?.updatedAt || new Date().toISOString(),
    };
};

export const useSocket = ({ trackNotifications = false } = {}) => {
    const socketRef = useRef(null);
    const [, setSocketReady] = useState(false);
    const dispatch = useDispatch();
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    useEffect(() => {
        if (!socketUrl) return;

        if (!socketInstance) {
            socketInstance = io(socketUrl, {
                transports: ['websocket'],
            });
        }

        socketRef.current = socketInstance;
        setSocketReady(true);

        const handleConnect = () => {
            console.log('🟢 Frontend socket connected:', socketInstance.id);
        };

        // const handleChatMessage = (msg) => {
        //     // const normalizedMessage = normalizeChatMessage(msg);
        //     console.log('📥 Incoming message via socket:', msg, typeof msg);
        //         console.log('msg.chatType =', msg?.chatType);

        //     // console.log('trackNotifications:', trackNotifications);
        //     // if (msg?.chatType === 'user') {
        //     //     console.log(`📢 Message from user ${msg.userId}: ${msg.message}`);
        //     //     showSuccess(`New message from user ${msg.userId}: ${msg.message}`);
        //     // }
        //     // if (trackNotifications && msg.chatType === 'user') {
        //     //     dispatch(addChatNotification(msg));
        //     //     showSuccess(`New message from user ${msg.userId}: ${msg.message}`);
        //     // }
        // };

        const handleChatMessage = (msg) => {
            console.log('1', msg);

            // console.log('2');
            // if (msg?.chatType === 'user') {
            //     console.log('3');

            //     console.log(`📢 Message from user ${msg.userId}: ${msg.message}`);

            //     console.log('4');
            //     showSuccess(`New message from user ${msg.userId}: ${msg.message}`);

            //     console.log('5');
            // }

            // console.log('6');

            if (trackNotifications && msg.chatType === 'user') {
                console.log('7');

                dispatch(addChatNotification(msg));

                console.log('8');

                showSuccess(`New message from user ${msg.userId}: ${msg.message}`);

                console.log('9');
            }

            console.log('10');
        };
        socketInstance.on('connect', handleConnect);
        socketInstance.on('chat message', handleChatMessage);

        if (socketInstance.connected) {
            handleConnect();
        }

        return () => {
            socketInstance?.off('connect', handleConnect);
            socketInstance?.off('chat message', handleChatMessage);
        };
    }, [dispatch, socketUrl, trackNotifications]);

    return socketRef;
};

// 'use client';

// import { useEffect, useState } from 'react';
// import { useSocket } from '@/hooks/useSocket';
// import { apiRequest } from '@/common/api/apiService';
// import apiRoutes from '@/common/constants/apiRoutes';
// import { useParams } from 'next/navigation';
// import { showSuccess } from '@/common/toast/toastService';

// export default function ChatAdminToUsers() {
//     const { userId } = useParams();
//     const [chats, setChats] = useState([]);
//     const [message, setMessage] = useState('');
//     const socketRef = useSocket();

//     // Fetch chat history from API
//     const fetchChat = async () => {
//         const payload = {
//             params: { userId }
//         };
//         const data = await apiRequest(apiRoutes.viewAdminChats, 'POST', payload);
//         if (data?.response) {
//             const chatList = data?.data?.chats || [];
//             setChats(chatList);
//         }
//     };

//     // Initial fetch on user change
//     useEffect(() => {
//         fetchChat();
//     }, [userId]);

//     // Socket listener for incoming messages
//     useEffect(() => {
//         if (!socketRef.current) return;

//         const handler = (msg) => {
//             if (msg.userId === userId) {
//                 setChats((prev) => [...prev, msg]);
//                 // showSuccess(msg.message)
//             }
//         };

//         socketRef.current.on('chat message', handler);

//         return () => {
//             socketRef.current.off('chat message', handler);
//         };
//     }, [socketRef.current, userId]);

//     // Send message handler
//     const sendMessage = async () => {
//         if (!message.trim()) return;

//         const payload = {
//             params: {
//                 userId,
//                 message,
//                 chatType: 'admin',
//             }
//         };

//         // Save to database
//         await apiRequest(apiRoutes.addAdminChats, 'POST', payload);

//         // Emit socket for real-time broadcast (will also hit socket listener)
//         const newMsg = {
//             userId,
//             message,
//             chatType: 'admin',
//             dateTime: new Date().toISOString(),
//         };
//         socketRef.current.emit('chat message', newMsg);

//         // Clear input
//         setMessage('');
//     };

//     return (
//         <div className="w-2/3 p-4 flex flex-col h-screen">
//             {/* Chat Messages */}
//             <div className="flex-1 overflow-y-auto border p-2">
//                 {chats.map((chat, i) => (
//                     <div key={i} className={`my-2 ${chat.chatType === 'admin' ? 'text-right' : 'text-left'}`}>
//                         <div className="inline-block bg-gray-200 rounded px-3 py-2">
//                             {chat.message}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                             {new Date(chat.dateTime).toLocaleString()}
//                         </div>
//                     </div>
//                 ))}
//                 {chats.length === 0 && (
//                     <div className="text-center text-gray-400 py-10">No chats yet</div>
//                 )}
//             </div>

//             {/* Input & Send */}
//             <div className="flex mt-2">
//                 <input
//                     className="flex-1 border px-2 py-1"
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     placeholder="Type message"
//                 />
//                 <button
//                     onClick={sendMessage}
//                     className="bg-blue-500 text-black px-4 ml-2"
//                 >
//                     Send
//                 </button>
//             </div>
//         </div>
//     );
// }


'use client';

import { useEffect, useState } from 'react';
import { normalizeChatMessage, useSocket } from '@/hooks/useSocket';
import { apiRequest } from '@/common/api/apiService';
import apiRoutes from '@/common/constants/apiRoutes';
import { useParams } from 'next/navigation';
import ChatArea from '@/components/shared/chat-area/page';
import { clearChatNotificationsByUser } from '@/common/store/auth/chatNotificationSlice';
import { useDispatch } from 'react-redux';

export default function ChatAdminToUsers() {
    const { userId } = useParams();
    const [chats, setChats] = useState([]);
    const socketRef = useSocket();
    const dispatch = useDispatch();

    const appendChatMessage = (incomingMessage) => {
        const normalizedMessage = normalizeChatMessage(incomingMessage);
        setChats((prev) => {
            const messageId = normalizedMessage.id || normalizedMessage._id || normalizedMessage.clientId;
            if (messageId && prev.some((chat) => String(chat.id || chat._id || chat.clientId) === String(messageId))) {
                return prev;
            }

            return [...prev, normalizedMessage];
        });
    };

    const fetchChat = async () => {
        const payload = { params: { userId } };
        const data = await apiRequest(apiRoutes.viewAdminChats, 'POST', payload);
        if (data?.response) {
            setChats(data?.data?.chats || []);
        }
    };

    useEffect(() => {
        fetchChat();
        dispatch(clearChatNotificationsByUser(userId));
    }, [dispatch, userId]);

    useEffect(() => {
        if (!socketRef.current) return;

        const handler = (msg) => {
            const normalizedMessage = normalizeChatMessage(msg);
            if (String(normalizedMessage.userId) === String(userId)) {
                appendChatMessage(normalizedMessage);
                dispatch(clearChatNotificationsByUser(userId));
            }
        };

        socketRef.current.on('chat message', handler);
        return () => {
            socketRef.current.off('chat message', handler);
        };
    }, [dispatch, socketRef.current, userId]);

    // Pass this function to ChatBox
    const handleSend = async (message) => {
        const payload = {
            params: {
                userId,
                message,
                chatType: 'admin',
            }
        };

        await apiRequest(apiRoutes.addAdminChats, 'POST', payload);

        const newMsg = {
            clientId: `admin-${userId}-${Date.now()}`,
            userId,
            message,
            chatType: 'admin',
            dateTime: new Date().toISOString(),
        };

        socketRef.current?.emit('chat message', newMsg);
        appendChatMessage(newMsg);
    };

    return (
        <ChatArea
            chats={chats}
            onSend={handleSend}
            senderType="admin"
            placeholder="Type a message to user..."
        />
    );
}

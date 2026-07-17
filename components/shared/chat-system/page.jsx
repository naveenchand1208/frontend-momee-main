'use client';
import '../chat-system/page.css';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { normalizeChatMessage, useSocket } from '@/hooks/useSocket';
import { apiRequest } from '@/common/api/apiService';
import apiRoutes from '@/common/constants/apiRoutes';
import Button from '@/components/shared/button/page';
import { formatChatDate } from '@/common/utils/util';
import { showSuccess } from '@/common/toast/toastService';
import { clearChatNotificationsByUser } from '@/common/store/auth/chatNotificationSlice';
import { useDispatch, useSelector } from 'react-redux';
export default function ChatPage() {
    const { id } = useParams();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { viewMomDetails } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [chats, setChats] = useState([]);
    const [userName, setUserName] = useState('');
    const [profile, setProfile] = useState('');
    const [message, setMessage] = useState('');
    const socketRef = useSocket();
    const chatContainerRef = useRef(null);

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

    useEffect(() => {
        if (id) {
            setSelectedUserId(id);
            dispatch(clearChatNotificationsByUser(id));
        }
    }, [dispatch, id]);
    // Fetch chat when selected user changes
    useEffect(() => {
        if (!selectedUserId) return;
        const fetchChat = async () => {
            const payload = { params: { userId: selectedUserId } };
            const data = await apiRequest(apiRoutes.viewAdminChats, 'POST', payload);
            if (data?.response) {
                setChats(data?.data?.chats || []);
                setUserName(data?.data?.user?.userName || '');
                setProfile(data.data?.user?.profile || '');
            }
        };
        fetchChat();
    }, [selectedUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [chats]);

    // Handle incoming socket messages
    useEffect(() => {
        if (!socketRef.current || !selectedUserId) return;

        const handler = (msg) => {
            const normalizedMessage = normalizeChatMessage(msg);
            if (String(normalizedMessage.userId) === String(selectedUserId)) {
                appendChatMessage(normalizedMessage);
                dispatch(clearChatNotificationsByUser(selectedUserId));
                scrollToBottom();
            }
        };

        socketRef.current.on('chat message', handler);
        return () => {
            socketRef.current.off('chat message', handler);
        };
    }, [dispatch, socketRef.current, selectedUserId]);

    // Send a new message
    // const handleSend = async () => {
    //     if (!message.trim()) return;

    //     const payload = {
    //         params: {
    //             userId: selectedUserId,
    //             message,
    //             chatType: 'admin',
    //         }
    //     };
    //     await apiRequest(apiRoutes.addAdminChats, 'POST', payload);

    //     const newMsg = {
    //         userId: selectedUserId,
    //         message,
    //         chatType: 'admin',
    //         dateTime: new Date().toISOString(),
    //     };
    //     socketRef.current.emit('chat message', newMsg);
    //     setChats((prev) => [...prev, newMsg]);
    //     showSuccess('Message Sent');
    //     setMessage('');
    //     scrollToBottom();
    // };
    const handleSend = async () => {
        if (!message.trim()) return;

        const payload = {
            params: {
                userId: selectedUserId,
                message,
                chatType: 'admin',
            }
        };
        await apiRequest(apiRoutes.addAdminChats, 'POST', payload);

        const newMsg = {
            clientId: `admin-${selectedUserId}-${Date.now()}`,
            userId: selectedUserId,
            message,
            chatType: 'admin',
            dateTime: new Date().toISOString(),
        };
        socketRef.current?.emit('chat message', newMsg);
        appendChatMessage(newMsg);
        showSuccess('Message Sent');
        setMessage('');
        scrollToBottom();
    };

    // Scroll chat to bottom
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    return (
        <div className="mx-auto mt-10 rounded shadow-md overflow-hidden flex border border-gray-300 bg-white" style={{ width: '100%', height: '550px' }}>
            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#f6f7fb]">
                {selectedUserId ? (
                    <>
                        <div className="p-2 bg-white font-semibold border-b flex items-center gap-3">
                            <img
                                className="rounded-full border border-gray-300 object-cover cursor-pointer"
                                src={profile || "/assets/pregmom-profile.png"}
                                width={40}
                                height={40}
                                onClick={() => {
                                    setSelectedImage(profile || "/assets/pregmom-profile.png");
                                    setIsDialogOpen(true);
                                }}
                                onError={(e) => {
                                    e.target.src = "/assets/pregmom-profile.png";
                                }}
                                alt="Profile"

                            />
                            <span className="text-sm font-semibold text-gray-800" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                                {userName?.trim() ? userName : viewMomDetails?.viewMomDetails?.userName || ''}
                            </span>
                        </div>
                        <div
                            style={{ backgroundImage: `url('/assets/chat-background.jpg')` }}
                            ref={chatContainerRef}
                            className="flex-1 p-4 overflow-y-auto scrollbar-hidden"
                        >
                            {chats.length === 0 ? (
                                <div className="text-center text-gray-400 py-10" style={{ marginTop: '14%' }}>No chats yet</div>
                            ) : (
                                chats.map((chat, i) => {
                                    const currentDate = new Date(chat.dateTime).toDateString();
                                    const prevDate = i > 0 ? new Date(chats[i - 1].dateTime).toDateString() : null;

                                    const showDateHeader = currentDate !== prevDate;

                                    return (
                                        <div key={i}>
                                            {/* Date divider */}
                                            {showDateHeader && (
                                                <div className="flex justify-center mb-4 mt-2">
                                                    <span className="bg-[#fff] text-gray-700 px-3 py-1 rounded-full shadow-sm" style={{ fontSize: '11px', fontWeight: '600' }}>
                                                        {formatChatDate(currentDate)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Message bubble */}
                                            <div className={`flex mb-3 ${chat.chatType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`relative max-w-[70%] px-4 py-1 text-sm rounded-md ${chat.chatType === 'admin'
                                                        ? 'bg-[#6c63ff] text-white rounded-br-none'
                                                        : 'bg-[#f78db5] text-white rounded-bl-none'
                                                        }`}
                                                    style={{ fontSize: '12px', }}
                                                >
                                                    {chat.message}
                                                    <div className="text-[10px] text-right mt-1 text-gray-200">
                                                        {new Date(chat.dateTime).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                    {/* Bubble tail */}
                                                    <div
                                                        className={`absolute top-0 ${chat.chatType === 'admin'
                                                            ? 'right-[-8px] border-l-[8px] border-l-[#6c63ff] border-t-[8px] border-t-transparent'
                                                            : 'left-[-8px] border-r-[8px] border-r-[#f78db5] border-t-[8px] border-t-transparent'
                                                            }`}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {/* Input Area */}
                        <div className="flex items-center p-4 border-t bg-white gap-2">
                            <textarea
                                type="text"
                                // className="flex-1 px-2 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                className="flex-1 px-2 py-2 border border-black rounded text-sm focus:outline-none focus:ring-0 focus:border-gray-300"
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSend();
                                }}
                            />
                            <Button
                                iconPath={'/assets/icons/chat-send-icon.svg'}
                                size="medium"
                                shape='circle'
                                backgroundColor="#6c63ff"
                                onClick={handleSend}
                                className="ml-4 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                            />
                        </div>
                    </>
                ) : (
                    <div
                        className="flex-1 flex items-center justify-center text-gray-500 text-lg bg-no-repeat bg-center bg-contain"
                        style={{ backgroundImage: 'url("https://your-image-url.com/chat-placeholder.png")' }}
                    >
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}

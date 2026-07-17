'use client';

import { useState } from 'react';

export default function ChatArea({ chats = [], onSend, placeholder = "Type message...", senderType = "admin" }) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (!message.trim()) return;
        onSend(message);
        setMessage('');
    };

    return (
        <div className="w-2/3 p-4 flex flex-col h-screen">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto border p-2">
                {chats.map((chat, i) => (
                    <div
                        key={i}
                        className={`my-2 ${chat.chatType === senderType ? 'text-right' : 'text-left'}`}
                    >
                        <div className="inline-block bg-gray-200 rounded px-3 py-2">
                            {chat.message}
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date(chat.dateTime).toLocaleString()}
                        </div>
                    </div>
                ))}
                {chats.length === 0 && (
                    <div className="text-center text-gray-400 py-10">No chats yet</div>
                )}
            </div>

            {/* Input & Send */}
            <div className="flex mt-2">
                <input
                    className="flex-1 border px-2 py-1"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={placeholder}
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-500 text-black px-4 ml-2"
                >
                    Send
                </button>
            </div>
        </div>
    );
}





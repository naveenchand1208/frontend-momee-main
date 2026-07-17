'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
export default function ChatUserList() {
    const [users, setUsers] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            const payload = {
                params: {
                    pagination: 'false',
                    // page: '1',
                    // limit: '10',
                },
            }
            const data = await apiRequest(apiRoutes.getAdminChats, 'POST', payload, router);
            if (data?.response) {
                const chats = data?.data?.docs || [];
                setUsers(chats || []);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="w-1/3 border-r h-screen overflow-y-auto bg-[#fff]">
            <h5 className="text-xl font-bold p-4">Users</h5>
            {users.length === 0 ? (
                <div className="p-4 text-gray-500">No chats found</div>
            ) : (
                users.map(user => (
                    <div
                        key={user.userId}
                        onClick={() => router.push(`/chat/${user.userId}`)}
                        className="p-4 hover:bg-gray-100 cursor-pointer border-b"
                    >
                        <p>{user.userId}</p>
                    </div>
                ))
            )}
        </div>
    );
}



'use client';
import '../[id]/page.css';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { Colors } from '@/common/constants/colorEnum';
import MaterialTable from '@/components/shared/material-table/page';
export default function NotificationsView() {
    const {id} = useParams();
    const router = useRouter();
    const { id: notificationId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [notificationData, setNotificationData] = useState(null);
    const breadcrumbItems = [
        { label: 'Notifications', href: '/notifications' },
        { label: 'View Custom Notification', href:`/notifications/view/${id}`}
    ];
    const breadcrumbAction = [
        {
            label: 'Back',
            type: 'button',
            size: 'extraSmall',
            backgroundColor: Colors.Primary1,
            isLoading: false,
            onClick: () => router.push('/notifications'),
        }
    ];
    const headers = [
        { id: 'userName', label: 'Username' },
        {
            id: 'customStatus',
            label: 'Status',
            render: (row) => {
                const isSuccess = row.success;
                const textColor = isSuccess ? '#16a34a' : '#dc2626';
                const bgColor = isSuccess ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)';
                return (
                    <span
                        style={{
                            color: textColor,
                            backgroundColor: bgColor,
                            padding: '4px 10px',
                            fontSize: '12px',
                            borderRadius: '9999px',
                            fontWeight: '600',
                            display: 'inline-block',
                        }}
                    >
                        {isSuccess ? 'Success' : 'Failed'}
                    </span>
                );
            }
        },
        {
            id: 'reason',
            label: 'Failure Reason',
            render: (row) => (
                <span>
                    {row.success ? '' : row.reason || ''}
                </span>
            )
        }

    ];
    useEffect(() => {
        if (notificationId) {
            fetchNotification();
        }
    }, [notificationId]);
    const fetchNotification = async () => {
        setIsLoading(true);
        try {
            const payload = { params: { id: notificationId } };
            const data = await apiRequest(apiRoutes.viewCustomNotify, 'POST', payload, router);
            if (data?.response) {
                setNotificationData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notification details:', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />

            {isLoading ? (
                <p className="mt-5 text-center">Loading...</p>
            ) : notificationData ? (
                <div className="bg-white p-4 shadow rounded mb-2 mt-4">
                    <p className='content'><strong className='heading'>Title:</strong> {notificationData.title}</p>
                    <p className='content'><strong className='heading'>Message:</strong> {notificationData.message}</p>

                    <strong className="text-md font-semibold mt-5 mb-2 heading">User Delivery Status:</strong>
                    <div className='mt-3'>
                        <MaterialTable
                            headers={headers}
                            data={notificationData.userNotifications || []}
                            pagination={false}
                            isLoading={false}
                        />
                    </div>
                </div>
            ) : (
                <p className="mt-5 text-center">No notification data found.</p>
            )}
        </div>
    );
}

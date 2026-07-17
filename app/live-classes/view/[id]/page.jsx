'use client';
import './page.css';
import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import { useRouter, useParams } from "next/navigation";
import apiRoutes from "@/common/constants/apiRoutes";
import OverviewTab from './tabs/overview-tab';
import ParticipantsTab from './tabs/participants-tab';
import NotificationsTab from './tabs/notification-tab';
import { apiRequest } from "@/common/api/apiService";
import { Colors } from '@/common/constants/colorEnum';
import Tabs from '@/components/shared/custom-tab/page';
import { showSuccess } from '@/common/toast/toastService';
import { showError } from '@/common/toast/toastService';
import CustomDialog from '@/components/shared/dialog/dialog';
import MaterialTable from '@/components/shared/material-table/page';
import { formatDateTime } from '@/common/utils/util';
// import { useSelector } from 'react-redux';
export default function ViewLiveClasses() {
    const { id } = useParams();
    const router = useRouter();
    const fetchRef = useRef(false);
    const viewApiRef = useRef();
    const isEdit = id !== 'add';
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [viewLiveClasses, setViewLiveClasses] = useState({});
    const [backLoading, setBackLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('Overview');
    const [myNoteTableData, setMyNoteTableData] = useState([]);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [viewedUsers, setViewedUsers] = useState([]);
    const [dialogPage, setDialogPage] = useState(0);
    const [dialogRowsPerPage, setDialogRowsPerPage] = useState(10);
    // const currentDetails = useSelector(state => state.liveSession.currentDetails);
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Live Classes', href: '/live-classes' },
        {
            label: isEdit ? 'View' : 'Add',
            href: isEdit ? `/live-classes/${id}` : '/live-classes/add'
        },
    ];
    const breadcrumbAction = {
        label: 'Back',
        type: 'button',
        size: 'extraSmall',
        backgroundColor: Colors.Primary1,
        isLoading: backLoading,
        onClick: () => handleBackButton(),
    };
    const tabs = [
        {
            tabName: 'Overview',
            value: 'overview',
            onClick: () => tabHandle('Overview'),
        },
        {
            tabName: 'Participants',
            value: 'participants',
            onClick: () => tabHandle('Participants'),
        },
        {
            tabName: 'Notifications',
            value: 'notifications',
            onClick: () => tabHandle('Notifications'),
        },
    ];
    const myTableHeaders = [
        { id: 'name', label: 'Username', sortable: true },
        { id: 'mobileNumber', label: 'Mobile Number', sortable: 'true' },
        { id: 'email', label: 'Email', sortable: true },
        { id: 'period', label: 'Period', sortable: true },
        { id: 'createdAt', label: 'Payment Date Time', sortable: 'false' },

    ];
    const formattedUserData = (viewLiveClasses?.users || []).map((user, index) => ({
        _id: user.id?.toString() || index.toString(),
        name: user.name || '-',
        mobileNumber: user.mobile || '-',
        email: user.email || '-',
        period: user.Week !== undefined ? `Week ${user.Week}` : '-',
        createdAt: user.paymentDateAndTime || '-',
    }));
    const onNotify = async (selectedUserIds, { title, message }) => {
        const payload = {
            params: {
                title,
                message,
                userIds: selectedUserIds,
            },
        };
        try {
            const result = await apiRequest(apiRoutes.addSessionNotification, 'POST', payload);

            if (result?.response) {
                showSuccess("Notification sent successfully.");
            }
        } catch (error) {
            console.error("Notification error:", error);
        }
    };
    const myNoteTableHeaders = [
        { id: 'title', label: 'Title', sortable: true },
        { id: 'createdAt', label: 'Date and Time', sortable: 'true' },
        { id: 'userCount', label: 'Users Count', sortable: true },
        { id: 'action', label: 'Action', sortable: true },
    ];
    const userTableHeaders = [
        { id: 'sno', label: 'S.No' },
        { id: 'userName', label: 'User Name' }
    ];
    const handleView = (row) => {
        const selectedNotification = myNoteTableData.find(
            (item) => item.id === row.id
        );

        if (selectedNotification) {
            setViewedUsers(selectedNotification.users || []);
            setIsViewDialogOpen(true);
        } else {
            showError("Notification data not found.");
        }
    };
    const actionConfig = [
        { iconName: 'more-information-icon', disabled: false, onClick: handleView },
    ];
    useEffect(() => {
        if (!isEdit) return;
        if (fetchRef.current) return;
        fetchRef.current = true;
        fetchLiveSession(id);
    }, [id, isEdit]);
    useEffect(() => {
        if (selectedTab === 'Notifications') {
            fetchNotifications(id);
        }
    }, [selectedTab, id, page, rowsPerPage, sortField, sortOrder]);
    const tabHandle = (tabName) => {
        console.log('tabName', tabName)
        if (tabName) {
            setSelectedTab(tabName)
            // fetchUserReports();
        }
    }
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const updatedPage = newPage !== undefined ? newPage : page;
        const updatedRows = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        if (selectedTab === 'Notifications') {
            fetchNotifications(updatedPage + 1, updatedRows, { sortField, sortOrder });
        }

        if (selectedTab === 'Participants') {
            const pagedData = (viewLiveClasses?.users || []).slice(
                updatedPage * updatedRows,
                updatedPage * updatedRows + updatedRows
            );
            setFormattedUserData(pagedData); // Assuming you're storing paged result
        }
    };
    const handleDialogTableChange = ({ newPage, newRowsPerPage }) => {
        if (newRowsPerPage !== undefined) {
            setDialogRowsPerPage(newRowsPerPage);
            setDialogPage(0);
        }
        if (newPage !== undefined) {
            setDialogPage(newPage);
        }
    };
    const paginatedData = viewedUsers
        .slice(dialogPage * dialogRowsPerPage, dialogPage * dialogRowsPerPage + dialogRowsPerPage)
        .map((user, index) => ({
            ...user,
            sno: dialogPage * dialogRowsPerPage + index + 1,
        }));
    const handleBackButton = () => {
        setBackLoading(true);
        router.push('/live-classes');
    }
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        // fetchJourney(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const fetchLiveSession = async (id) => {
        setIsLoading(true);
        const payload = {
            params: {
                id,
            },
        };
        try {
            const data = await apiRequest(apiRoutes.viewLiveSession, 'POST', payload);
            console.log('Live session detail:', data);
            if (data?.response) {
                setViewLiveClasses(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch session data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const fetchNotifications = async () => {
        setIsLoading(true);
        const payload = {
            params: {
                pagination: 'false',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getNotificationList, 'POST', payload, router);
            if (data?.response) {
                const notifications = (data?.data?.docs || []).map((note) => ({
                    ...note,
                    createdAt: formatDateTime(note.createdAt),
                }));
                setMyNoteTableData(notifications);
                setTotalDocs(data?.data?.totalDocs || 0);
            } else {
                showError(data?.message || 'Failed to load notifications');
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            showError('Something went wrong while loading notifications.');
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="max-w-6xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />
            {/* {isLoading ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        width: '100%',
                    }}
                >
                    <CircularProgress />
                </div>
            ) : (
               
            )} */}
            <div style={{ fontSize: '14px' }}>
                <Tabs tabs={tabs} initialActive={0} selectedIndex="selectedTab" />
            </div>
            {selectedTab === 'Overview' && (
                <OverviewTab viewLiveClasses={viewLiveClasses} />
            )}
            {selectedTab === 'Participants' && (
                <ParticipantsTab
                    myTableHeaders={myTableHeaders}
                    myTableData={formattedUserData}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalDocs={viewLiveClasses?.users?.length || 0}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    isLoading={isLoading}
                    onSortChange={handleSortChange}
                    onTableChange={handleTableChange}
                    onNotify={onNotify}
                />
            )}
            {selectedTab === 'Notifications' && (
                <NotificationsTab
                    myNoteTableHeaders={myNoteTableHeaders}
                    myNoteTableData={myNoteTableData}
                    page={page}
                    actionConfig={actionConfig}
                    rowsPerPage={rowsPerPage}
                    totalDocs={viewLiveClasses?.users?.length || 0}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    isLoading={isLoading}
                    onSortChange={handleSortChange}
                    onTableChange={handleTableChange}
                />
            )}
            <CustomDialog
                open={isViewDialogOpen}
                onClose={() => setIsViewDialogOpen(false)}
                title="Users Notified"
                titleColor="#000"
                backgroundColor="#f9f9f9"
                maxWidth="md"
                content={
                    viewedUsers.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">No users found</div>
                    ) : (
                        <MaterialTable
                            headers={userTableHeaders}
                            data={paginatedData}
                            page={dialogPage}
                            rowsPerPage={dialogRowsPerPage}
                            totalCount={viewedUsers.length}
                            isLoading={isLoading}
                            sortConfig={{}}
                            onSortChange={() => { }}
                            onTableChange={handleDialogTableChange}
                        />
                    )
                }
            />
        </div>
    );
}


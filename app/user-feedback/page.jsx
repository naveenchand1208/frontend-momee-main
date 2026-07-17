'use client';
import './page.css';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import { ACTIVE_STATUS, MOM_TYPE } from '@/common/constants/enum';
import { Colors } from '@/common/constants/colorEnum';
export default function User_FeedBack() {
    const router = useRouter();
    const fetchedRef = useRef();
    const [page, setPage] = useState(0);
    const [liveList, setLiveList] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [viewform, setViewform] = useState({});
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    // const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('Active/Inactive');
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        momType: '',
        dateRange: { fromDate: '', toDate: '' },
    });
    const breadcrumbItems = [
        { label: 'Feedback Management' },
        { label: 'User Feedback', href: '/user-feedback' },
    ];
    const breadcrumbAction = [
        // {
        //     iconPath: '/assets/icons/download-icon.svg',
        //     type: 'textIcon',
        //     label: 'Export',
        //     onClick: () => console.log('Download clicked'),
        // },
        // {
        //     iconPath: '/assets/icons/outlined-filter-icon.svg',
        //     type: 'textIcon',
        //     label: 'Filter',
        //     onClick: () => setFilterOpen(true),
        // },
        // {
        //     type: 'statusTabs',
        //     onChange: (val) => {
        //         if (val === 'All') {
        //             setForm((prev) => ({ ...prev, status: '' }));
        //             const filters = { ...form };
        //             delete filters.status;
        //             fetchUserFeedback(1, 10, filters);
        //             setStatusLabel('Active/Inactive');
        //         } else {
        //             setForm((prev) => ({ ...prev, status: val }));
        //             fetchUserFeedback(1, 10, { ...form, status: val });
        //             setStatusLabel(val);
        //         }
        //     },
        // },
        {
            iconPath: '/assets/icons/new-icon.svg',
            label: 'Add',
            type: 'button',
            size: 'extraSmall',
            backgroundColor: Colors.Primary1,
            isLoading: addLoading,
            onClick: () => navigateToAddPage(),
        },
    ];
    const myTableHeaders = [
        { id: 'title', label: 'Title', sortable: false },
        { id: 'description', label: 'Description', sortable: true },
        // { id: 'action', label: 'Action', sortable: false },
    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search name',
            inputType: 'text',
            value: form.searchKey,
        },
        {
            name: 'status',
            label: '',
            placeholder: 'Choose Status',
            inputType: 'autocomplete',
            options: ACTIVE_STATUS,
            value: form.status,
        },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        },
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchUserFeedback(page + 1, rowsPerPage, { sortField, sortOrder });
    }, [sortField, sortOrder]);

    const handleEdit = (row) => {
        router.push(`/user-feedback/${row?.id}`)
    };
    const handleDelete = (row) => {
        setViewform(row)
        setIsDeleteDialogOpen(true)
    };
    const handleDeleteCancel = () => {
        setIsDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);
        const payload = { params: { id: viewform.id } }
        const data = await apiRequest(apiRoutes.deleteUserFeedback, 'POST', payload, router);
        if (data.response) {
            fetchUserFeedback(page + 1, rowsPerPage, {})
        }
    };
    const actionConfig = [
        // { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        // { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const navigateToAddPage = () => {
        setAddLoading(true);
        router.push('/user-feedback/add');
    }
    const fetchUserFeedback = async (pageNum = 1, limit = 5, options = {}) => {
        setIsLoading(true);
        const formatDate = (date) =>
            date ? new Date(date).toISOString().split('T')[0] : '';
        const payload = {
            params: {
                sortField: options.sortField || '',
                sortOrder: options.sortOrder || 'asc',
                pagination: 'true',
                page: pageNum,
                limit: limit,
                searchKey: options.searchKey || '',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getUserFeedbackList, 'POST', payload, router);
            if (data.response) {
                const journey = data?.data?.docs.map((js) => ({
                    ...js,
                }))
                setLiveList(journey || []);
                setTotalDocs(data?.data?.totalDocs);
            }
        } catch (error) {
            console.error('Failed to fetch journey:', error);
        } finally {
            setIsLoading(false);
        }
    }
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchUserFeedback(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchUserFeedback(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const payload = { params: updatedRow };
        try {
            const data = await apiRequest(apiRoutes, 'POST', payload, router);
            fetchUserFeedback()
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    // const handleFilterSubmit = (filterValues) => {
    //     setFilterOpen(false)
    //     setForm(prev => ({
    //         ...prev,
    //         searchKey: filterValues.searchKey || '',
    //         status: filterValues.status || '',
    //         dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
    //     }));
    //     fetchUserFeedback(page + 1, rowsPerPage, { sortField, sortOrder, ...filterValues },);
    // }
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <MaterialTable
                headers={myTableHeaders}
                data={liveList}
                actionConfig={actionConfig}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalDocs}
                isLoading={isLoading}
                sortConfig={{ [sortField]: sortOrder }}
                onSortChange={handleSortChange}
                onToggleStatus={handleToggleStatus}
                onTableChange={handleTableChange}
            />
            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title='Delete'
                message="Are you sure you want to delete?"
                cancelLabel="No"
                confirmLabel="Yes"
            />
            {/* {
                filterOpen && (
                    <CustomDialog
                        open={filterOpen}
                        onClose={() => setFilterOpen(false)}
                        title=""
                        titleColor="#000000"
                        backgroundColor="#fafcfc"
                        content={
                            <CommonFilter
                                inputFields={inputFields}
                                initialValues={form}
                                onSubmit={(formValues) => handleFilterSubmit(formValues)}
                                onclose={() => setFilterOpen(false)}
                            />
                        }
                        actions={<button onClick={() => setFilterOpen(false)}>Close</button>}
                        maxWidth="xs"
                        position="top-left"
                    />
                )
            } */}
        </div>
    );
}

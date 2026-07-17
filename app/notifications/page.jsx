'use client';
import './page.css';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { objectToFormData, formattedDate } from '@/common/utils/util'
import { Colors } from '@/common/constants/colorEnum';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
export default function Notifications() {
    const router = useRouter();
    const fetchedRef = useRef(false);
    const [hospitalList, setHospitalList] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [addLoading, setAddLoading] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('');
    const isDownloadingRef = useRef(false);
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        dateRange: { fromDate: '', toDate: '' },
    });
    const breadcrumbItems = [
        { label: 'Notifications' },
        { label: 'Custom Notifications', href: '/notifications' },
    ];
    const breadcrumbAction = [
        // {
        //   iconPath: '/assets/icons/search-icon.svg',
        //   placeholder: 'Search',
        //   name: 'searchKey',
        //   label: '',
        //   value: form.searchKey,
        //   required: false,
        //   onChange: (e) => setForm({ ...form, searchKey: e.target.value }),
        // },
        // {
        //     iconPath: '/assets/icons/download-icon.svg',
        //     type: 'textIcon',
        //     label: 'Export',
        //     onClick: () => downloadExcel(),
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
        //         if (val === 'All') val = '';
        //         setStatusLabel(val)
        //         setForm((prev) => {
        //             const updatedForm = { ...prev, status: val };
        //             fetchCustomNotifications(1, 10, updatedForm);
        //             return updatedForm;
        //         });
        //     }
        // },
        {
            iconPath: '/assets/icons/new-icon.svg',
            label: 'Add',
            type: 'button',
            size: 'extraSmall',
            backgroundColor: Colors.Primary1,
            isLoading: addLoading,
            onClick: () => navigateToAddPage(),
        }
    ];
    const userListHeaders = [
        { id: 'file', label: 'Thumbnail', sortable: false },
        { id: 'title', label: 'Title', sortable: false },
        { id: 'message', label: 'Message', sortable: true },
        { id: 'createdAt', label: 'Date', sortable: false },
        // { id: 'status', label: 'Status', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search name or email',
            inputType: 'text',
            value: '',
        },
        // {
        //     name: 'status',
        //     label: '',
        //     placeholder: 'Choose Status',
        //     inputType: 'autocomplete',
        //     options: ACTIVE_STATUS,
        //     value: '',
        // },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        }
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchCustomNotifications(page + 1, rowsPerPage, { sortField, sortOrder });
    }, [sortField, sortOrder]);
    //   const [form, setForm] = useState({
    //     searchKey: '',
    //   });
    const handleView = (row) => {
        console.log('Parent received VIEW action:', row);
        router.push(`/notifications/view/${row.id}`)

    };
    // const handleEdit = (row) => {
    //     console.log('Parent received EDIT action:', row);
    //     router.push(`/hospitals/${row.id}`)
    // };
    const actionConfig = [
        { iconName: 'view-icon', disabled: false, onClick: handleView },
        // { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const navigateToAddPage = () => {
        setAddLoading(true);
        router.push('/notifications/add')
    }
    const fetchCustomNotifications = async (pageNum = 1, limit = 5, options = {}) => {
        setIsLoading(true);
        const formatDate = (date) =>
            date ? new Date(date).toISOString().split('T')[0] : '';
        const payload = {
            params: {
                // sortField: options.sortField || '',
                // sortOrder: options.sortOrder || 'asc',
                pagination: 'true',
                page: pageNum,
                limit: limit,
                searchKey: options.searchKey || '',
                status: options.status || '',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getCustomNotify, 'POST', payload, router);
            if (data?.response) {
                const formatDate = (date) =>
                    date ? new Date(date).toISOString().split('T')[0] : '';

                const formattedData = (data?.data?.docs || []).map(item => ({
                    ...item,
                    file: item.file && item.file.trim() !== ""
                        ? item.file
                        : '/assets/icons/no-image.svg',
                    createdAt: formattedDate(item.createdAt)
                }));

                setHospitalList(formattedData);
                setTotalDocs(data?.data?.totalDocs);
            }

        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchCustomNotifications(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchCustomNotifications(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const payload = {
            id: updatedRow.id,
            status: updatedRow.status
        };
        const formData = objectToFormData(payload)
        try {
            const data = await apiRequest(apiRoutes.updateHospital, 'POST', formData, router);
            fetchCustomNotifications()
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const downloadExcel = async () => {
        if (isDownloadingRef.current) return;
        isDownloadingRef.current = true;
        try {
            const { searchKey, ...rest } = form;
            const payload = {
                params: {
                    ...rest,
                    status: statusLabel,
                    searchKey: searchKey,
                }
            };
            await apiRequest(apiRoutes.hospitalExport, 'POST', payload, router, 'blob', 'hospital.xlsx');
        } catch (error) {
            console.log('Excel download error:', error);
            showError(error.message || 'Download failed');
        } finally {
            isDownloadingRef.current = false;
        }
    };
    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false)
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            // status: filterValues.status || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
        }));
        fetchCustomNotifications(page + 1, rowsPerPage, { sortField, sortOrder, ...filterValues },);
    }
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <MaterialTable
                headers={userListHeaders}
                data={hospitalList}
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
            {
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
            }
        </div>
    );
}

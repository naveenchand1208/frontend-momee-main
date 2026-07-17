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
import { Colors } from '@/common/constants/colorEnum';
import { formattedDate } from '@/common/utils/util';
import { objectToFormData } from '@/common/utils/util';

export default function LiveClasses() {
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
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('');
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        momType: '',
        dateRange: { fromDate: '', toDate: '' },
    });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Live Classes', href: '/live-classes' },
    ];
    const breadcrumbAction = [
        // {
        //     iconPath: '/assets/icons/download-icon.svg',
        //     type: 'textIcon',
        //     label: 'Export',
        //     onClick: () => console.log('Download clicked'),
        // },
        {
            iconPath: '/assets/icons/outlined-filter-icon.svg',
            type: 'textIcon',
            label: 'Filter',
            onClick: () => setFilterOpen(true),
        },
        {
            type: 'statusTabs',
            // onChange: (val) => {
            //     if (val === 'All') val = '';
            //     setStatusLabel(val)
            //     setForm((prev) => {
            //         const updatedForm = { ...prev, status: val };
            //         fetchLiveSession(1, 10, updatedForm);
            //         return updatedForm;
            //     });
            // }
            onChange: (val) => {
                if (val === 'All') val = '';

                setStatusLabel(val);
                setPage(0); // ✅ reset page

                setForm((prev) => {
                    const updatedForm = { ...prev, status: val };
                    fetchLiveSession(1, rowsPerPage, updatedForm); // ✅ CHANGE HERE
                    return updatedForm;
                });
            },
        },
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
        { id: 'file', label: 'Thumbnail', sortable: false },
        { id: 'id', label: 'Id', sortable: true },
        { id: 'deviceType', label: 'Device Type', sortable: true },
        { id: 'name', label: 'Name', sortable: true },
        { id: 'fromDate', label: 'From Date', sortable: false },
        { id: 'toDate', label: 'To Date', sortable: false },
        { id: 'startTime', label: 'Start Time', sortable: true },
        { id: 'endTime', label: 'End Time', sortable: true },
        { id: 'performedBy', label: 'Performed By', sortable: true },
        { id: 'amount', label: 'Amount', sortable: true },
        { id: 'momType', label: 'Mom Type', sortable: true },
        { id: 'createdAt', label: 'Created Date', sortable: false },
        { id: 'status', label: 'Status', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search name',
            inputType: 'text',
            value: form.searchKey,
        },
        // {
        //     name: 'status',
        //     label: '',
        //     placeholder: 'Choose Status',
        //     inputType: 'autocomplete',
        //     options: ACTIVE_STATUS,
        //     value: form.status,
        // },
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
        fetchLiveSession(page + 1, rowsPerPage, { sortField, sortOrder });
    }, [sortField, sortOrder]);
    const handleEdit = (row) => {
        router.push(`/live-classes/${row?.id}`)
    };
    const handleView = (row) => {
        router.push(`/live-classes/view/${row?.id}`)
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
        const data = await apiRequest(apiRoutes.deleteLiveSession, 'POST', payload, router);
        if (data.response) {
            fetchLiveSession(page + 1, rowsPerPage, {})
        }
    };
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        { iconName: 'view-icon', disabled: false, onClick: handleView },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const navigateToAddPage = () => {
        setAddLoading(true);
        router.push('/live-classes/add');
    }
    const fetchLiveSession = async (pageNum = 1, limit = 10, options = {}) => {
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
                status: options.status || '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getLiveSessionList, 'POST', payload, router);
            if (data.response) {
                const journey = data?.data?.docs.map((js) => ({
                    ...js,
                    createdAt: formattedDate(js.createdAt),
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
        fetchLiveSession(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchLiveSession(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const { id, status } = updatedRow;
        const formData = new FormData();
        formData.append('id', id);
        formData.append('status', status);
        try {
            const data = await apiRequest(apiRoutes.updateLiveSession, 'POST', formData, router, true);
            fetchLiveSession(page + 1, rowsPerPage, { ...form, sortField, sortOrder });
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false)
        setPage(0);
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            status: filterValues.status || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
        }));
        fetchLiveSession(page, rowsPerPage, { sortField, sortOrder, ...filterValues },);
    }
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

'use client';
import './page.css';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import { Colors } from '@/common/constants/colorEnum';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
// import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { objectToFormData } from '@/common/utils/util';
import { ACTIVE_STATUS } from '@/common/constants/enum';
export default function Sos_Requests() {
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    // const [addLoading, setAddLoading] = useState(false);
    // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    // const [viewform, setViewform] = useState({});
    const fetchedRef = useRef(false);
    const [userOptions, setUserOptions] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('Active/Inactive');
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        momType: '',
        dateRange: { fromDate: '', toDate: '' },
        userId: '',
    });
    const breadcrumbItems = [
        { label: 'SOS Management' },
        { label: 'SOS Requests', href: '/sos-requests' },
    ];
    const breadcrumbAction = [
        // {
        //     label: 'Add',
        //     type: 'button',
        //     size: 'small',
        //     color: '#fff',
        //     backgroundColor: '#e88691',
        //     isLoading: addLoading,
        //     onClick: () => handleAddPodCasts(),
        // }
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
        ,
        {
            type: 'statusTabs',
            onChange: (val) => {
                if (val === 'All') {
                    setForm((prev) => ({ ...prev, status: '' }));
                    const filters = { ...form };
                    delete filters.status;
                    fetchSosRequests(1, 10, filters);
                    setStatusLabel('Active/Inactive');
                } else {
                    setForm((prev) => ({ ...prev, status: val }));
                    fetchSosRequests(1, 10, { ...form, status: val });
                    setStatusLabel(val);
                }
            },
        },
    ];
    const myTableHeaders = [
        { id: 'date', label: 'Date', sortable: true },
        { id: 'userName', label: 'User', sortable: true },
        { id: 'note', label: 'Note', sortable: true },
        { id: 'count', label: 'Sos Count', sortable: true },
        // { id: 'file', label: 'Thumbnail', sortable: false },
        // { id: 'momType', label: 'Mom Type', sortable: true },
        // { id: 'music', label: 'Music', sortable: true },
        // { id: 'status', label: 'Status', sortable: true },
        // { id: 'action', label: 'Action', sortable: false },
    ];
    const inputFields = [
        // {
        //     name: 'status',
        //     label: '',
        //     placeholder: 'Choose Status',
        //     inputType: 'autocomplete',
        //     options: ACTIVE_STATUS,
        //     value: form.status,
        // },
        {
            name: 'userId',
            label: '',
            placeholder: 'Choose User',
            inputType: 'autocomplete',
            options: userOptions,
            value: form.userId,
        },
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
        fetchSosRequests(page + 1, rowsPerPage, { sortField, sortOrder });
    }, []);
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        const fetchUserOptions = async () => {
            try {
                const payload = { params: { pagination: 'false' } };
                const data = await apiRequest(apiRoutes.userList
                    , 'POST', payload, router);
                if (data?.response) {
                    const users = data.data.docs.map((user) => ({
                        // label: user.userName,
                        value: user.id,
                    }));
                    setUserOptions(users);
                    console.log(users);
                }
            } catch (error) {
                console.error('Failed to fetch plan options:', error);
            }
        };
        fetchUserOptions();
    }, []);
    // const fetchSosRequests = async (pageNum = 1, limit = 5, options = {}) => {
    //     setIsLoading(true);
    //     const formatDate = (date) =>
    //         date ? new Date(date).toISOString().split('T')[0] : '';
    //     const payload = {
    //         params: {
    //             sortField: options.sortField || '',
    //             sortOrder: options.sortOrder || 'asc',
    //             pagination: 'true',
    //             page: pageNum,
    //             limit: limit,
    //             status: options.status || '',
    //             userId: options.userId || '',
    //             fromDate: formatDate(options.dateRange?.fromDate),
    //             toDate: formatDate(options.dateRange?.toDate),
    //         },
    //     };

    //     try {
    //         const data = await apiRequest(apiRoutes.getSosRequestList, 'POST', payload, router);
    //         if (data?.response) {
    //             const requests = data?.data?.docs?.map(req => ({
    //                 ...req,
    //                 // userName: req.user.userName,
    //                 note: "Emergency",
    //             }))
    //             setRequests(requests);
    //             setTotalDocs(data?.data?.totalDocs);
    //         }
    //     } catch (err) {
    //         console.error('Failed to fetch articles:', err);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    const fetchSosRequests = async (pageNum = 1, limit = 5, options = {}) => {
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
                status: options.status || '',
                userId: options.userId || '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };

        try {
            const data = await apiRequest(
                apiRoutes.getSosRequestList,
                'POST',
                payload,
                router
            );

            if (data?.response) {
                const requests = data?.data?.docs?.map((req) => ({
                    ...req,

                    // ✅ FLATTEN USER NAME FOR TABLE
                    userName:
                        req?.user?.userName ||
                        req?.user?.relationName ||
                        req?.user?.email ||
                        '-',

                    // Optional formatting
                    date: req?.date || '-',
                    note: 'Emergency',
                    count: req?.count ?? 0,
                }));

                setRequests(requests);
                setTotalDocs(data?.data?.totalDocs);
            }
        } catch (err) {
            console.error('Failed to fetch SOS requests:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchSosRequests(finalPage + 1, finalRowsPerPage, { sortField, sortOrder });
    };
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchSosRequests(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    // const handleToggleStatus = async (updatedRow) => {
    //     setIsLoading(true);
    //     // const payload = { params: updatedRow };
    //     // const formData = new FormData();
    //     // for (const key in updatedRow) {
    //     //     if (updatedRow.hasOwnProperty(key)) {
    //     //         const value = updatedRow[key];
    //     //         formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    //     //     }
    //     // }
    //     const formData = objectToFormData(updatedRow)
    //     try {
    //         const data = await apiRequest(apiRoutes.updatePodCasts, 'POST', formData, router);
    //         fetchSosRequests()
    //     } catch (error) {
    //         console.error('Failed to fetch subscriptions:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    // const handleAddPodCasts = () => {
    //     setAddLoading(true);
    //     router.push('/podcasts/add');
    // }
    // const handleEdit = (row) => {
    //     router.push(`/podcasts/${row?.id}`)
    // };
    // const handleDelete = (row) => {
    //     setViewform(row)
    //     setIsDeleteDialogOpen(true)
    // };
    // const actionConfig = [
    //     // { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
    //     // { iconName: 'view-icon', disabled: false, onClick: handleView },
    //     // { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    // ];
    // const handleDeleteCancel = () => {
    //     setIsDeleteDialogOpen(false);
    // };
    // const handleDeleteConfirm = async () => {
    //     setIsDeleteDialogOpen(false);
    //     const payload = { params: { id: viewform.id } }
    //     const data = await apiRequest(apiRoutes.deletePodCasts, 'POST', payload, router);
    //     if (data.response) {
    //         fetchSosRequests(page + 1, rowsPerPage, {})
    //     }
    // };
    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false)
        const userId = userOptions.find(userId => userId.label === filterValues.userId)?.value;
        filterValues.userId = userId;
        setForm(prev => ({
            ...prev,
            status: filterValues.status || '',
            userId: filterValues.userId || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
        }));
        fetchSosRequests(page + 1, rowsPerPage, { sortField, sortOrder, ...filterValues },);
    }
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <MaterialTable
                headers={myTableHeaders}
                data={requests}
                // actionConfig={actionConfig}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalDocs}
                isLoading={isLoading}
                sortConfig={{ [sortField]: sortOrder }}
                onSortChange={handleSortChange}
                // onToggleStatus={handleToggleStatus}
                onTableChange={handleTableChange}
            />
            {/* <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title='Delete'
                message="Are you sure you want to delete?"
                cancelLabel="No"
                confirmLabel="Yes"
            /> */}
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

'use client';
import './page.css';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { Colors } from '@/common/constants/colorEnum';
import { objectToFormData } from '@/common/utils/util';
import { ACTIVE_STATUS, MOM_TYPE } from '@/common/constants/enum';
import { getWeeks, getMonths, formattedDate } from '@/common/utils/util';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
export default function Podcasts() {
    const router = useRouter();
    const [podCasts, setPodCasts] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [viewform, setViewform] = useState({});
    const fetchedRef = useRef(false);
    // const [months, setMonths] = useState(false);
    // const [weeks, setWeeks] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('');
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        momType: '',
        dateRange: { fromDate: '', toDate: '' },
        // month: '',
        // week: '',
    });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Podcasts', href: '/podcasts' },
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
            //         fetchPodCasts(1, 10, updatedForm);
            //         return updatedForm;
            //     });
            // }
            onChange: (val) => {
                const status = val === 'All' ? '' : val;

                setStatusLabel(val === 'All' ? 'Active/Inactive' : val);
                setPage(0); // ✅ RESET PAGE when switching tab

                setForm((prev) => {
                    const updatedForm = { ...prev, status };

                    fetchPodCasts(
                        1,                 // ✅ always first page
                        rowsPerPage,       // ✅ DO NOT hardcode 10
                        updatedForm
                    );

                    return updatedForm;
                });
            }

        },
        {
            iconPath: '/assets/icons/new-icon.svg',
            label: 'Add',
            type: 'button',
            size: 'extraSmall',
            color: '#fff',
            backgroundColor: Colors.Primary1,
            isLoading: addLoading,
            onClick: () => handleAddPodCasts(),
        },

    ];
    const myTableHeaders = [
        { id: 'file', label: 'Thumbnail', sortable: false },
        { id: 'title', label: 'Podcasts Name', sortable: true },
        { id: 'momType', label: 'Mom Type', sortable: true },
        { id: 'music', label: 'Music', sortable: false },
        // { id: 'period', label: 'Period', sortable: true },
        { id: 'createdAt', label: 'Created Date', sortable: false },
        { id: 'status', label: 'Status', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search podcast name',
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
            name: 'momType',
            label: '',
            placeholder: 'Choose Mom type',
            inputType: 'autocomplete',
            options: MOM_TYPE,
            value: form.momType,
        },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        },
        // {
        //     name: 'month',
        //     label: '',
        //     placeholder: 'Choose month',
        //     inputType: 'autocomplete',
        //     options: months,
        //     value: form.month,
        // },
        // {
        //     name: 'week',
        //     label: '',
        //     placeholder: 'Choose week',
        //     inputType: 'autocomplete',
        //     options: weeks,
        //     value: form.week,
        // }
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchPodCasts(page + 1, rowsPerPage, { sortField, sortOrder });
    }, []);
    // useEffect(() => {
    //     const month = getMonths();
    //     setMonths(month);
    //     const week = getWeeks();
    //     setWeeks(week);
    // }, []);
    const fetchPodCasts = async (pageNum = 1, limit = 10, options = {}) => {
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
                momType:
                    options.momType === 'Preg Mom'
                        ? 'pregMom'
                        : options.momType === 'New Mom'
                            ? 'newMom'
                            : '',
                // week: options.week || '',
                // month: options.month || '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };

        try {
            const data = await apiRequest(apiRoutes.getPodCastsList, 'POST', payload, router);
            if (data?.response) {
                const updatedDocs = data?.data?.docs.map(doc => ({
                    ...doc,
                    createdAt: formattedDate(doc.createdAt)
                }));
                // const podcasts = data?.data?.docs;
                // .map((pd) => ({
                //     ...pd,
                //     period: pd.week
                //         ? `Week ${Number(pd.week)}`
                //         : pd.month
                //             ? `Month ${Number(pd.month)}`
                //             : '-',
                // }))
                setPodCasts(updatedDocs);
                setTotalDocs(data?.data?.totalDocs);
            }
        } catch (err) {
            console.error('Failed to fetch articles:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;
        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);
        fetchPodCasts(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
    };
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchPodCasts(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const payload = {
            id: updatedRow.id,
            status: updatedRow.status
        };
        const formData = objectToFormData(payload)
        try {
            const data = await apiRequest(apiRoutes.updatePodCasts, 'POST', formData, router);
            fetchPodCasts(page + 1, rowsPerPage, { ...form, sortField, sortOrder });
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false)
        setPage(0);
        // const selectedWeek = weeks.find(e => e.label === filterValues.week);
        // const weekId = selectedWeek?.value;
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            status: filterValues.status || '',
            momType: filterValues.momType || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
            // month: filterValues.month || '',
            // week: filterValues.week || '',
        }));
        fetchPodCasts(1, rowsPerPage, {
            sortField, sortOrder, ...filterValues,
            // week: weekId 
        });
    }
    const handleAddPodCasts = () => {
        setAddLoading(true);
        router.push('/podcasts/add');
    }
    const handleEdit = (row) => {
        router.push(`/podcasts/${row?.id}`)
    };
    const handleDelete = (row) => {
        setViewform(row)
        setIsDeleteDialogOpen(true)
    };
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        // { iconName: 'view-icon', disabled: false, onClick: handleView },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const handleDeleteCancel = () => {
        setIsDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);
        const payload = { params: { id: viewform.id } }
        const data = await apiRequest(apiRoutes.deletePodCasts, 'POST', payload, router);
        if (data.response) {
            fetchPodCasts(page + 1, rowsPerPage, {})
        }
    };
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <MaterialTable
                headers={myTableHeaders}
                data={podCasts}
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

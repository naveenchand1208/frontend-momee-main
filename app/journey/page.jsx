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
import { ACTIVE_STATUS, MOM_TYPE, TRIMESTER } from '@/common/constants/enum';
import { getMonths, getWeeks, formattedDate } from '@/common/utils/util';
import { Colors } from '@/common/constants/colorEnum';
import { months } from 'moment';
export default function Journey() {
    const router = useRouter();
    const fetchedRef = useRef();
    const [page, setPage] = useState(0);
    const [journeyList, setJourneyList] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [viewform, setViewform] = useState({});
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [weeks, setWeeks] = useState(false);
    const [months, setMonths] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('');
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        momType: '',
        dateRange: { fromDate: '', toDate: '' },
        week: '',
        trimesterId: '',
    });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Journey', href: '/journey' },
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
            //         fetchJourney(1, 10, updatedForm);
            //         return updatedForm;
            //     });
            // }
            onChange: (val) => {
                if (val === 'All') val = '';
                setStatusLabel(val);
                setPage(0);
                setForm((prev) => {
                    const updatedForm = { ...prev, status: val };
                    fetchJourney(1, rowsPerPage, updatedForm);
                    return updatedForm;
                });
            }

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
        { id: 'name', label: 'Journey Name', sortable: true },
        { id: 'momType', label: 'Mom Type', sortable: true },
        { id: 'createdAt', label: 'Created Date', sortable: false },
        { id: 'status', label: 'Status', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search journey name',
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
            name: 'momType',
            label: '',
            placeholder: 'Choose mom type',
            inputType: 'autocomplete',
            options: MOM_TYPE,
            value: form.momType,
        },
        {
            name: 'trimesterId',
            label: '',
            placeholder: 'Choose trimester',
            inputType: 'autocomplete',
            options: TRIMESTER,
            value: form.trimesterId,
        },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        },
        {
            name: 'week',
            label: '',
            placeholder: 'Choose week',
            inputType: 'autocomplete',
            options: weeks,
            value: form.week,
        },
        {
            name: 'month',
            label: '',
            placeholder: 'Choose month',
            inputType: 'autocomplete',
            options: months,
            value: form.month,
        },
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchJourney(page + 1, rowsPerPage, { sortField, sortOrder });
    }, [sortField, sortOrder]);
    useEffect(() => {
        const week = getWeeks();
        setWeeks(week);
        const month = getMonths();
        setMonths(month);
    }, []);
    const handleEdit = (row) => {
        router.push(`/journey/${row?.id}`)
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
        const data = await apiRequest(apiRoutes.deleteJourney, 'POST', payload, router);
        if (data.response) {
            fetchJourney(page + 1, rowsPerPage, {})
        }
    };
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const navigateToAddPage = () => {
        setAddLoading(true);
        router.push('/journey/add')
    }
    const fetchJourney = async (pageNum = 1, limit = 10, options = {}) => {
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
                trimesterId: options.trimesterId,
                momType:
                    options.momType === 'Preg Mom'
                        ? 'pregMom'
                        : options.momType === 'New Mom'
                            ? 'newMom'
                            : '', plan: options.plan || '',
                week: options.week || '',
                month: options.month || '',
                subscribed:
                    options.subscribed === 'Subscribed'
                        ? 'true'
                        : options.subscribed === 'Not Subscribed'
                            ? 'false'
                            : '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getJourneyList, 'POST', payload, router);
            if (data.response) {
                const journey = data?.data?.docs.map((js) => ({
                    ...js,
                    period: js.week
                        ? `${(js.week)}`
                        : js.month
                            ? `Month ${Number(js.month)}`
                            : '-',
                    createdAt: formattedDate(js.createdAt),
                }))
                setJourneyList(journey || []);
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
        fetchJourney(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchJourney(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('id', updatedRow.id);
        formData.append('status', updatedRow.status);
        try {
            const data = await apiRequest(apiRoutes.updateJourney, 'POST', formData, router);
            fetchJourney(page + 1, rowsPerPage, { ...form, sortField, sortOrder });
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    // const handleFilterSubmit = (filterValues) => {
    //     setFilterOpen(false)
    //     setPage(0);
    //     const trimesterId = TRIMESTER.find(
    //         item => item.label === filterValues.trimesterId
    //     )?.id;

    //     filterValues.trimesterId = trimesterId;
    //     setForm(prev => ({
    //         ...prev,
    //         searchKey: filterValues.searchKey || '',
    //         status: filterValues.status || '',
    //         momType: filterValues.momType || '',
    //         trimesterId: trimesterId || '',
    //         dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
    //         week: filterValues.week || '',
    //         month: filterValues.month || '',
    //     }));
    //     fetchJourney(page, rowsPerPage, { sortField, sortOrder, ...filterValues },);
    // }

    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false);

        const trimesterId = TRIMESTER.find(
            item => item.label === filterValues.trimesterId
        )?.id;

        filterValues.trimesterId = trimesterId;

        const newForm = {
            ...form,
            searchKey: filterValues.searchKey || '',
            status: filterValues.status || '',
            momType: filterValues.momType || '',
            trimesterId: trimesterId || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
            week: filterValues.week || '',
            month: filterValues.month || '',
        };

        // Update form state
        setForm(newForm);

        // Reset page to 0 and fetch data for page 1
        setPage(0);
        fetchJourney(1, rowsPerPage, { sortField, sortOrder, ...newForm });
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <MaterialTable
                headers={myTableHeaders}
                data={journeyList}
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

'use client';
import './page.css';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import CommonFilter from '@/components/shared/common-filter/page';
import CustomDialog from '@/components/shared/dialog/dialog';
import DashboardCard from '@/components/shared/dashboard-card/page';
import SkeletonCard from '@/components/loader/skeleton-dashboard-card/page';
import CustomCalendarInput from '@/components/shared/date-range/page';
import { Colors } from '@/common/constants/colorEnum';
import Button from '@/components/shared/button/page';
import { formatDate } from '@/common/utils/util';
export default function NewMom() {
    const [logList, setLogList] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [filterOpen, setFilterOpen] = useState(false);
    const router = useRouter();
    const fetchedRef = useRef(false);
    const [form, setForm] = useState({
        // searchKey: '',
        // user: '',
        dateRange: { fromDate: '', toDate: '' },
    });
    const logListHeaders = [
        { id: 'title', label: 'Title', sortable: true },
        { id: 'message', label: 'Message', sortable: true },
        { id: 'counts', label: 'Counts', sortable: true },
        { id: 'createdAt', label: 'CreatedAt', sortable: true },
    ];
    const breadcrumbItems = [
        { label: 'Reports' },
        { label: 'Notification Logs', href: '/notification-logs' },
    ];
    const breadcrumbAction = [
        {
            iconPath: '/assets/icons/outlined-filter-icon.svg',
            type: 'textIcon',
            label: 'Filter',
            onClick: () => setFilterOpen(true),
        },
    ];
    const inputFields = [
        // {
        //     name: 'searchKey',
        //     placeholder: 'search Plan Name',
        //     inputType: 'text',
        //     value: form.searchKey,
        // },
        // {
        //     name: 'user',
        //     label: '',
        //     placeholder: 'Choose user',
        //     inputType: 'autocomplete',
        //     options: userOptions,
        //     value: form.user,
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
        if (!fetchedRef.current) {
            fetchedRef.current = true;
            fetchNotificationLogs(1, rowsPerPage, { sortField, sortOrder });
        }
    }, []);
    const fetchNotificationLogs = async (pageNum = 1, limit = 10, options = {}) => {
        setIsLoading(true);
        const { fromDate, toDate } = form.dateRange;
        const payload = {
            params: {
                sortField: options.sortField || 'createdAt',
                sortOrder: options.sortOrder || 'desc',
                pagination: 'true',
                page: pageNum,
                limit: limit,
                searchKey: options.searchKey || '',
                fromDate: options?.date?.fromDate || '',
                toDate: options?.date?.toDate || '',
                fromDate: options?.dateRange?.fromDate || '',
                toDate: options?.dateRange?.toDate || '',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getNotificationLogs, 'POST', payload, router);
            if (data?.response) {
                const logList = data?.data?.docs.map((plan) => ({
                    ...plan,
                    createdAt: formatDate(plan.createdAt, "DD-MM-YYYY HH:mm" || "")
                }));
                setLogList(logList || []);
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
        fetchNotificationLogs(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchNotificationLogs(finalPage + 1, finalRowsPerPage, { sortField, sortOrder });
    };
    const handleFilterSubmit = async (filterValues) => {
        setFilterOpen(false);
        // console.log('filterValues', filterValues)
        // const selectedUser = userOptions.find(user => user.label === filterValues.user);
        // const id = selectedUser?.value || '';
         setForm(prev => ({
            ...prev,
            // searchKey: filterValues.searchKey || '',
            // user: filterValues.user || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
        }));
        // filterValues.user = id
        await fetchNotificationLogs(page, rowsPerPage, { sortField, sortOrder, ...filterValues, });
    };
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <MaterialTable
                headers={logListHeaders}
                data={logList}
                actionConfig={[]}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalDocs}
                isLoading={isLoading}
                sortConfig={{ [sortField]: sortOrder }}
                onSortChange={handleSortChange}
                onTableChange={handleTableChange}
            />
            {filterOpen && (
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
            )}
        </div>
    );
}

'use client';
import './page.css';
import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { formatDate, objectToFormData } from '@/common/utils/util';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import Tabs from '@/components/shared/custom-tab/page';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import Button from '@/components/shared/button/page';
import DatePicker from '@/components/shared/date/page';
import { Colors } from '@/common/constants/colorEnum';
import { showError, showSuccess } from '@/common/toast/toastService';
import { useSelector } from 'react-redux';
import DashboardCard from '@/components/shared/dashboard-card/page';
import SkeletonCard from '@/components/loader/skeleton-dashboard-card/page';
export default function User_Diet_Plan() {
    const router = useRouter();
    const fetchedRef = useRef(false);
    const hasFetchedUsers = useRef(false);
    const [selectedTab, setSelectedTab] = useState('Active Plan');
    const { viewMomDetails } = useSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(true);
    const [userPlanList, setUserPlanList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [totalDocs, setTotalDocs] = useState(0);
    const [query, setQuery] = useState('currentPlan');
    const [filterOpen, setFilterOpen] = useState(false);
    const [activePlanOpen, setActivePlanOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [planAmounts, setPlanAmounts] = useState({});
    const [form, setForm] = useState({
        searchKey: '',
        user: '',
        dateRange: { fromDate: '', toDate: '' },
    });
    const breadcrumbItems = [
        { label: 'Reports' },
        { label: 'User Diet Plans', href: '/user-dietplan' }
    ];
    const breadcrumbAction = [
        // {
        //     iconPath: '/assets/icons/new-icon.svg',
        //     label: 'Add',
        //     type: 'button',
        //     size: 'extraSmall',
        //     color: '#fff',
        //     backgroundColor: Colors.Primary1,
        //     isLoading: addLoading,
        //     onClick: () => handleAddFoodTemplate(),
        // }
        {
            iconPath: '/assets/icons/outlined-filter-icon.svg',
            type: 'textIcon',
            label: 'Filter',
            onClick: () => setFilterOpen(true),
        },
    ];
    const cards = [
        {
            title: "Total Amount",
            count: planAmounts?.totalPlanAmount || 0,
            prefix: ' ₹',
            iconPath: '/assets/icons/growth-icon.svg'
        },
        // {
        //     title: "Monthly",
        //     count: planAmounts?.totalLast30Days || 0,
        //     prefix: '₹',
        //     iconPath: '/assets/icons/growth-icon.svg'
        // },
    ]
    const handleActivate = (row) => {
        setActivePlanOpen(true)
        setSelectedPlan(row)
    };
    const handleUserView = (row) => {
        const viewMom = viewMomDetails.viewMomDetails;
        const momType = viewMom?.momType;
        let routePrefix = '';
        if (momType === 'newMom') {
            routePrefix = '/new-mom';
        } else if (momType === 'pregMom') {
            routePrefix = '/preg-mom';
        } else {
            console.error('Unsupported momType:', momType);
            return;
        }
        router.push(`${routePrefix}/${row?.userId}`);
    };

    const actionConfig = [
        { iconName: 'activate-icon', disabled: false, onClick: handleActivate, tooltip: 'Activate Plan' },
        { iconName: 'user-view-icon', disabled: false, onClick: handleUserView, tooltip: 'View User Profile' },
    ];
    const filteredActions = query === 'futurePlan'
        ? actionConfig
        : actionConfig.filter(action => action.iconName !== 'activate-icon');
    const myTableHeaders = [
        { id: 'userName', label: 'User', sortable: false },
        { id: 'planName', label: 'Plan', sortable: true },
        { id: 'planAmount', label: 'Plan Amount', sortable: true },
        // { id: 'validaityStartDate', label: 'Validity Start Date', sortable: true },
        // { id: 'validaityEndDate', label: 'Validity End Date', sortable: true },
        { id: 'createdAt', label: 'Created Date', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    let tabs = [
        {
            tabName: 'Active Plan',
            value: 'activePlan',
            onClick: () => tabHandle('Active Plan'),
        },
        {
            tabName: 'Upcoming Plan',
            value: 'upcomingPlan',
            onClick: () => tabHandle('Upcoming Plan'),
        },
        {
            tabName: 'Expired Plan',
            value: 'expiredPlan',
            onClick: () => tabHandle('Expired Plan'),
        },
    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search Plan Name',
            inputType: 'text',
            value: form.searchKey,
        },
        {
            name: 'user',
            label: '',
            placeholder: 'Choose user',
            inputType: 'autocomplete',
            options: userOptions,
            value: form.user,
        },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        },
        // {
        //     name: 'category',
        //     label: '',
        //     placeholder: 'Choose category',
        //     inputType: 'autocomplete',
        //     options: categoryOptions,
        //     value: form.category,
        // },
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchUserPlans(page + 1, rowsPerPage, { sortField, sortOrder });
    }, [sortField, sortOrder]);
    useEffect(() => {
        return () => {
            if (form.previewUrl) {
                URL.revokeObjectURL(form.previewUrl);
            }
        };
    }, [form.previewUrl]);
    useEffect(() => {
        if (!hasFetchedUsers.current) {
            hasFetchedUsers.current = true;
            const fetchUserOptions = async () => {
                try {
                    const payload = { params: { pagination: 'false' } };
                    const data = await apiRequest(apiRoutes.userList, 'POST', payload, router);
                    if (data?.response) {
                        const users = data.data.docs.map((user) => ({
                            label: user.userName,
                            value: user.id,
                        }));
                        setUserOptions(users);
                        console.log(users);
                    }
                } catch (error) {
                    console.error('Failed to fetch user options:', error);
                }
            };
            fetchUserOptions();
        }
    }, []);
    const fetchUserPlans = async (pageNum = 1, limit = 10, options = {}, newQuery = 'currentPlan') => {
        setIsLoading(true);
        console.log('form', form)
        const { fromDate, toDate } = form.dateRange;
        const payload = {
            params: {
                sortField: options.sortField || '',
                sortOrder: options.sortOrder || 'asc',
                pagination: 'true',
                page: pageNum,
                limit: limit,
                planQuery: newQuery,
                userId: options.user || '',
                searchKey: options.searchKey || '',
                fromDate: options?.date?.fromDate || fromDate || '',
                toDate: options?.date?.toDate || toDate || '',
                // fromDate: formatDate(options.dateRange?.fromDate) || '',
                // toDate: formatDate(options.dateRange?.toDate) || '',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.userDietPlanlist, 'POST', payload, router);
            if (data.response) {
                const responseData = data?.data?.data;
                const formattedList = (responseData?.docs || []).map(item => ({
                    ...item,
                    userName: item.user?.userName || '-',
                    // planName: item.subscribedPlan?.planName || item.planName || '-',
                    // planAmount: item.subscribedPlan?.planAmount || item.planAmount || '-',
                    createdAt: formatDate(item.createdAt, 'DD MMM YYYY'),

                }));
                setUserPlanList(formattedList);
                setTotalDocs(responseData?.totalDocs || 0);
                console.log('docs', responseData.totalDocs)
                setPlanAmounts(data?.data?.planAmounts)
            }

        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;
        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);
        fetchUserPlans(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder }, query);
    };
    // const handleTableChange = ({ newPage, newRowsPerPage }) => {
    //     console.log('Page change:', newPage, 'Rows per page change:', newRowsPerPage);
    //     const finalPage = newPage !== undefined ? newPage : page;
    //     const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;
    //     if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
    //     if (newPage !== undefined) setPage(newPage + 1);
    //     fetchUserPlans
    //         (finalPage, finalRowsPerPage, { sortField, sortOrder }, query);
    // };
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchUserPlans(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const formData = objectToFormData(updatedRow)
        try {
            const data = await apiRequest(apiRoutes.activateUserPlan, 'POST', formData, router);
            fetchUserPlans()
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const tabHandle = async (tabName) => {
        setSelectedTab(tabName);
        let newQuery = '';
        if (tabName === 'Active Plan') newQuery = 'currentPlan';
        else if (tabName === 'Upcoming Plan') newQuery = 'futurePlan';
        else if (tabName === 'Expired Plan') newQuery = 'expiredPlan';

        setQuery(newQuery);
        await fetchUserPlans(page, rowsPerPage, {}, newQuery)
    };
    const handleFilterSubmit = async (filterValues) => {
        setFilterOpen(false);
        const selectedUser = userOptions.find(user => user.label === filterValues.user);
        const id = selectedUser?.value || '';
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            user: filterValues.user || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
        }));
        filterValues.user = id
        await fetchUserPlans(page, rowsPerPage, { sortField, sortOrder, ...filterValues, }, query);
        // await fetchUserPlans(page, rowsPerPage, { user: id, searchKey: filterValues.searchKey || '' }, query)
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <div className='d-flex justify-content-between w-100'>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '10px', width: '50%' }}>
                    {isLoading
                        ? Array.from({ length: 1 }).map((_, idx) => <SkeletonCard key={idx} />)
                        : cards.map((card, idx) => <DashboardCard key={idx} {...card} />
                        )}
                </div>
            </div>
            <Tabs tabs={tabs} initialActive={0} />
            <MaterialTable
                headers={myTableHeaders}
                actionConfig={filteredActions}
                data={userPlanList}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalDocs}
                isLoading={isLoading}
                sortConfig={{ [sortField]: sortOrder }}
                onSortChange={handleSortChange}
                onToggleStatus={handleToggleStatus}
                onTableChange={handleTableChange}
            />
            {activePlanOpen && (
                <CustomDialog
                    open={activePlanOpen}
                    onClose={() => setActivePlanOpen(false)}
                    title={`Activate User Plan: ${selectedPlan.planName}`}
                    titleColor="#000000"
                    backgroundColor="#fafcfc"
                    content={
                        <ActivatePlan
                            plan={selectedPlan}
                            onActivated={async () => {
                                setActivePlanOpen(false);
                                await fetchUserPlans(page, rowsPerPage, {}, query)
                            }}
                        />
                    }
                    actions={<button onClick={() => setActivePlanOpen(false)}>Close</button>}
                    maxWidth="xs"
                    position="top-left"
                />
            )}
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

    )
}


const ActivatePlan = ({ plan, onActivated }) => {
    const router = useRouter();
    const [activated, setActivated] = useState(false);
    const [form, setForm] = useState({
        startDate: "",
        planId: plan.subscriptionId || '',
        userId: plan.userId || '',
    });
    useEffect(() => {
        setForm(prev => ({
            ...prev,
            // date: formatDate(new Date(), 'YYYY-MM-DD'),
            planId: plan.subscriptionId || '',
            userId: plan.userId || '',
        }));
    }, []);
    const handleActivatePlan = async (e) => {
        e.preventDefault();
        if (form.startDate !== "" && !!form.planId && !!form.userId) {
            console.log('form', form)
            const payload = {
                params: {
                    ...form
                }
            }
            try {
                const data = await apiRequest(apiRoutes.activateUserPlan, 'POST', payload, router);
                if (data.response) {
                    console.log('response', data)
                    showSuccess(data.message)
                    setActivated(true)
                    onActivated?.(true);
                    // const responseData = data?.data?.data;
                }
            } catch (error) {
                console.error('Failed to fetch templates:', error);
            }
            // finally {
            //     setIsLoading(false);
            // }
        } else {
            showError("Please Select Date")
        }
    }
    return (
        <>
            <div className="w-[300px]">
                <DatePicker
                    value={form.startDate}
                    futureOnly={true} // <- this activates future-only behavior
                    onChange={(val) =>
                        setForm((prev) => ({ ...prev, startDate: val }))
                    }
                />
            </div>
            <div className="d-flex justify-content-end align-items-center mt-2">
                <Button
                    label="Activate"
                    type="button"
                    color="#fff"
                    size="small"
                    backgroundColor={Colors.Primary}
                    onClick={handleActivatePlan}
                />
            </div>
        </>
    )
}
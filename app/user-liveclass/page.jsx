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
export default function NewMom() {
    const [planList, setPlanList] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isLoading, setIsLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [planAmounts, setPlanAmounts] = useState({});
    const [customDateRange, setCustomDateRange] = useState({ fromDate: '', toDate: '' });
    const [buttonLoading, setButtonLoading] = useState(false);
    const [form, setForm] = useState({
        searchKey: '',
    });
    const router = useRouter();
    const fetchedRef = useRef(false);
    const planListHeaders = [
        { id: 'userName', label: 'User', sortable: true },
        { id: 'name', label: 'Plan Name', sortable: true },
        { id: 'amount', label: 'Plan Amount', sortable: true },
        // { id: 'validityEndDate', label: 'Expiry Date', sortable: true },
    ];
    const breadcrumbItems = [
        { label: 'Reports' },
        { label: 'User Live Class', href: '/user-liveclass' },
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
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search keyword',
            inputType: 'text',
            value: form.searchKey,
        },
    ];
    useEffect(() => {
        if (!fetchedRef.current) {
            fetchedRef.current = true;
            fetchUserPlans(1, rowsPerPage, { sortField, sortOrder });
        }
    }, []);
    const fetchUserPlans = async (pageNum = 1, limit = 10, options = {}) => {
        setIsLoading(true);
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
            },
        };
        try {
            const data = await apiRequest(apiRoutes.userLiveClassPlanlist, 'POST', payload, router);
            if (data?.response) {
                const planList = data?.data?.data?.docs.map((plan) => ({
                    ...plan,
                    userName: plan?.user?.userName || null,
                    // validityEndDate: plan?.validityEndDate || '-'
                }));
                setPlanList(planList || []);
                setTotalDocs(data?.data?.data?.totalDocs);
                setPlanAmounts(data?.data?.planAmounts)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
            setButtonLoading(false);
        }
    };
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchUserPlans(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchUserPlans(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder, date: customDateRange });
    };
    const handleDateChange = ({ fromDate, toDate }) => {
        const updated = { fromDate, toDate };
        setCustomDateRange(updated);
        // onChange?.({ type: 'Custom', ...updated });
    };
    const handleSubmitFilter = () => {
        setButtonLoading(true);
        fetchUserPlans(1, rowsPerPage, { sortField, sortOrder, date: customDateRange });
    }
    const handleRemoveFilter = () => {
        const updated = { fromDate: "", toDate: "" };
        setCustomDateRange(updated);
    }
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
            />
            <div className='d-flex justify-content-between w-100'>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '10px', width: '50%' }}>
                    {isLoading
                        ? Array.from({ length: 1 }).map((_, idx) => <SkeletonCard key={idx} />)
                        : cards.map((card, idx) => <DashboardCard key={idx} {...card} />
                        )}
                </div>
                <div className="d-flex justify-content-between align-items-center gap-3">
                    <div>
                        <CustomCalendarInput value={customDateRange} onChange={handleDateChange} />
                    </div>
                    <div className="d-flex justify-content-between align-items-center gap-1" style={{ marginTop: '15px' }}>
                        <Button
                            iconPath="/assets/icons/search-icon.svg"
                            label=""
                            type="submit"
                            size="small"
                            color="#fff"
                            backgroundColor={Colors.grey}
                            isLoading={buttonLoading}
                            onClick={handleSubmitFilter}
                        />
                        <Button
                            iconPath="/assets/icons/wrong-icon.svg"
                            label=""
                            type="submit"
                            size="small"
                            color="#fff"
                            backgroundColor={Colors.grey}
                            isLoading={buttonLoading}
                            onClick={handleRemoveFilter}
                        />
                    </div>
                </div>
            </div>
            <MaterialTable
                headers={planListHeaders}
                data={planList}
                actionConfig={[]}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalDocs}
                isLoading={isLoading}
                sortConfig={{ [sortField]: sortOrder }}
                onSortChange={handleSortChange}
                onTableChange={handleTableChange}
            />
        </div>
    );
}

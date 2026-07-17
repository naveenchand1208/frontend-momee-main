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
export default function NewMom() {
    const [communityList, setCommunityList] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isLoading, setIsLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [form, setForm] = useState({
        searchKey: '',
    });
    const router = useRouter();
    const fetchedRef = useRef(false);
    const communityListHeaders = [
        { id: 'searchKey', label: 'Search Keywords', sortable: true },
        { id: 'searchCount', label: 'Views', sortable: true },
    ];
    const breadcrumbItems = [
        { label: 'Keywords' },
        { label: 'Community Search Keywords', href: '/community/keywords' },
    ];
    const breadcrumbAction = [
        {
            iconPath: '/assets/icons/outlined-filter-icon.svg',
            type: 'textIcon',
            label: 'Filter',
            onClick: () => setFilterOpen(true),
        },
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
            fetchCommunityKeywords(1, rowsPerPage, { sortField, sortOrder });
        }
    }, []);
    const fetchCommunityKeywords = async (pageNum = 1, limit = 10, options = {}) => {
        setIsLoading(true);
        const payload = {
            params: {
                sortField: options.sortField || 'createdAt',
                sortOrder: options.sortOrder || 'desc',
                pagination: 'true',
                page: pageNum,
                limit: limit,
                searchKey: options.searchKey || '',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.communitySearchlist, 'POST', payload, router);
            if (data?.response) {
                const communityList = data?.data?.docs;
                setCommunityList(communityList || []);
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
        fetchCommunityKeywords(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchCommunityKeywords(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
    };
    // const handleFilterSubmit = (filterValues) => {
    //     setFilterOpen(false)
    //     setForm(prev => ({
    //         ...prev,
    //         searchKey: filterValues.searchKey || '',
    //     }));
    //     fetchCommunityKeywords(page + 1, rowsPerPage, { sortField, sortOrder, ...filterValues },);
    // }
    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false);
        const newPage = 0; // table uses 0-based page index
        setPage(newPage);
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
        }));
        fetchCommunityKeywords(newPage + 1, rowsPerPage, { sortField, sortOrder, ...filterValues });
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <MaterialTable
                headers={communityListHeaders}
                data={communityList}
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

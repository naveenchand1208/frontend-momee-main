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
export default function Hospitals() {
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
    const [typeLoading, setTypeLoading] = useState(false);
    const [deptLoading, setDeptLoading] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('');
    const [hospitalTypes, setHospitalTypes] = useState([]);
    const [hospitalDepartments, setHospitalDepartments] = useState([]);
    const isDownloadingRef = useRef(false);
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        typeId: '',
        departmentId: '',
        dateRange: { fromDate: '', toDate: '' },
    });
    const breadcrumbItems = [
        { label: 'Hospitals', href: '/hospitals' },
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
        {
            iconPath: '/assets/icons/download-icon.svg',
            type: 'textIcon',
            label: 'Export',
            onClick: () => downloadExcel(),
        },
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
            //         fetchHospitals(1, 10, updatedForm);
            //         return updatedForm;
            //     });
            // }
            onChange: (val) => {
                if (val === 'All') val = '';
                setStatusLabel(val);

                setPage(0); // ✅ reset to first page

                setForm((prev) => {
                    const updatedForm = { ...prev, status: val };
                    fetchHospitals(1, rowsPerPage, updatedForm); // ✅ use rowsPerPage
                    return updatedForm;
                });
            }

        },
        {
            label: 'Type',
            type: 'textIcon',
            isLoading: typeLoading,
            onClick: () => navigateToTypePage(),
        },
        {
            label: 'Departments',
            type: 'textIcon',
            isLoading: deptLoading,
            onClick: () => navigateToDepartmentPage(),
        },
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
        { id: 'name', label: 'Name', sortable: true },
        { id: 'mobile', label: 'Mobile', sortable: false },
        { id: 'typeNames', label: 'Type', sortable: false },
        { id: 'departmentNames', label: 'Departments', sortable: false },
        { id: 'createdAt', label: 'Created Date', sortable: false },
        { id: 'status', label: 'Active Status', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search name or email',
            inputType: 'text',
            value: '',
        },
        {
            name: 'typeId',
            placeholder: 'Choose Hospital Type',
            inputType: 'autocomplete',
            options: hospitalTypes,
            value: '',
        },
        {
            name: 'departmentId',
            placeholder: 'Choose Department',
            inputType: 'autocomplete',
            options: hospitalDepartments,
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
    // useEffect(() => {
    //     fetchHospitalTypes();
    //     fetchHospitalDepartments();
    // }, []);

    // useEffect(() => {
    //     if (fetchedRef.current) return;
    //     fetchedRef.current = true;
    //     fetchHospitals(page + 1, rowsPerPage, { sortField, sortOrder });
    // }, [sortField, sortOrder]);
    // First load types + departments only
    useEffect(() => {
        if (!fetchedRef.current) {
            fetchedRef.current = true;
            fetchHospitalTypes();
            fetchHospitalDepartments();
        }
    }, []);

    // Fetch hospitals only AFTER types & departments are loaded
    useEffect(() => {
        if (hospitalTypes.length > 0 && hospitalDepartments.length > 0) {
            fetchHospitals(page + 1, rowsPerPage, { sortField, sortOrder });
        }
    }, [hospitalTypes, hospitalDepartments]);

    //   const [form, setForm] = useState({
    //     searchKey: '',
    //   });
    // const handleView = (row) => {
    //     console.log('Parent received VIEW action:', row);
    // };
    const handleEdit = (row) => {
        console.log('Parent received EDIT action:', row);
        router.push(`/hospitals/${row.id}`)
    };
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        // { iconName: 'view-icon', disabled: false, onClick: handleView },
        // { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const navigateToAddPage = () => {
        setAddLoading(true);
        router.push('/hospitals/add')
    }
    const navigateToTypePage = () => {
        setTypeLoading(true);
        router.push('/hospitals/manage-type')
    }
    const navigateToDepartmentPage = () => {
        setDeptLoading(true);
        router.push('/hospitals/manage-department')
    }
    const buildFinalFilters = () => {
        return resolveFilterIds(form);
    };

    const resolveFilterIds = (filters) => {
        const resolved = { ...filters };

        if (resolved.typeId) {
            const matchedType = hospitalTypes.find(t => t.label === resolved.typeId);
            resolved.typeId = matchedType?.value || '';
        }

        if (resolved.departmentId) {
            const matchedDept = hospitalDepartments.find(d => d.label === resolved.departmentId);
            resolved.departmentId = matchedDept?.value || '';
        }

        return resolved;
    };
    const fetchHospitalTypes = async () => {
        setTypeLoading(true);
        try {
            const data = await apiRequest(apiRoutes.getHospitalTypeList, 'POST', { params: {} }, router);
            if (data?.response) {
                const list = data?.data?.docs?.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setHospitalTypes(list);
            }
        } catch (err) {
            console.error("Failed to fetch types", err);
        } finally {
            setTypeLoading(false);
        }
    };

    const fetchHospitalDepartments = async () => {
        setDeptLoading(true);
        try {
            const data = await apiRequest(apiRoutes.getHospitalDeptList, 'POST', { params: {} }, router);
            if (data?.response) {
                const list = data?.data?.docs?.map(item => ({
                    label: item.title,
                    value: item.id
                }));
                setHospitalDepartments(list);
            }
        } catch (err) {
            console.error("Failed to fetch departments", err);
        } finally {
            setDeptLoading(false);
        }
    };

    const fetchHospitals = async (pageNum, limit, options = {}) => {
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
                typeId: options.typeId || '',
                departmentId: options.departmentId || '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getHospitalList, 'POST', payload, router);
            if (data?.response) {
                const updatedDocs = data?.data?.docs.map(doc => ({
                    ...doc,
                    createdAt: formattedDate(doc.createdAt),
                    departmentNames: doc.departments?.map(d => d.title).join(', '),
                    typeNames: doc.typeIds
                        ?.map(tId => {
                            const typeObj = hospitalTypes.find(t => t.value === tId);
                            return typeObj ? typeObj.label : tId; // fallback to ID if not found
                        })
                        .filter(Boolean)
                        .join(', ')

                }));
                setHospitalList(updatedDocs || []);
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
        fetchHospitals(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;
        const resolvedFilters = buildFinalFilters();

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchHospitals(finalPage + 1, finalRowsPerPage, { ...resolvedFilters, sortField, sortOrder });
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
            fetchHospitals(page + 1, rowsPerPage, { ...form, sortField, sortOrder });
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
        setPage(0);
        const resolvedValues = resolveFilterIds(filterValues);

        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            typeId: filterValues.typeId || '',
            departmentId: filterValues.departmentId || '',
            // status: filterValues.status || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },

        }));
        fetchHospitals(1, rowsPerPage, { sortField, sortOrder, ...resolvedValues },);
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

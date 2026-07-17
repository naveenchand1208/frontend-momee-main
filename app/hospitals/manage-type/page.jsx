'use client';
import './page.css';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Button from '@/components/shared/button/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import Input from '@/components/shared/input/page';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { objectToFormData } from '@/common/utils/util';
import { showSuccess } from '@/common/toast/toastService';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { Colors } from '@/common/constants/colorEnum';
export default function Manage_Type() {
    const initialFormState = {
        name: '',
        status: 'Active',
    };
    const router = useRouter();
    const fetchedRef = useRef(false);
    const formRef = useRef(null);
    const [id, setId] = useState(null);
    const [form, setForm] = useState(initialFormState);
    const [viewform, setViewform] = useState({});
    const [previewUrl, setPreviewUrl] = useState('');
    const [typeList, setTypeList] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [backLoading, setBackLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalDocs, setTotalDocs] = useState(0);
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('Active/Inactive');
    const [disableLoadingForEdit, setDisableLoadingForEdit] = useState(false);
    const [filterForm, setFilterForm] = useState({
        searchKey: '',
        status: '',
        dateRange: { fromDate: '', toDate: '' },
    });
    const breadcrumbItems = [
        { label: 'Hospitals', href: '/hospitals' },
        { label: 'Type', href: '/hospitals/manage-type' }
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
            onChange: (val) => {
                if (val === 'All') {
                    setForm((prev) => ({ ...prev, status: '' }));
                    const filters = { ...form };
                    delete filters.status;
                    fetchType(1, 10, filters);
                    setStatusLabel('Active/Inactive');
                } else {
                    setForm((prev) => ({ ...prev, status: val }));
                    fetchType(1, 10, { ...form, status: val });
                    setStatusLabel(val);
                }
            },
        },
        {
            label: 'Back',
            type: 'button',
            size: 'extraSmall',
            color: '#fff',
            backgroundColor: Colors.Primary1,
            isLoading: backLoading,
            onClick: () => manageType(),
        },
    ]
    const myTableHeaders = [
        { id: 'name', label: 'Type Name', sortable: true },
        { id: 'createdAt', label: 'Created Date', sortable: false },
        { id: 'status', label: 'Status', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search category name',
            inputType: 'text',
            value: filterForm.searchKey,
        },
        // {
        //     name: 'status',
        //     label: '',
        //     placeholder: 'Choose Status',
        //     inputType: 'autocomplete',
        //     options: ACTIVE_STATUS,
        //     value: filterForm.status,
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
        fetchType(page + 1, rowsPerPage, { sortField, sortOrder });
    }, [sortField, sortOrder]);
    useEffect(() => {
        return () => {
            if (form.previewUrl) {
                URL.revokeObjectURL(form.previewUrl);
            }
        };
    }, [form.previewUrl]);
    const fetchType = async (pageNum = 1, limit = 5, options = {}) => {
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
                searchKey: options.searchKey || '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getHospitalTypeList, 'POST', payload, router);
            if (data.response) {
                const updatedDocs = data?.data?.docs.map(doc => ({
                    ...doc,
                    createdAt: formatDate(doc.createdAt)
                }));
                setTypeList(updatedDocs);
                setTotalDocs(data?.data?.totalDocs);
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchType(finalPage + 1, finalRowsPerPage, { sortField, sortOrder, ...filterForm });
    };
    const handleEdit = (row) => {
        setDisableLoadingForEdit(true);
        console.log('row', row)
        setViewform(row)
        setForm({
            name: row.name,
            status: row.status,
        })
        setId(row.id)
        setIsEdit(true)
    };
    const handleDelete = (row) => {
        console.log('Parent received DELETE action:', row);
        setViewform(row)
        setIsDeleteDialogOpen(true)
    };
    const handleDeleteCancel = () => {
        setIsDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);
        const payload = { params: { id: viewform.id } }
        const data = await apiRequest(apiRoutes.deleteHospitalType, 'POST', payload, router);
        if (data.response) {
            fetchType(page + 1, rowsPerPage, {})
        }
    };
    const manageType = () => {
        setBackLoading(true);
        router.push('/hospitals')
    }
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        // { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const handleClear = () => {
        setForm(initialFormState);
        setFormSubmitted(false);
        setIsEdit(false);
        setId(null);
        setViewform({});
        setPreviewUrl('');
        if (formRef.current) {
            formRef.current.reset();
        }
    };
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchType(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const payload = {
            params: {
                id: updatedRow.id,
                status: updatedRow.status
            }
        };
        try {
            const data = await apiRequest(apiRoutes.updateHospitalType, 'POST', payload, router);
            fetchType(page + 1, rowsPerPage, { sortField, sortOrder, ...filterForm });
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleFilterSubmit = (filterValues) => {
        const updatedFilter = {
            searchKey: filterValues.searchKey || '',
            status: filterValues.status || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
        };

        setFilterForm(updatedFilter);
        setPage(0); // reset to first page
        setFilterOpen(false);

        // always fetch from first page when applying filters
        fetchType(1, rowsPerPage, { sortField, sortOrder, ...updatedFilter });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        if (!form.name) {
            // showError('Invalid Form');
            setButtonLoading(false);
            return;
        }
        let updateForm = {
            ...form,
        };
        if (isEdit) {
            updateForm = {
                ...viewform,
                ...form,
            };
        }
        console.log('updateForm', updateForm)

        const payload = { params: updateForm };
        manageSubscription(payload);

    };
    const manageSubscription = async (payload) => {
        const action = !isEdit
            ? apiRoutes.addHospitalType
            : apiRoutes.updateHospitalType;

        try {
            const data = await apiRequest(action, 'POST', payload, router);
            if (data?.response) {
                const message = isEdit ? 'Type updated successfully!' : 'Type added successfully!';
                showSuccess(message);
                setForm(initialFormState);
                formRef.current.reset();
                setFormSubmitted(false);
                setButtonLoading(false);
                fetchType(page + 1, rowsPerPage, {});
            } else {
                setFormSubmitted(false);
                setButtonLoading(false);
            }
        } catch (error) {
            console.error('error', error);
        }
    };
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <div className="row">
                <div className="col-md-12 col-lg-8">
                    <MaterialTable
                        headers={myTableHeaders}
                        data={typeList}
                        actionConfig={actionConfig}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalCount={totalDocs}
                        isLoading={isLoading}
                        disableLoading={disableLoadingForEdit}
                        sortConfig={{ [sortField]: sortOrder }}
                        onSortChange={handleSortChange}
                        onToggleStatus={handleToggleStatus}
                        onTableChange={handleTableChange}
                    />
                </div>
                <div
                    className="col-4 bg-white p-3"
                    style={{ height: 'max-content', borderRadius: '5px' }}
                >
                    <h5>Create Type</h5><hr />
                    <form ref={formRef} onSubmit={handleSubmit} >
                        <div className="row">
                            <div className="col-md-12 mb-1">
                                <div className="">
                                    <Input
                                        placeholder=""
                                        name="name"
                                        label="Name"
                                        value={form.name}
                                        required={true}
                                        formSubmitted={formSubmitted}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='d-flex justify-content-end' style={{ marginLeft: '3%', gap: '5px' }}>
                            <Button
                                label="Clear"
                                type="button"
                                color="#fff"
                                backgroundColor={Colors.Primary1}
                                size='small'
                                onClick={handleClear}
                            />
                            <Button
                                label={isEdit ? "Update" : "Save"}
                                type="submit"
                                color="#fff"
                                backgroundColor={Colors.Primary2}
                                size='small'
                                isLoading={buttonLoading}
                            />
                        </div>
                    </form>
                </div>

            </div>
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
                                initialValues={filterForm}
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
    )
}



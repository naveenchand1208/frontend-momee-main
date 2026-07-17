'use client';
import './page.css';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Button from '@/components/shared/button/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import Input from '@/components/shared/input/page';
import FileUpload from '@/components/shared/file/page';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { objectToFormData } from '@/common/utils/util';
import { showSuccess } from '@/common/toast/toastService';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { Colors } from '@/common/constants/colorEnum';
import Textarea from '@/components/shared/textarea/page';
export default function Manage_Department() {
    const initialFormState = {
        title: '',
        file: '',
        subTitle: '',
        status: 'Active',
    };
    const router = useRouter();
    const fetchedRef = useRef(false);
    const formRef = useRef(null);
    const [id, setId] = useState(null);
    const [form, setForm] = useState(initialFormState);
    const [viewform, setViewform] = useState({});
    const [previewUrl, setPreviewUrl] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
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
        { label: 'Departments', href: '/hospitals/manage-departments' }
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
        // {
        //     type: 'statusTabs',
        //     onChange: (val) => {
        //         if (val === 'All') {
        //             setForm((prev) => ({ ...prev, status: '' }));
        //             const filters = { ...form };
        //             delete filters.status;
        //             fetchDepartment(1, rowsPerPage, filters);
        //             setStatusLabel('Active/Inactive');
        //         } else {
        //             setForm((prev) => ({ ...prev, status: val }));
        //             fetchDepartment(1, 10, { ...form, status: val });
        //             setStatusLabel(val);
        //         }
        //     },
        // },
        {
            type: 'statusTabs',
            onChange: (val) => {
                if (val === 'All') val = '';

                // setStatusLabel(val);

                const updatedForm = { ...form, status: val };
                setForm(updatedForm);

                fetchDepartment(1, rowsPerPage, updatedForm);
            }
        },
        {
            label: 'Back',
            type: 'button',
            size: 'extraSmall',
            color: '#fff',
            backgroundColor: Colors.Primary1,
            isLoading: backLoading,
            onClick: () => manageDepartment(),
        },
    ]
    const myTableHeaders = [
        { id: 'file', label: 'Thumbnail', sortable: false },
        { id: 'title', label: 'Department Name', sortable: true },
        { id: 'subTitle', label: 'Subtitle', sortable: true },
        { id: 'createdAt', label: 'Created Date', sortable: false },
        { id: 'status', label: 'Status', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search department name or subtitle',
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
        fetchDepartment(page + 1, rowsPerPage, { sortField, sortOrder });
    }, [sortField, sortOrder]);
    useEffect(() => {
        return () => {
            if (form.previewUrl) {
                URL.revokeObjectURL(form.previewUrl);
            }
        };
    }, [form.previewUrl]);
    const fetchDepartment = async (pageNum = 1, limit = 5, options = {}) => {
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
            const data = await apiRequest(apiRoutes.getHospitalDeptList, 'POST', payload, router);
            if (data.response) {
                const updatedDocs = data?.data?.docs.map(doc => ({
                    ...doc,
                    createdAt: formatDate(doc.createdAt)
                }));
                setDepartmentList(updatedDocs);
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

        fetchDepartment(finalPage + 1, finalRowsPerPage, { sortField, sortOrder, ...filterForm });
    };
    const handleEdit = (row) => {
        setDisableLoadingForEdit(true);
        console.log('row', row)
        setViewform(row)
        setForm({
            title: row.title,
            file: row.file,
            subTitle: row.subTitle,
            status: row.status,
        })
        setPreviewUrl(row.file)
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
        const data = await apiRequest(apiRoutes.deleteHospitalDept, 'POST', payload, router);
        if (data.response) {
            fetchDepartment(page + 1, rowsPerPage, {})
        }
    };
    const manageDepartment = () => {
        setBackLoading(true);
        router.push('/hospitals')
    }
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        // { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchDepartment(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const payload = {
            id: updatedRow.id,
            status: updatedRow.status
        };
        const formData = objectToFormData(payload)

        try {
            const data = await apiRequest(apiRoutes.updateHospitalDept, 'POST', formData, router);
            fetchDepartment(page + 1, rowsPerPage, { sortField, sortOrder, ...filterForm });
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
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
    // const handleFilterSubmit = (filterValues) => {
    //     setFilterOpen(false)
    //     setFilterForm(prev => ({
    //         ...prev,
    //         searchKey: filterValues.searchKey || '',
    //         status: filterValues.status || '',
    //         dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
    //     }));
    //     fetchDepartment(page + 1, rowsPerPage, { sortField, sortOrder, ...filterValues },);
    // }
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
        fetchDepartment(1, rowsPerPage, { sortField, sortOrder, ...updatedFilter });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        if (!form.title || !form.file || !form.subTitle) {
            // showError('Invalid Form');
            setButtonLoading(false);
            return;
        }
        let updateForm = {
            ...form,
        };
        if (isEdit) {
            const isFileChanged = form.file !== viewform.file;

            updateForm = {
                ...viewform,
                ...form,
                fileChanged: isFileChanged,
            };
        }
        console.log('updateForm', updateForm)

        const formData = objectToFormData(updateForm)
        manageSubscription(formData);
    };
    const manageSubscription = async (formData) => {
        const action = !isEdit
            ? apiRoutes.addHospitalDept
            : apiRoutes.updateHospitalDept;
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                console.log('subscription', data);
                const message = isEdit ? 'Department updated successfully!' : 'Department added successfully!';
                showSuccess(message);
                setForm(initialFormState);
                formRef.current.reset();
                setFormSubmitted(false);
                setButtonLoading(false);
                setPreviewUrl('')
                fetchDepartment(page + 1, rowsPerPage, {})
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
                        data={departmentList}
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
                    <h5>Create Department</h5><hr />
                    <form ref={formRef} onSubmit={handleSubmit} >
                        <div className="row">
                            <div className="col-md-12 mb-1">
                                <div className="">
                                    <Input
                                        placeholder=""
                                        name="title"
                                        label="Department name"
                                        value={form.title}
                                        required={true}
                                        formSubmitted={formSubmitted}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <FileUpload
                                    label="Thumbnail"
                                    format="image"
                                    parentFile={previewUrl}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    onFileSelect={(file) => {
                                        const previewUrl = URL.createObjectURL(file);
                                        setForm({ ...form, file });
                                        setPreviewUrl(previewUrl)
                                    }}
                                />
                            </div>
                            <div className="">
                                <Textarea
                                    placeholder=""
                                    name="subTitle"
                                    label="Subtitle"
                                    value={form.subTitle}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    onChange={(e) => setForm({ ...form, subTitle: e.target.value })}
                                />
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



'use client';
import './page.css';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Button from '@/components/shared/button/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import Input from '@/components/shared/input/page';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { objectToFormData } from '@/common/utils/util';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import FileUpload from '@/components/shared/file/page';
import ColorInput from '@/components/shared/color-input/page';
import RadioGroup from '@/components/shared/radio/page';
import { Colors } from '@/common/constants/colorEnum';
import { hexToRgba } from '@/common/utils/colorUtils';
export default function Manage_Category() {
    const initialFormState = {
        title: '',
        titleTa: '',
        file: '',
        color: '#5a03fc',
        momType: '',
        status: 'Active',
    };
    const router = useRouter();
    const formRef = useRef(null);
    const fetchedRef = useRef(false);
    const [form, setForm] = useState(initialFormState);
    const [categoryList, setCategoryList] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [viewform, setViewform] = useState({});
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [id, setId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [statusLabel, setStatusLabel] = useState('Active/Inactive');
    const [disableLoadingForEdit, setDisableLoadingForEdit] = useState(false);
    const breadcrumbItems = [
        { label: 'Content Management', },
        { label: 'Community', href: '/community' },
        { label: 'Category', href: '/community/manage-category' },
    ];
    const breadcrumbAction = [
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
        {
            type: 'statusTabs',
            onChange: (val) => {
                const updatedStatus = val === 'All' ? '' : val;

                const updatedForm = {
                    ...form,
                    status: updatedStatus,
                };
                setForm(updatedForm);
                fetchCategories(1, 10, updatedForm);
                setStatusLabel(val === 'All' ? 'Active/Inactive' : val);
            },
        },
        {
            label: 'Back',
            type: 'button',
            size: 'extraSmall',
            color: '#fff',
            backgroundColor: Colors.Primary1,
            isLoading: backLoading,
            onClick: () => manageCategory(),
        }];
    const myTableHeaders = [
        { id: 'file', label: 'Thumbnail', sortable: false },
        // { id: 'title', label: 'Category Name', sortable: true },
        {
            id: 'title',
            label: 'Category Name',
            sortable: true,
            render: (row) => {
                const catColor = row.color || '#000';
                return (
                    <span
                        style={{
                            color: catColor,
                            backgroundColor: hexToRgba(catColor, 0.1),
                            padding: '4px 12px',
                            borderRadius: '5px',
                            display: 'inline-block',
                            fontWeight: 'bolder',
                        }}
                    >
                        {row.title || 'No category'}
                    </span>
                );
            }
        },
        { id: 'momType', label: 'Mom Type', sortable: false },
        { id: 'status', label: 'Status', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const momTypeOptions = [
        { label: 'Preg Mom', value: 'pregMom' },
        { label: 'New Mom', value: 'newMom' },
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchCategories(page + 1, rowsPerPage, { sortField, sortOrder });
    }, [sortField, sortOrder]);
    useEffect(() => {
        return () => {
            if (form.previewUrl) {
                URL.revokeObjectURL(form.previewUrl);
            }
        };
    }, [form.previewUrl]);
    const fetchCategories = async (pageNum = 1, limit = 5, options = {}) => {
        setIsLoading(true);
        const payload = {
            params: {
                sortField: options.sortField || '',
                sortOrder: options.sortOrder || 'asc',
                pagination: 'true',
                page: pageNum,
                limit: limit,
                status: options.status,
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getCommunityCategoryList, 'POST', payload, router);
            setCategoryList(data?.data?.docs);
            setTotalDocs(data?.data?.totalDocs);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleMomTypeChange = async (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            momType: value,
        }));
        setViewform(prev => ({
            ...prev,
            momType: value,
        }));
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchCategories(finalPage + 1, finalRowsPerPage, { sortField, sortOrder });
    };
    // const handleEdit = (row) => {
    //     setDisableLoadingForEdit(true);
    //     console.log('row', row)
    //     setViewform(row)
    //     setForm({
    //         title: row.title,
    //         file: row.file,
    //         color: row.color,
    //         momType: row.momType,
    //         status: row.status,
    //     })
    //     setPreviewUrl(row.file)
    //     setId(row.id)
    //     setIsEdit(true)
    // };
    const handleEdit = (row) => {
    setDisableLoadingForEdit(true);
    setViewform(row)
    setForm({
        title: row?.title || '',
        titleTa:
            row?.titleTa ||
            row?.translations?.ta?.title ||
            '',

        file: row?.file || '',
        color: row?.color || '#5a03fc',
        momType: row?.momType || '',
        status: row?.status || 'Active',
    });

    setPreviewUrl(row?.file || '');
    setId(row?.id);
    setIsEdit(true);
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
        const data = await apiRequest(apiRoutes.deleteCommunityCatwgory, 'POST', payload, router);
        if (data.response) {
            fetchCategories(page + 1, rowsPerPage, {})
        }
    };
    const manageCategory = () => {
        setBackLoading(true);
        router.push('/community')
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
        fetchCategories({ sortField: field, sortOrder: direction });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const payload = {
            id: updatedRow.id,
            status: updatedRow.status
        };
        const formData = objectToFormData(payload)
        try {
            const data = await apiRequest(apiRoutes.updateCommunityCategory, 'POST', formData, router);
            fetchCategories()
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        if (!form.title || !form.file || !form.momType) {
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

        // IMPORTANT: send Tamil + English translations
        updateForm.translations = JSON.stringify({
            en: {
                title: updateForm.title || '',
            },
            ta: {
                title: updateForm.titleTa || '',
            },
        });

        console.log('UPDATE FORM:', updateForm);
        console.log('TAMIL TITLE:', updateForm.titleTa);
        console.log('TRANSLATIONS:', updateForm.translations);

        const formData = objectToFormData(updateForm);

        manageSubscription(formData);
        // let updateForm = {
        //     ...form,
        // };
        // if (isEdit) {
        //     const isFileChanged = form.file !== viewform.file;

        //     updateForm = {
        //         ...viewform,
        //         ...form,
        //         fileChanged: isFileChanged,
        //     };
        // }
        // console.log('updateForm', updateForm)

        // const formData = objectToFormData(updateForm)
        // manageSubscription(formData);
    };
    const manageSubscription = async (formData) => {
        const action = !isEdit
            ? apiRoutes.addCommunityCategory
            : apiRoutes.updateCommunityCategory;
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                console.log('subscription', data);
                setForm(initialFormState);
                formRef.current.reset();
                setFormSubmitted(false);
                setButtonLoading(false);
                setPreviewUrl('')
                fetchCategories(page + 1, rowsPerPage, {})
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
                        data={categoryList}
                        actionConfig={actionConfig}
                        isLoading={isLoading}
                        sortConfig={{ [sortField]: sortOrder }}
                        onSortChange={handleSortChange}
                        onToggleStatus={handleToggleStatus}
                        disableLoading={disableLoadingForEdit}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalCount={totalDocs}
                        onTableChange={handleTableChange}
                    />
                </div>
                <div className="col-4 bg-white p-3"
                    style={{ height: 'max-content', borderRadius: '5px' }}
                >
                    <h5>Create Community Category</h5>
                    <hr />
                    <form onSubmit={handleSubmit} ref={formRef}>
                        <div className="row">
                            <div className="col-md-12 mb-1">
                                <Input
                                    placeholder=""
                                    name="title"
                                    label="Title"
                                    value={form.title}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                                <Input
                                    label="Tamil Title"
                                    name="titleTa"
                                    value={form.titleTa}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    tamilKeyboard={true}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            titleTa: e.target.value
                                        })
                                    }
                                />
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
                            <div className="col-md-12  mb-2">
                                <ColorInput
                                    label="Color"
                                    required="true"
                                    onChange={(color) => setForm({ ...form, color })}
                                    defaultColor={form.color || '#5a03fc'}
                                />
                            </div>
                            <div className="col-md-12 mb-4">
                                <label className="" style={{ fontSize: '13px', fontWeight: '500' }}>Mom Type</label>
                                {isEdit ? (
                                    <span className='ms-5'
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: Colors.Primary1
                                        }}>{viewform.momType === 'newMom' ? 'New Mom' : 'Preg Mom'}</span>
                                ) : (
                                    <div className="d-flex justify-content-start gap-3">
                                        <RadioGroup
                                            name="momType"
                                            options={momTypeOptions}
                                            selectedValue={form.momType}
                                            onChange={handleMomTypeChange}
                                            required
                                        />
                                    </div>
                                )}
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
                                size="small"
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
        </div>
    )
}



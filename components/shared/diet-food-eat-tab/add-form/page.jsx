'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import Button from '../../button/page';
import Input from '../../input/page';
import Textarea from '../../textarea/page';
import AutoCompleteInput from '../../autocomplete/page';
import DatePicker from '../../date/page';
import TimePicker from '@/components/shared/time/page';
import { showError, showSuccess } from '@/common/toast/toastService';
import CustomDialog from '../../dialog/dialog';
import ConfirmationDialog from '../../confirmation-dialog/confirmation-dialog';
import FileUpload from '../../file/page';
import RadioGroup from '../../radio/page';
import { Colors } from '@/common/constants/colorEnum';
import { objectToFormData } from '@/common/utils/util';
export default function AddFoodForm({ onClose, onSuccess, isEdit = false, existingType = null }) {
    const { id } = useParams();
    const router = useRouter();
    const formRef = useRef(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [editingTypeIndex, setEditingTypeIndex] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [form, setForm] = useState({
        calorie: '',
        duration: '',
        weight: '',
        date: '',
        time: '',
        description: '',
        userId: '',
        templateId: '',
        categoryId: '',
    });
    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
    ];
    useEffect(() => {
        if (id && id !== 'add') {
            setForm((prev) => ({ ...prev, userId: id }));
            fetchUserDetails(id);
        }
    }, [id]);
    useEffect(() => {
        if (userData?.momType) {
            fetchCategories(userData.momType);
        }
    }, [userData?.momType]);
    useEffect(() => {
        fetchFoodTemplates();
    }, []);
    useEffect(() => {
        if (isEdit && existingType) {
            setForm({
                calorie: existingType.calorie || '',
                duration: existingType.duration || '',
                weight: existingType.weight || '',
                date: existingType.date || '',
                time: existingType.time || '',
                description: existingType.description || '',
                userId: existingType.userId || id || '',
                templateId: existingType.templateId || '',
                categoryId: existingType.categoryId || '',
            });
        }
    }, [isEdit, existingType]);
    const fetchUserDetails = async (userId) => {
        try {
            const res = await apiRequest(apiRoutes.userList, 'POST', { params: { id: userId } }, router);
            if (res?.response) {
                const firstUser = res.data?.docs?.[0];
                setUserData(firstUser);
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };
    const fetchCategories = async (momType) => {
        try {
            const payload = {
                params: {
                    status: 'Active',
                    momType,
                    pagination: 'true',
                    page: '1',
                    limit: '10',
                },
            };
            const res = await apiRequest(apiRoutes.getFoodEatCategoryList, 'POST', payload, router);
            if (res?.response) {
                const mapped = res.data.docs.map((item) => ({
                    ...item,
                    label: item.title,
                }));
                setCategories(mapped);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    const fetchFoodTemplates = async () => {
        try {
            const payload = {
                params: {
                    status: 'Active',
                    pagination: 'true',
                    page: '1',
                    limit: '10',
                },
            };
            const res = await apiRequest(apiRoutes.getFoodTemplateList, 'POST', payload, router);
            if (res?.response) {
                const mapped = res.data.docs.map((item) => ({
                    ...item,
                    label: item.name,
                }));
                setTemplates(mapped);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };
    const handleAddType = async (newType) => {
        try {
            const formData = objectToFormData(newType);

            const data = await apiRequest(apiRoutes.addFoodTemplate, 'POST', formData, router);

            if (data?.response) {
                await fetchFoodTemplates();

                showSuccess('Food Template added successfully!');
            } else {
                showError('Failed to add food template.');
            }
        } catch (error) {
            console.error('API error:', error);
        }
    };
    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };
    const handleDeleteCancel = () => {
        setIsDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);
        if (!existingType?.id) return;

        const payload = { params: { id: existingType.id } };
        try {
            const res = await apiRequest(apiRoutes.deleteDietFood, 'POST', payload, router);
            if (res?.response) {
                showSuccess('Diet Food deleted successfully');
                onClose?.();
                onSuccess?.();
            }
        } catch (err) {
            showError('Failed to delete');
            console.error('Delete error:', err);
        }
    };
    const AddTemplateForm = ({ onSubmit, onClose, isEdit = false, existingData = null }) => {
        const [form, setForm] = useState(existingData || {
            name: '',
            file: null,
            status: 'Active',
        });
        const [formSubmitted, setFormSubmitted] = useState(false);
        const [buttonLoading, setButtonLoading] = useState(false);
        const [previewUrl, setPreviewUrl] = useState(existingData?.file || '');

        useEffect(() => {
            if (existingData) {
                setForm(existingData);
                setPreviewUrl(existingData.file || '');
            }
        }, [existingData]);

        const handleSubmit = async () => {
            setFormSubmitted(true);
            if (!form.name.trim() || !form.file || !form.status) return;

            setButtonLoading(true);
            await onSubmit(form);
            setButtonLoading(false);
            onClose();
        };

        const handleStatusChange = (e) => {
            const value = e.target.value;
            setForm((prevForm) => ({
                ...prevForm,
                status: value,
            }));
        };

        return (
            <div className="custom-form" style={{ width: '100%' }}>
                <div className="mb-3">
                    <Input
                        name="name"
                        label="Title"
                        value={form.name}
                        required
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <FileUpload
                        label="Thumbnail"
                        format="image"
                        required
                        parentFile={previewUrl}
                        formSubmitted={formSubmitted}
                        onFileSelect={(file) => {
                            setForm((prev) => ({ ...prev, file }));
                            setPreviewUrl(URL.createObjectURL(file));
                        }}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '0.875rem' }}>Status</label>
                    <RadioGroup
                        name="status"
                        options={statusOptions}
                        selectedValue={form.status}
                        onChange={handleStatusChange}
                        required
                    />
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                        label={isEdit ? "Update" : "Save"}
                        type="button"
                        size="small"
                        backgroundColor={Colors.Primary2}
                        color="#fff"
                        isLoading={buttonLoading}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        );
    };
    const handleCategorySelect = (item) => {
        setForm((prev) => ({
            ...prev,
            categoryId: item.id,
        }));
    };
    const handleFoodTemplateSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            templateId: item.id,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        const requiredFields = [
            'date',
            'time',
            'calorie',
            'duration',
            'weight',
            'description',
            'userId',
            'templateId',
            'categoryId',
        ];
        const hasEmptyFields = requiredFields.some((key) => !form[key]);
        if (hasEmptyFields) {
            setButtonLoading(false);
            return;
        }
        let updateForm = {
            ...form,
        };
        if (isEdit && existingType?.id) {
            updateForm = {
                ...updateForm,
                id: existingType.id,
            };
        }
        const payload = {
            params: updateForm,
        };
        manageArticles(payload);
    };
    const manageArticles = async (payload) => {
        const action = !isEdit ? apiRoutes.addDietFood : apiRoutes.updateDietFood;
        try {
            const data = await apiRequest(action, 'POST', payload, router);
            if (data?.response) {
                showSuccess(isEdit ? 'Diet Food updated successfully!' : ' Diet Food added successfully!');
                setForm({
                    calorie: '',
                    duration: '',
                    weight: '',
                    date: '',
                    time: '',
                    description: '',
                    templateId: '',
                    categoryId: '',
                });
                onClose?.();
                onSuccess?.();
            }
        } catch (error) {
            console.error('API error:', error);
        } finally {
            setFormSubmitted(false);
            setButtonLoading(false);
        }
    };
    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-2">
            <div className="flex flex-row gap-4 mt-3">
                <div className="w-[300px]">
                    <DatePicker
                        label="Select Date"
                        name="date"
                        futureOnly={true} 
                        value={form.date}
                        onChange={(val) => setForm((prev) => ({ ...prev, date: val }))}
                        required
                    />
                </div>
                <div className="w-[300px]">
                    <TimePicker
                        label="Select Time"
                        name="time"
                        value={form.time}
                        onChange={(val) => setForm((prev) => ({ ...prev, time: val }))}
                        required
                        size="medium"
                    />
                </div>
            </div>
            <div className='mt-3'>
                <AutoCompleteInput
                    label="Category"
                    options={categories}
                    value={categories.find((c) => c.id === form.categoryId)?.label || ''}
                    required
                    formSubmitted={formSubmitted}
                    onSelect={handleCategorySelect}
                />
            </div>

            <div className="flex items-end gap-2 w-full mt-3">
                <div className="flex-1">
                    <AutoCompleteInput
                        label="Food Templates"
                        options={templates}
                        value={templates.find((t) => t.id === form.templateId)?.label || ''}
                        required
                        formSubmitted={formSubmitted}
                        onSelect={handleFoodTemplateSelect}
                    />
                </div>
                <span
                    className="cursor-pointer mb-[6px]"
                    onClick={() => setTemplateDialogOpen(true)}
                >
                    <img
                        src="/assets/icons/blue-plus-icon.svg"
                        style={{ width: '24px' }}
                        alt="Add"
                    />
                </span>
            </div>
            <div className='mt-3'>
                <Input
                    label="Calorie"
                    type='number'
                    name="calorie"
                    value={form.calorie}
                    onChange={(e) => setForm({ ...form, calorie: e.target.value })}
                    required
                    formSubmitted={formSubmitted}
                />
            </div>
            <div className='mt-3'>
                <Input
                    label="Duration"
                    type='number'
                    name="duration"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    required
                    formSubmitted={formSubmitted}
                />
            </div>
            <div className='mt-3'>
                <Input
                    label="Weight"
                    type='number'
                    name="weight"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    required
                    formSubmitted={formSubmitted}
                />
            </div>
            <div className='mt-3'>
                <Textarea
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    formSubmitted={formSubmitted}
                />

            </div>
            <div className="flex justify-end gap-2">
                {isEdit && (
                    <Button
                        label='Delete'
                        type='button'
                        size='small'
                        backgroundColor={Colors.Primary1}
                        color='#fff'
                        isLoading={buttonLoading}
                        onClick={handleDelete}
                    />
                )}
                <Button label={isEdit ? "Update" : "Add"} type="submit" size="small" isLoading={buttonLoading} />
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
            <CustomDialog
                open={templateDialogOpen}
                onClose={() => {
                    setTemplateDialogOpen(false);
                    setEditingTypeIndex(null);
                }}
                title={'Add Food Template'}
                titleColor="#000000"
                backgroundColor="#fafcfc"
                maxWidth="xs"
                content={
                    <AddTemplateForm
                        existingType={editingTypeIndex !== null ? form.Types[editingTypeIndex] : null}
                        onSubmit={async (newType) => {
                            if (editingTypeIndex !== null) {
                                const updatedTypes = [...form.Types];
                                updatedTypes[editingTypeIndex] = newType;
                                setForm((prev) => ({ ...prev, Types: updatedTypes }));
                            } else {
                                await handleAddType(newType);
                            }
                            setTemplateDialogOpen(false);
                            setEditingTypeIndex(null);
                        }}
                        onClose={() => {
                            setTemplateDialogOpen(false);
                            setEditingTypeIndex(null);
                        }}
                    />
                }
            />
        </form>
    );

}

'use client';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import Button from '../../button/page';
import Input from '../../input/page';
import Textarea from '../../textarea/page';
import AutoCompleteInput from '../../autocomplete/page';
import { showError, showSuccess } from '@/common/toast/toastService';
import CustomDialog from '../../dialog/dialog';
import FileUpload from '../../file/page';
import RadioGroup from '../../radio/page';
import { Colors } from '@/common/constants/colorEnum';
import { objectToFormData } from '@/common/utils/util';
import ConfirmationDialog from '../../confirmation-dialog/confirmation-dialog';
export default function AddFoodForm({ onClose, onSuccess, isEdit = false, existingType = null }) {
    const { id } = useParams();
    const router = useRouter();
    const formRef = useRef(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [foodInput, setFoodInput] = useState('');
    const [userData, setUserData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [editingTypeIndex, setEditingTypeIndex] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [form, setForm] = useState({
        userId: '',
        templateId: '',
        categoryId: '',
        description: '',
        symptoms: [],
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
                userId: existingType.userId || id || '',
                templateId: existingType.templateId || '',
                categoryId: existingType.categoryId || '',
                description: existingType.description || '',
                symptoms: existingType.symptoms || [],
            });
        }
    }, [isEdit, existingType]);
    const handleAddSymptoms = () => {
        if (!foodInput.trim()) return;
        const newFoods = {
            id: form.symptoms.length > 0
                ? form.symptoms[form.symptoms.length - 1].id + 1
                : 1,
            description: foodInput,
        };
        setForm((prev) => ({
            ...prev,
            symptoms: [...prev.symptoms, newFoods],
        }));
        setFoodInput('');
    };
    const handleDeleteSymptoms = (idToDelete) => {
        const updatedsymptoms = form.symptoms
            .filter((sympt) => sympt.id !== idToDelete)
            .map((f, i) => ({
                ...f,
                id: i + 1,
            }));
        setForm({ ...form, symptoms: updatedsymptoms });
    };
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
            const res = await apiRequest(apiRoutes.getFoodAvoidCategoryList, 'POST', payload, router);
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
            const res = await apiRequest(apiRoutes.deleteDietAvoidFood, 'POST', payload, router);
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
            'userId',
            'templateId',
            'categoryId',
            'description',
        ];
        if (form.symptoms.length === 0) {
            showError('Please add at least one symptoms');
            setButtonLoading(false);
            return;
        }
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
        const action = !isEdit ? apiRoutes.addDietAvoidFood : apiRoutes.updateDietAvoidFood;
        try {
            const data = await apiRequest(action, 'POST', payload, router);
            if (data?.response) {
                showSuccess(isEdit ? 'Diet Food updated successfully!' : ' Diet Food added successfully!');
                // setForm({
                //     description: '',
                //     templateId: '',
                //     categoryId: '',
                // });
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
            <div style={{ border: 'none' }}>
                {/* <label htmlFor="symptoms" className="form-label mt-3" style={{ minWidth: '100px', fontSize: '13px' }}>
                    Add Symptoms
                </label> */}
                <div className='mt-3'>
                    <Input
                        placeholder=""
                        name="symptoms"
                        label="Symptoms"
                        value={foodInput}
                        required={false}
                        onChange={(e) => setFoodInput(e.target.value)}
                    />
                </div>
                <div className="d-flex justify-content-end align-items-center mt-2">
                    <Button
                        label="Add Symptoms"
                        type="button"
                        color="#fff"
                        size='extraSmall'
                        backgroundColor={Colors.Primary1}
                        onClick={handleAddSymptoms}
                    />
                </div>
                {form.symptoms.length > 0 && (
                    <div className="mb-3" style={{ border: 'none' }}>
                        <label
                            htmlFor="symptoms"
                            className="form-label mb-0 pt-1"
                            style={{ minWidth: '100px' }}
                        >
                            Symptoms
                        </label>

                        <div className="mt-2 ms-3"
                            style={{
                                maxHeight: '180px', overflow: 'auto'
                            }}
                        >
                            <ul className="cursor"
                                style={{
                                    listStyleType: 'circle',
                                    paddingLeft: '20px',
                                    marginBottom: 0,
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    maxWidth: '100%',
                                }}
                            >
                                {form.symptoms.map((food, index) => (
                                    <li
                                        key={index}
                                        className='cursor'
                                        style={{
                                            listStyleType: 'circle',
                                        }}
                                    >
                                        <div
                                            className="d-flex justify-content-between align-items-center"
                                            style={{
                                                borderBottom: index !== form.symptoms.length - 1 ? '1px solid #ccc' : 'none',
                                                paddingBottom: '6px',
                                                paddingTop: '6px',
                                            }}
                                        >
                                            <span>{food.description || 'ITEM'}</span>
                                            <Image
                                                src="/assets/icons/delete-icon.svg"
                                                alt="icon"
                                                width={18}
                                                height={18}
                                                className="ms-2"
                                                onClick={() => handleDeleteSymptoms(food.id)}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>

                        </div>
                    </div>
                )}
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

            <div className="flex justify-end gap-2 mt-3">
                {isEdit && (
                    <Button label='Delete' type='button' size='small' isLoading={buttonLoading} backgroundColor={Colors.Primary1} color='#fff' onClick={handleDelete} />
                )}
                <Button label={isEdit ? "Update" : "Save"} type="submit" size="small" isLoading={buttonLoading} />

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

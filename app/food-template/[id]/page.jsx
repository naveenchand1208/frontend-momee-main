'use client';
import './page.css';
import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { showSuccess } from '@/common/toast/toastService';
import { objectToFormData } from '@/common/utils/util';
import Button from '@/components/shared/button/page';
import Input from '@/components/shared/input/page';
import { Colors } from '@/common/constants/colorEnum';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import FileUpload from '@/components/shared/file/page';
import RadioGroup from '@/components/shared/radio/page';
export default function Foods_Template_Add() {
    const { id } = useParams();
    const isEdit = id !== 'add';
    const router = useRouter();
    const formRef = useRef(null);
    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [viewform, setViewform] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState({
        name: '',
        nameTa: '',
        file: '',
        status: 'Active',
    });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Food Template', href: '/food-template' },
        { label: isEdit ? 'Edit' : 'Add', href: isEdit ? `/food-template/${id}` : '/food-template/add' }
    ];
    const breadcrumbAction = [
        {
            label: 'Back',
            type: 'button',
            size: 'extraSmall',
            color: '#fff',
            backgroundColor: Colors.Primary1,
            isLoading: backLoading,
            onClick: () => handleBackTemplate(),
        },
    ];
    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
    ];
    const handleClear = () => {
        // setForm({
        //     name: '',
        //     file: '',
        //     status: 'Active',
        // });
        setForm({
            name: '',
            nameTa: '',
            file: '',
            status: 'Active',
        });
        setPreviewUrl('');
        setFormSubmitted(false);
        setViewform({});
        if (formRef.current) {
            formRef.current.reset();
        }
    };
    useEffect(() => {
        if (isEdit && id) {
            viewTemplates(id);
        }
    }, [isEdit, id]);
    useEffect(() => {
        return () => {
            if (form.previewUrl) {
                URL.revokeObjectURL(form.previewUrl);
            }
        };
    }, [form.previewUrl]);
    const handleBackTemplate = () => {
        setBackLoading(true);
        router.push('/food-template');
    };
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setForm((prevForm) => ({
            ...prevForm,
            status: value,
        }));
    };
    const viewTemplates = async (id) => {
        try {
            //const payload = { params: { id } };
            const payload = {
            params: {
                id,
                admin: true
            }
        };
            const data = await apiRequest(apiRoutes.viewFoodTemplate, 'POST', payload, router);
            if (data?.response) {
                const template = data?.data;
                // setForm({
                //     name: template?.name || '',
                //     status: template?.status || '',
                //     file: template?.file || '',
                // });
                setForm({
                        name:
                            template?.translations?.en?.name ||
                            template?.name ||
                            '',

                        nameTa:
                            template?.translations?.ta?.name ||
                            '',

                        status:
                            template?.status ||
                            '',

                        file:
                            template?.file ||
                            '',
                    });
                setViewform(template);
                setPreviewUrl(template.file || '');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error loading template', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormSubmitted(true);
        setButtonLoading(true);

        if (!form.name || !form.nameTa || !form.file) {
            setButtonLoading(false);
            return;
        }

        let updateForm = { ...form };

        if (isEdit) {

            const isFileChanged =
                form?.file?.public_id !==
                viewform?.file?.public_id;

            updateForm = {
                ...viewform,
                ...form,
                fileChanged: isFileChanged,
            };
        }

        const formData = objectToFormData(updateForm);

        formData.set('name', form.name);
        formData.set('nameTa', form.nameTa);
        formData.set('status', form.status);

        if (form.file) {
            formData.set('file', form.file);
        }

        if (isEdit) {
            formData.set('id', id);
            formData.set(
                'fileChanged',
                String(updateForm.fileChanged)
            );
        }

        console.log('========== FORM DATA ==========');

        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        manageTemplate(formData);
    };


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setFormSubmitted(true);
//         setButtonLoading(true);

//         if (!form.name || !form.nameTa || !form.file) {
//             setButtonLoading(false);
//             return;
//         }

//         let updateForm = { ...form };

//         if (isEdit) {
//             const isFileChanged = form?.file?.public_id !== viewform?.file?.public_id;
//             updateForm = {
//                 ...viewform,
//                 ...form,
//                 fileChanged: isFileChanged,
//             };
//         }

//         // const formData = objectToFormData(updateForm);
//         // manageTemplate(formData);
//         const formData = objectToFormData(updateForm);

//             formData.set('name', form.name);
//             formData.set('nameTa', form.nameTa);
//             formData.set('status', form.status);

//             if (form.file) {
//                 formData.set('file', form.file);
//             }

//             if (isEdit) {
//                 formData.set('id', id);
//                 formData.set(
//                     'fileChanged',
//                     String(updateForm.fileChanged)
//                 );
//             }

//             console.log('========== FORM DATA ==========');

//             for (const [key, value] of formData.entries()) {
//                 console.log(key, value);
//             }

//             manageTemplate(formData);
// };
    const manageTemplate = async (formData) => {
        const action = isEdit ? apiRoutes.updateFoodTemplate : apiRoutes.addFoodTemplate;

        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                showSuccess(isEdit ? 'Food Template updated successfully!' : 'Food Template added successfully!');
                handleClear();
                router.push('/food-template');
            } else {
                setButtonLoading(false);
                setFormSubmitted(false);
            }
        } catch (error) {
            console.error('Failed to save template:', error);
            setButtonLoading(false);
        }
    };
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />
            <div className="col-4 bg-white p-3 rounded">
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-12 mb-3">
                            <Input
                                name="name"
                                label="Title"
                                value={form.name}
                                required
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="col-md-12 mb-3">
                            <Input
                                name="nameTa"
                                label="Tamil Title"
                                value={form.nameTa}
                                required
                                formSubmitted={formSubmitted}
                                tamilKeyboard={true}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        nameTa: e.target.value
                                    })
                                }
                            />

                        </div>
                        <div className="col-md-12 mb-4">
                            <FileUpload
                                label="Thumbnail"
                                format="image"
                                required
                                parentFile={previewUrl}
                                formSubmitted={formSubmitted}
                                onFileSelect={(file) => setForm((prev) => ({ ...prev, file }))}
                            />
                        </div>
                        <div className="col-md-12 mb-2">
                            <label className="form-label" style={{ fontSize: '0.875rem' }}>Status</label>
                            <RadioGroup
                                name="status"
                                options={statusOptions}
                                selectedValue={form.status}
                                onChange={handleStatusChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="d-flex justify-content-end mt-4" style={{ gap: '5px' }}>
                        <Button
                            label={isEdit ? 'Update' : 'Save'}
                            type="submit"
                            color="#fff"
                            size="small"
                            backgroundColor={Colors.Primary2}
                            isLoading={buttonLoading}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

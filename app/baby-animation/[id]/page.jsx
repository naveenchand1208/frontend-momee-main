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
import AutoCompleteInput from '@/components/shared/autocomplete/page';
import { getWeeks } from '@/common/utils/util';
import RadioGroup from '@/components/shared/radio/page';
export default function Baby_Animation_Add() {
    const { id } = useParams();
    const isEdit = id !== 'add';
    const router = useRouter();
    const formRef = useRef(null);
    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [viewform, setViewform] = useState({});
    const [weeks, setWeeks] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState({
        name: '',
        //nameTa: '',
        file: '',
        babySize: '',
        babyWeight: '',
        // status: 'Active',
    });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Baby Animation', href: '/baby-animation' },
        { label: isEdit ? 'Edit' : 'Add', href: isEdit ? `/baby-animation/${id}` : '/baby-animation/add' }
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
        setForm({
            name: '',
            //nameTa: '',
            file: '',
            babySize: '',
            babyWeight: '',
            // status: 'Active',
        });
        setPreviewUrl('');
        setFormSubmitted(false);
        setViewform({});
        if (formRef.current) {
            formRef.current.reset();
        }
    };
    const handleWeekSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            name: item.label,
        }));
    };
    useEffect(() => {
        if (isEdit && id) {
            viewTemplates(id);
        }
    }, [isEdit, id]);
    useEffect(() => {
        const name = getWeeks();
        console.log('week', name)
        setWeeks(name);
    }, []);
    useEffect(() => {
        return () => {
            if (form.previewUrl) {
                URL.revokeObjectURL(form.previewUrl);
            }
        };
    }, [form.previewUrl]);
    const handleBackTemplate = () => {
        setBackLoading(true);
        router.push('/baby-animation');
    };
    // const handleStatusChange = (e) => {
    //     const value = e.target.value;
    //     setForm((prevForm) => ({
    //         ...prevForm,
    //         status: value,
    //     }));
    // };
    const handleStatusChange = (e) => {
        const value = e.target.value;

        console.log("Selected Status:", value); // 👈 logs immediately

        setForm((prevForm) => {
            const updated = { ...prevForm, status: value };
            console.log("Updated Form Object:", updated); // 👈 logs final updated form
            return updated;
        });
    };

    const viewTemplates = async (id) => {
        try {
            const payload = { params: { id } };
            const data = await apiRequest(apiRoutes.viewBabyAnimation, 'POST', payload, router);
            if (data?.response) {
                const template = data?.data;
                // setForm({
                //     name: template?.name || '',
                //     //nameTa: template?.translations?.ta?.name || '',
                //     nameTa: template?.nameTa ||
                //             template?.translations?.ta?.name ||
                //             '',
                //     // status: template?.status || '',
                //     file: template?.file || '',
                //     babySize: template?.babySize || '',
                //     babyWeight: template?.babyWeight || '',
                // });
                // setForm({
                //     name: template?.name || '',
                //     nameTa: template?.nameTa || template?.translations?.ta?.name || '',
                //     file: template?.file || '',
                //     babySize: template?.babySize || '',
                //     babyWeight: template?.babyWeight || '',
                // });
                const englishName = template?.name || '';
                // let tamilName =
                //     template?.nameTa ||
                //     template?.translations?.ta?.name ||
                //     '';

                // Auto Tamil for existing Week records
                // if (!tamilName && englishName) {
                //     const weekMatch = englishName.match(/^Week\s+(\d+)$/i);

                //     if (weekMatch) {
                //         tamilName = `வாரம் ${weekMatch[1]}`;
                //     }
                // }

                setForm({
                    name: englishName,
                    //nameTa: tamilName,
                    file: template?.file || '',
                    babySize: template?.babySize || '',
                    babyWeight: template?.babyWeight || '',
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

        //if (!form.name || !form.nameTa || !form.file || !form.babySize || !form.babyWeight) {
            if (!form.name || !form.file || !form.babySize || !form.babyWeight) {
            setButtonLoading(false);
            return;
        }

        let updateForm = { ...form };

        if (isEdit) {
            const isFileChanged = form?.file?.public_id !== viewform?.file?.public_id;
            updateForm = {
                ...viewform,
                ...form,
                fileChanged: isFileChanged,
            };
        }
        // const preparedForm = {
        //     ...updateForm,
        //     nameTa: updateForm.nameTa
        // };
        const preparedForm = {
            ...updateForm,

            translations: {
                en: {
                    name: updateForm.name || ''
                },

                // ta: {
                //     name: updateForm.nameTa || ''
                // }
            }
        };

        // const formData = objectToFormData(preparedForm);
        // manageTemplate(formData);
        const formData = new FormData();
        formData.append('name', updateForm.name || '');
        formData.append('babySize', updateForm.babySize || '');
        formData.append('babyWeight', updateForm.babyWeight || '');

        if (updateForm.file instanceof File) {
            formData.append('file', updateForm.file);
        }
        for (const [key, value] of formData.entries()) {
            console.log(
                key,
                value instanceof File
                    ? `FILE: ${value.name} | ${value.type} | ${value.size}`
                    : value
            );
        }

        manageTemplate(formData);
    };
    const manageTemplate = async (formData) => {
        const action = isEdit ? apiRoutes.updateBabyAnimation : apiRoutes.addBabyAnimation;

        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                showSuccess(isEdit ? 'Baby Animation updated successfully!' : 'Baby Animation added successfully!');
                handleClear();
                router.push('/baby-animation');
            } else {
                setButtonLoading(false);
                setFormSubmitted(false);
            }
        } catch (error) {
            console.error('Failed to save baby animation:', error);
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
                            {/* <Input
                                name="name"
                                label="Title"
                                value={form.name}
                                required
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            /> */}
                            <AutoCompleteInput
                                label="Title"
                                options={weeks}
                                required={true}
                                formSubmitted={formSubmitted}
                                onSelect={handleWeekSelect}
                                value={form.name}
                            />
                        </div>
                        {/* <div className="col-md-12 mb-3">
                            <Input
                                name="nameTa"
                                label="Title (Tamil)"
                                value={form.nameTa}
                                required
                                formSubmitted={formSubmitted}
                                tamilKeyboard={true}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        nameTa: e.target.value
                                    }))
                                }
                            />
                        </div> */}
                        <div className="col-md-12 mb-4">
                            <FileUpload
                                label="Image (only .gif format)"
                                format="gif"
                                required
                                parentFile={previewUrl}
                                formSubmitted={formSubmitted}
                                onFileSelect={(file) => setForm((prev) => ({ ...prev, file }))}
                            />
                        </div>
                        <div className="col-md-12 mb-3">
                            <Input
                                name="babySize"
                                label="Baby Size"
                                type="number"
                                value={form.babySize}
                                required
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, babySize: e.target.value })}
                            />
                        </div>
                        <div className="col-md-12 mb-3">
                            <Input
                                name="babyWeight"
                                label="Baby Weight"
                                type="number"
                                value={form.babyWeight}
                                required
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, babyWeight: e.target.value })}
                            />
                        </div>
                        {/* <div className="col-md-12 mb-2">
                            <label className="form-label" style={{ fontSize: '0.875rem' }}>Status</label>
                            <RadioGroup
                                name="status"
                                options={statusOptions}
                                selectedValue={form.status}
                                onChange={handleStatusChange}
                                required
                            />
                        </div> */}
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


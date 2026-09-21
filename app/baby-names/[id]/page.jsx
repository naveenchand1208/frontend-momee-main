'use client';
import './page.css';
import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { showSuccess } from '@/common/toast/toastService';
import Button from '@/components/shared/button/page';
import Input from '@/components/shared/input/page';
import { Colors } from '@/common/constants/colorEnum';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import RadioGroup from '@/components/shared/radio/page';

export default function Baby_Names_Add() {

    const { id } = useParams();
    const isEdit = id !== 'add';
    const router = useRouter();
    const formRef = useRef(null);

    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const [viewform, setViewform] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Default form
    const [form, setForm] = useState({
        name: '',
        nameTa: '',
        type: 'boy',
    });

    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Baby Names', href: '/baby-names' },
        { label: isEdit ? 'Edit' : 'Add', href: isEdit ? `/baby-names/${id}` : '/baby-names/add' }
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

    const typeOptions = [
        { label: 'Boy', value: 'boy' },
        { label: 'Girl', value: 'girl' },
    ];

    // Reset form
    const handleClear = () => {
        setForm({
            name: '',
            nameTa: '',
            type: 'boy',
        });
        setFormSubmitted(false);

        if (formRef.current) {
            formRef.current.reset();
        }
    };

    // Load data when editing
    useEffect(() => {
        if (isEdit && id) {
            viewTemplates(id);
        }
    }, [isEdit, id]);

    const handleBackTemplate = () => {
        setBackLoading(true);
        router.push('/baby-names');
    };

    const handleTypeChange = (e) => {
        setForm((prevForm) => ({
            ...prevForm,
            type: e.target.value,
        }));
    };

    // View API data
    // const viewTemplates = async (id) => {
    //     try {
    //         const payload = { params: { id } };
    //         const data = await apiRequest(apiRoutes.viewBabyNames, 'POST', payload, router);

    //         if (data?.response) {
    //             const template = data?.data;

    //             // Clean API type safely
    //             const cleanType = template?.type
    //                 ? template?.type?.toString().trim().toLowerCase()
    //                 : 'boy';

    //             // Ensure ONLY boy/girl allowed
    //             const finalType = ['boy', 'girl'].includes(cleanType) ? cleanType : 'boy';

    //             setForm({
    //                 name: template?.name || '',
    //                 nameTa: template?.translations?.ta?.name || template?.nameTa || '',
    //                 type: finalType,
    //             });

    //             setViewform(template);
    //             setIsLoading(false);
    //         }
    //     } catch (error) {
    //         console.error('Error loading template', error);
    //     }
    // };
    const viewTemplates = async () => {
    try {
        const payload = {
            params: {
                id
            }
        };

        const data = await apiRequest(
            apiRoutes.viewBabyNames,
            'POST',
            payload,
            router
        );

        if (data?.response) {
            const template = data?.data;
            console.log("========== BABY NAME DEBUG ==========");
            console.log("FULL RESPONSE:", data);
            console.log("TEMPLATE:", template);
            console.log("ENGLISH NAME:", template?.name);
            console.log("NAME TA:", template?.nameTa);
            console.log("TRANSLATIONS:", template?.translations);
            console.log("TA NAME:", template?.translations?.ta?.name);
            console.log("====================================");

            console.log('BABY NAME API RESPONSE:', template);
            console.log('TAMIL NAME:', template?.translations?.ta?.name);
            console.log('NAME TA:', template?.nameTa);

            const cleanType = String(template?.type || '')
                .trim()
                .toLowerCase();

            const finalType =
                cleanType === 'girl' ? 'girl' : 'boy';

            // setForm({
            //     name: template?.translations?.en?.name ||
            //           template?.name ||
            //           '',

            //     nameTa: template?.translations?.ta?.name ||
            //             template?.nameTa ||
            //             '',

            //     type: finalType
            // });
            setForm({
                name: template?.name || '',

                nameTa:
                    template?.nameTa ||
                    template?.translations?.ta?.name ||
                    '',

                type: finalType
            });

            setViewform(template);
            setIsLoading(false);
        }

    } catch (error) {
        console.error('View Baby Name Error:', error);
        setIsLoading(false);
    }
};

    // Submit logic
//     const handleSubmit = async (e) => {
//     e.preventDefault();

//     setFormSubmitted(true);
//     setButtonLoading(true);

//     if (!form.name || !form.nameTa || !form.type) {
//         setButtonLoading(false);
//         return;
//     }

//     let payloadData = {
//         ...form,
//         nameTa: form.nameTa,
//     };

//     if (isEdit) {
//         payloadData = {
//             ...viewform,
//             ...form,
//             nameTa: form.nameTa,
//         };
//     }

//     console.log("========== BABY NAME SAVE ==========");
//     console.log("English Name:", payloadData.name);
//     console.log("Tamil Name:", payloadData.nameTa);
//     console.log("Type:", payloadData.type);
//     console.log("FINAL PAYLOAD:", payloadData);

//     const payload = {
//         params: payloadData
//     };

//     manageTemplate(payload);
// };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);

        if (!form.name || !form.nameTa || !form.type) {
            setButtonLoading(false);
            return;
        }

        let payloadData = { ...form };

        if (isEdit) {
            payloadData = {
                ...viewform,
                ...form
            };
        }
        payloadData.translations = {
            en: {
                name: payloadData.name
            },
            ta: {
                name: payloadData.nameTa
            }
        };

        // Payload wrapper
        const payload = {
            params: payloadData
        };

        manageTemplate(payload);
    };

    // Add / Update API call
    // const manageTemplate = async (payload) => {
    //     const action = isEdit ? apiRoutes.updateBabyNames : apiRoutes.addBabyNames;

    //     try {
    //         const data = await apiRequest(action, 'POST', payload, router);

    //         if (data?.response) {
    //             showSuccess(isEdit ? 'Baby Names updated successfully!' : 'Baby Names added successfully!');
    //             handleClear();
    //             router.push('/baby-names');
    //         } else {
    //             setButtonLoading(false);
    //             setFormSubmitted(false);
    //         }

    //     } catch (error) {
    //         console.error('Failed to save baby names:', error);
    //         setButtonLoading(false);
    //     }
    // };
    const manageTemplate = async (payload) => {
    const action = isEdit
        ? apiRoutes.updateBabyNames
        : apiRoutes.addBabyNames;

    try {
        const data = await apiRequest(
            action,
            'POST',
            payload,
            router
        );

        if (data?.response) {

            showSuccess(
                isEdit
                    ? 'Baby Name updated successfully!'
                    : 'Baby Name added successfully!'
            );

            handleClear();

            router.push('/baby-names');

        } else {

            setButtonLoading(false);
            setFormSubmitted(false);
        }

    } catch (error) {

        console.error(
            'Failed to save baby names:',
            error
        );

        setButtonLoading(false);
        setFormSubmitted(false);
    }
};

    return (
        <div className="max-w-4xl mx-auto mt-10">

            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />

            <div className="col-4 bg-white p-3 rounded">

                <form ref={formRef} onSubmit={handleSubmit}>

                    <div className="row">

                        {!isEdit && (
                            <div className="col-md-12 mb-2">
                                <label className="form-label" style={{ fontSize: '0.875rem' }}>Type</label>

                                <RadioGroup
                                    name="type"
                                    options={typeOptions}
                                    selectedValue={form.type}
                                    onChange={handleTypeChange}
                                    required
                                    disabled={isEdit}
                                />

                            </div>
                        )}

                        <div className="col-md-12 mb-3 mt-2">
                            <Input
                                name="name"
                                label="Name"
                                value={form.name}
                                required
                                formSubmitted={formSubmitted}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                                    setForm({ ...form, name: value });
                                }} />
                        </div>
                        <div className="col-md-12 mb-3 mt-2">
                            <Input
                                label="Tamil Name"
                                name="nameTa"
                                value={form.nameTa}
                                required={true}
                                formSubmitted={formSubmitted}
                                tamilKeyboard={true}
                                onChange={(e) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        nameTa: e.target.value
                                    }));
                                }}
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


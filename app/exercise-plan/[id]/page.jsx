'use client';
import './page.css';
import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { showSuccess } from '@/common/toast/toastService';
import { getMonths } from '@/common/utils/util';
import Button from '@/components/shared/button/page';
import Input from '@/components/shared/input/page';
import { Colors } from '@/common/constants/colorEnum';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import AutoCompleteInput from '@/components/shared/autocomplete/page';
import { IOS_AMOUNT_OPTIONS } from '@/common/constants/enum';
import RadioGroup from '@/components/shared/radio/page';
export default function Exercise_Plan_Add() {
    const { id } = useParams();
    const isEdit = id !== 'add';
    const router = useRouter();
    const formRef = useRef(null);
    const [months, setMonths] = useState('');
    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [viewform, setViewform] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState({
        planName: '',
        planAmount: '',
        durationMonths: '',
        deviceType: '',
        // status: 'Active',
    });
    const breadcrumbItems = [
        { label: 'Exercise Plans', href: '/exercise-plan' },
        { label: isEdit ? 'Edit' : 'Add', href: isEdit ? `/exercise-plan/${id}` : '/exercise-plan/add' }
    ];
    const deviceOptions = [
        { label: 'Android', value: 'android' },
        { label: 'IOS', value: 'ios' },
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
    // const statusOptions = [
    //     { label: 'Active', value: 'Active' },
    //     { label: 'Inactive', value: 'Inactive' },
    // ];
    useEffect(() => {
        if (isEdit && id) {
            viewExercisePlan(id);
        }
    }, [isEdit, id]);
    useEffect(() => {
        const month = getMonths();
        setMonths(month);
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
        router.push('/exercise-plan');
    };
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setForm((prevForm) => ({
            ...prevForm,
            status: value,
        }));
    };
    const handleSelect = (item) => {
        console.log(item)
        setForm((prev) => ({
            ...prev,
            durationMonths: item.label,
        }));
        console.log('form', form.durationMonths)
    };
    // const handleClear = () => {
    //     setForm({
    //         planName: '',
    //         planAmount: '',
    //         durationMonths: '',
    //         // status: 'Active',
    //     });
    //     setFormSubmitted(false);
    // };

    const viewExercisePlan = async (id) => {
        try {
            const payload = { params: { id } };
            const data = await apiRequest(apiRoutes.viewExerciseSubscription, 'POST', payload, router);
            if (data?.response) {
                const plan = data?.data;
                setForm({
                    planName: plan?.planName || '',
                    planAmount: plan?.planAmount || '',
                    durationMonths: plan?.durationMonths || '',
                    deviceType: plan?.deviceType || '',
                    // status: plan?.status || '',
                });
                setViewform(plan);
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

        if (!form.planName || !form.planAmount || !form.durationMonths || !form.deviceType) {
            setButtonLoading(false);
            showError('Please Fill Forms');
            return;
        }

        if (form.deviceType === 'ios') {
            const checkAmount = IOS_AMOUNT_OPTIONS.find(option => option.value === form.planAmount);
            console.log('checkAmount', checkAmount)
            if (!checkAmount) {
                setButtonLoading(false);
                showError('Please select a valid amount for IOS');
                return;
            }
        }

        let updateForm = { ...form };

        if (isEdit) {
            updateForm = {
                ...viewform,
                ...form,
            };
        }
        const payload = {
            params: {
                id,
                planName: updateForm.planName,
                planAmount: updateForm.planAmount,
                durationMonths: updateForm.durationMonths,
                deviceType: updateForm.deviceType,
                // status: updateForm.status,
            }
        };
        manageExercisePlan(payload);
    };
    const manageExercisePlan = async (payload) => {
        console.log('payload', payload)
        const action = isEdit ? apiRoutes.updateExerciseSubscription : apiRoutes.addExerciseSubscription;

        try {
            const data = await apiRequest(action, 'POST', payload, router);
            if (data?.response) {
                showSuccess(isEdit ? 'Exercise Plan updated successfully!' : 'Exercise Plan added successfully!');
                // handleClear();
                router.push('/exercise-plan');
            } else {
                setButtonLoading(false);
                setFormSubmitted(false);
            }
        } catch (error) {
            console.error('Failed to save plan:', error);
            setButtonLoading(false);
        }
    };
    const handleSelectIosAmount = (item) => {
        console.log(item)
        setForm((prev) => ({
            ...prev,
            planAmount: item.value,
        }));
        console.log('form', form.planAmount)
    }
    const handleDeviceTypeChange = (e) => {
        const value = e.target.value;
        console.log('deviceType', value)
        setForm((prevForm) => ({
            ...prevForm,
            deviceType: value,
        }));
    };
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />
            <div className="col-4 bg-white p-3 rounded">
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-12 mb-2">
                            <RadioGroup
                                label="Device Type"
                                name="deviceType"
                                options={deviceOptions}
                                selectedValue={form.deviceType}
                                onChange={handleDeviceTypeChange}
                                required={true}
                            />
                        </div>

                        <div className="col-md-12 mb-1">
                            <Input
                                name="planName"
                                label="Plan Name"
                                value={form.planName}
                                formSubmitted={formSubmitted}
                                required
                                onChange={(e) => setForm({ ...form, planName: e.target.value })}
                            />
                        </div>


                        {form.deviceType === 'android' && (
                            <div className="col-md-12 mb-4">
                                <Input
                                    name="planAmount"
                                    label="Plan Amount"
                                    type='number'
                                    value={form.planAmount}
                                    formSubmitted={formSubmitted}
                                    required
                                    onChange={(e) => setForm({ ...form, planAmount: e.target.value })}
                                />
                            </div>
                        )}
                        {form.deviceType === 'ios' && (
                            <div className="col-md-12 mb-4">
                                <AutoCompleteInput
                                    label="Plan Amount"
                                    options={IOS_AMOUNT_OPTIONS}
                                    required
                                    formSubmitted={formSubmitted}
                                    onSelect={handleSelectIosAmount}
                                    value={form.planAmount}
                                />
                            </div>
                        )}
                        <div className="col-md-12 mb-4">
                            <AutoCompleteInput
                                label="Duration In Months"
                                options={months}
                                required
                                formSubmitted={formSubmitted}
                                onSelect={handleSelect}
                                value={form.durationMonths}
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


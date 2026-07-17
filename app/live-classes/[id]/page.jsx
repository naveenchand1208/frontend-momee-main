'use client';
import './page.css';
import { useState, useEffect, useRef } from "react";
import Input from "@/components/shared/input/page";
import Button from "@/components/shared/button/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import { useRouter, useParams } from "next/navigation";
import RadioGroup from "@/components/shared/radio/page";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { objectToFormData } from "@/common/utils/util";
import { showError, showSuccess } from "@/common/toast/toastService";
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
import Textarea from '@/components/shared/textarea/page';
import ImageUpload from '@/components/shared/image/page';
import DateRangePicker from "@/components/shared/date-range/page";
import CustomTimeInput from '@/components/shared/time-range/page';
import { IOS_AMOUNT_OPTIONS } from '@/common/constants/enum';
import AutoCompleteInput from '@/components/shared/autocomplete/page';
// import { useDispatch } from 'react-redux';
// import { setCurrentDetails } from '@/common/store/auth/liveSessionSlice';
export default function AddLiveClasses() {
    const [form, setForm] = useState({
        name: '',
        status: 'Active',
        file: '',
        fromDate: '',
        toDate: '',
        startTime: '',
        endTime: '',
        momType: '',
        performedBy: '',
        amount: '',
        description: '',
        MeetingLink: '',
        deviceType: '',
    });
    const { id } = useParams();
    const router = useRouter();
    // const dispatch = useDispatch();
    const fetchApiRef = useRef();
    const viewApiRef = useRef();
    const formRef = useRef(null);
    const isEdit = id !== 'add';
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [viewLiveClass, setViewLiveClass] = useState({});
    const [backLoading, setBackLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ fromDate: '', toDate: '' });
    const [timeRange, setTimeRange] = useState({ startTime: '', endTime: '' });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Live Classes', href: '/live-classes' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/live-classes/${id}` : '/live-classes/add'
        },
    ];
    const breadcrumbAction = {
        label: 'Back',
        type: 'button',
        size: 'extraSmall',
        backgroundColor: Colors.Primary1,
        isLoading: backLoading,
        onClick: () => handleBackButton(),
    };
    const momTypeOptions = [
        { label: 'Preg Mom', value: 'pregMom' },
        { label: 'New Mom', value: 'newMom' },
    ];
    const deviceOptions = [
        { label: 'Android', value: 'android' },
        { label: 'IOS', value: 'ios' },
    ];
    useEffect(() => {
        if (isEdit) {
            setIsLoading(false);
        }
        if (fetchApiRef.current) return;
        fetchApiRef.current = true;
    }, [id]);
    useEffect(() => {
        if (isEdit && !viewApiRef.current) {
            viewApiRef.current = true;
            viewLiveClasses(id);
        }
    }, []);
    const handleDateChange = ({ fromDate, toDate }) => {
        console.log("Date range:", fromDate, toDate);
        setDateRange({
            fromDate: fromDate,
            toDate: toDate,
        })
    };
    const handleTimeChange = ({ startTime, endTime }) => {
        console.log('Selected times:', { startTime, endTime });
        setTimeRange({ startTime, endTime });
    };
    const handleBackButton = () => {
        setBackLoading(true);
        router.push('/live-classes');
    }
    const handleMomTypeChange = async (e) => {
        const value = e.target.value;
        console.log("Radio selected:", value);
        setForm(prev => ({
            ...prev,
            momType: value,
        }));
        setViewLiveClass(prev => ({
            ...prev,
            momType: value,
        }));
    };
    const viewLiveClasses = async (id) => {
        try {
            const payload = { params: { id } }
            const data = await apiRequest(apiRoutes.viewLiveSession, 'POST', payload, router);
            if (data?.response) {
                const live = data?.data;
                // dispatch(setCurrentDetails(live));
                //  dispatch(setUsers(live?.users || []));
                setForm({
                    name: live?.name || '',
                    file: live?.file || '',
                    performedBy: live?.performedBy || '',
                    amount: live?.amount || '',
                    status: live?.status || '',
                    MeetingLink: live?.MeetingLink || '',
                    description: live?.description || '',
                    momType: live?.momType || '',
                    deviceType: (live?.deviceType || '').toLowerCase(),
                    pregMom: live?.momType === 'pregMom',
                    newMom: live?.momType === 'newMom',
                });
                setDateRange({
                    fromDate: live?.fromDate || '',
                    toDate: live?.toDate || '',
                });

                setTimeRange({
                    startTime: live?.startTime || '',
                    endTime: live?.endTime || '',
                });

                setPreviewUrl(live?.file || '');
                setViewLiveClass(live)
                setIsLoading(false)
            }
        } catch (error) {
            console.log('error', error)
        }
    }
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     setFormSubmitted(true);
    //     setSubmitLoading(true);
    //     const updatedForm = {
    //         ...form,
    //         fromDate: dateRange.fromDate,
    //         toDate: dateRange.toDate,
    //         startTime: timeRange.startTime,
    //         endTime: timeRange.endTime,
    //     };
    //     if (
    //         !updatedForm.name ||
    //         !updatedForm.file ||
    //         !updatedForm.fromDate ||
    //         !updatedForm.toDate ||
    //         !updatedForm.startTime ||
    //         !updatedForm.endTime ||
    //         !updatedForm.amount ||
    //         !updatedForm.MeetingLink ||
    //         !updatedForm.description ||
    //         !updatedForm.performedBy ||
    //         !updatedForm.momType
    //     ) {
    //         showError('Please fill in all required fields.');
    //         setSubmitLoading(false);
    //         return;
    //     }

    //     let finalForm;
    //     if (isEdit) {
    //         const isFileChanged = updatedForm.file !== viewLiveClass.file;
    //         finalForm = {
    //             ...viewLiveClass,
    //             ...updatedForm,
    //             id,
    //             fileChanged: isFileChanged,
    //         };
    //     }
    //     const formData = objectToFormData(isEdit ? finalForm : updatedForm);
    //     manageLiveSession(formData);
    // };
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setSubmitLoading(true);

        const updatedForm = {
            ...form,
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
            startTime: timeRange.startTime,
            endTime: timeRange.endTime,
            deviceType: form.deviceType,
        };

        // Basic validation
        if (
            !updatedForm.name ||
            !updatedForm.file ||
            !updatedForm.fromDate ||
            !updatedForm.toDate ||
            !updatedForm.startTime ||
            !updatedForm.endTime ||
            !updatedForm.amount ||
            !updatedForm.MeetingLink ||
            !updatedForm.description ||
            !updatedForm.performedBy ||
            !updatedForm.momType ||
            !updatedForm.deviceType
        ) {
            showError('Please fill in all required fields.');
            setSubmitLoading(false);
            return;
        }

        if (updatedForm.deviceType === 'ios') {
            const checkAmount = IOS_AMOUNT_OPTIONS.find(option => option.value === updatedForm.amount);
            if (!checkAmount) {
                showError('Please select a valid amount for IOS');
                setSubmitLoading(false);
                return;
            }
        }

        let finalForm;

        if (isEdit) {
            const isFileChanged = updatedForm.file !== viewLiveClass.file;

            finalForm = {
                ...viewLiveClass,
                ...updatedForm,
                id,
                fileChanged: isFileChanged,
                // Include the previous public_id so the backend can delete the old file if needed
                public_id: viewLiveClass.public_id,
            };
        }

        const formData = objectToFormData(isEdit ? finalForm : updatedForm);
        manageLiveSession(formData);
    };

    const manageLiveSession = async (formData) => {
        const action = !isEdit ? apiRoutes.addLiveSession : apiRoutes.updateLiveSession
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                const message = isEdit ? 'Live Session updated successfully!' : 'Live Session added successfully!';
                showSuccess(message);
                router.push('/live-classes')
            }
            setFormSubmitted(false);
            setSubmitLoading(false);

        } catch (error) {
            setFormSubmitted(false);
            setSubmitLoading(false);
        }
    }
    const handleDeviceTypeChange = (e) => {
        const value = e.target.value;
        setForm((prevForm) => ({
            ...prevForm,
            deviceType: value,
        }));
    };
    const handleSelectIosAmount = (item) => {
        console.log(item)
        setForm((prev) => ({
            ...prev,
            amount: item.value,
        }));
        console.log('form', form.amount)
    }
    return (
        <div className="max-w-6xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />
            {isLoading ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        width: '100%',
                    }}
                >
                    <CircularProgress />
                </div>
            ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="d-flex gap-3">
                    <div className="custom-form row" style={{ width: '100%', height: 'max-content' }}>

                        <div className='col-12 col-sm-6 col-md-4'>
                            {/* <label className="" style={{ fontSize: '13px', fontWeight: '500' }}>Mom Type</label> */}
                            <div className="d-flex gap-3 mt-1">
                                <RadioGroup
                                    label="Mom Type"
                                    name="momType"
                                    options={momTypeOptions}
                                    selectedValue={form.momType}
                                    onChange={handleMomTypeChange}
                                    required={true}
                                />
                            </div>
                        </div>
                        <div className='col-12 col-sm-6 col-md-4'>
                            <RadioGroup
                                label="Device Type"
                                name="deviceType"
                                options={deviceOptions}
                                selectedValue={form.deviceType}
                                onChange={handleDeviceTypeChange}
                                required={true}
                            />
                        </div>
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
                            <Input
                                label="Name"
                                name="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                            />
                        </div>
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
                            <Input
                                label="Performed By"
                                name="performedBy"
                                value={form.performedBy}
                                onChange={(e) => setForm({ ...form, performedBy: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                            />
                        </div>

                        <div className="mt-2 col-12 col-sm-6 col-md-4">
                            <Input
                                label="Meeting Link"
                                name="MeetingLink"
                                value={form.MeetingLink}
                                onChange={(e) => setForm({ ...form, MeetingLink: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                            />
                        </div>
                        {form.deviceType === 'android' && (
                            <div className="mt-2 col-12 col-sm-6 col-md-4">
                                <Input
                                    label="Amount"
                                    name="amount"
                                    type='number'
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    disabled={!form.momType}
                                />
                            </div>
                        )}
                        {form.deviceType === 'ios' && (
                            <div className="mt-2 col-12 col-sm-6 col-md-4">
                                <AutoCompleteInput
                                    label="Plan Amount"
                                    options={IOS_AMOUNT_OPTIONS}
                                    required
                                    formSubmitted={formSubmitted}
                                    onSelect={handleSelectIosAmount}
                                    value={form.amount}
                                />
                            </div>
                        )}
                        <div style={{ width: '350px', marginTop: '11px' }}>
                            <DateRangePicker onChange={handleDateChange} value={dateRange} required={true} formSubmitted={formSubmitted} />
                        </div>
                        <div className='d-flex gap-3 flex-wrap mt-2'>

                            <div className="mt-2 col-12 col-sm-6 col-md-4">
                                <Textarea
                                    label="Description"
                                    name="description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    disabled={!form.momType}
                                />
                            </div>
                            <div className="mt-[1.9rem] col-12 col-sm-6 col-md-4 mb-4">
                                <ImageUpload
                                    label="Thumbnail"
                                    format="image"
                                    parentFile={previewUrl}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    disabled={!form.momType}
                                    onFileSelect={(file) => {
                                        const previewUrl = URL.createObjectURL(file);
                                        setForm({ ...form, file });
                                        setPreviewUrl(previewUrl)
                                    }}
                                />
                            </div>
                            <div style={{ marginLeft: '-10px', width: '28%', marginTop: '2px' }}>
                                <CustomTimeInput onChange={handleTimeChange} value={timeRange} required={true} formSubmitted={formSubmitted} />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                label={isEdit ? "Update" : "Save"}
                                type="submit"
                                size="small"
                                color="#fff"
                                backgroundColor={Colors.Primary2}
                                isLoading={submitLoading}
                                disabled={!form.momType}
                            />
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

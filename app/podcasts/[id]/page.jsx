'use client';
import './page.css';
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/shared/input/page";
import AutoCompleteInput from "@/components/shared/autocomplete/page";
import Button from "@/components/shared/button/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import FileUpload from "@/components/shared/file/page";
import RadioGroup from "@/components/shared/radio/page";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { getMonths, getWeeks, objectToFormData } from "@/common/utils/util";
import { showError, showSuccess } from "@/common/toast/toastService";
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
export default function AddPodCasts() {
    const [form, setForm] = useState({
        title: '',
        status: 'Active',
        file: '',
        music: '',
        momType: '',
        // month: '',
        // week: '',
    });
    const { id } = useParams();
    const router = useRouter();
    const formRef = useRef(null);
    const viewApiRef = useRef();
    const isEdit = id !== 'add';
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
    const [viewPodCasts, setViewPodCasts] = useState({});
    // const [weeks, setWeeks] = useState('');
    // const [months, setMonths] = useState('');
    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Podcasts', href: '/podcasts' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/podcasts/${id}` : '/podcasts/add'
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
    // useEffect(() => {
    //     const month = getMonths(12);
    //     setMonths(month);
    //     const week = getWeeks();
    //     console.log('week', week)
    //     setWeeks(week);
    // }, []);
    useEffect(() => {
        // if (isEdit && weeks.length > 0 && !viewApiRef.current) {
        if (isEdit && !viewApiRef.current) {
            viewApiRef.current = true;
            viewPodcasts(id);
        }
    }, [isEdit, id]);
    // }, [ id]);
    const viewPodcasts = async (id) => {
        try {
            setIsLoading(true)
            const payload = { params: { id } }
            const data = await apiRequest(apiRoutes.viewPodCasts, 'POST', payload, router);
            if (data?.response) {
                const podcasts = data?.data;
                // console.log('podcasts', weeks)
                setForm({
                    title: podcasts?.title || '',
                    status: podcasts?.status || '',
                    file: podcasts?.file || '',
                    music: podcasts?.music || '',
                    momType: podcasts.momType,
                    // week: weeks.find(wk => wk.label === podcasts.week)?.label || '',
                    // month: podcasts.month,
                });
                setViewPodCasts(podcasts)
                setPreviewUrl(podcasts.file)
                setAudioPreviewUrl(podcasts.music);
                setIsLoading(false)
            }
        } catch (error) {
            console.log('error', error)
        }
    }
    const handleMomTypeChange = async (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            momType: value,
            // month: '',
            // week: '',
        }));
        setViewPodCasts(prev => ({
            ...prev,
            momType: value,
            // month: '',
            // week: '',
        }));
    };
    const handleMonthSelect = (item) => {
        // setForm((prev) => ({
        //     ...prev,
        //     month: item.label,
        // }));
    };
    const handleWeekSelect = (item) => {
        // setForm((prev) => ({
        //     ...prev,
        //     week: item.label,
        // }));
    };
    const handleBackButton = () => {
        setBackLoading(true);
        router.push('/podcasts');
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        if (!form.title || !form.music || !form.file) {
            // showError('Invalid Form');
            setButtonLoading(false);
            return;
        }
        // if (form.momType === 'pregMom' && !form.week) {
        //     showError('Please Select Week');
        //     setFormSubmitted(false);
        //     setButtonLoading(false);
        //     return;
        // }
        // if (form.momType === 'newMom' && !form.month) {
        //     showError('Please Select Month');
        //     setFormSubmitted(false);
        //     setButtonLoading(false);
        //     return;
        // }
        let updateForm;
        if (isEdit) {
            const isFileChanged = form.file !== viewPodCasts.file;
            const isMusicChanged = form.music !== viewPodCasts.music;
            updateForm = {
                ...viewPodCasts,
                ...form,
                id,
                fileChanged: isFileChanged,
                musicChanged: isMusicChanged,
            };
        }
        const formData = objectToFormData(!isEdit ? form : updateForm)
        managePodcasts(formData)
    };
    const managePodcasts = async (formData) => {
        const action = !isEdit ? apiRoutes.addPodCasts : apiRoutes.updatePodCasts
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                console.log('coming')
                const message = isEdit ? 'Podcast updated successfully!' : 'Podcast added successfully!';
                showSuccess(message);
                router.push('/podcasts')
            }
            setFormSubmitted(false);
            setButtonLoading(false);
        } catch (error) {
            setFormSubmitted(false);
            setButtonLoading(false);
        }
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
                <form ref={formRef} onSubmit={handleSubmit} className="">
                    <div className="custom-form" style={{ width: '50%', height: 'max-content' }}>
                        <label className="" style={{ fontSize: '13px', fontWeight: '500' }}>Mom Type</label>
                        <div className="d-flex gap-3 mt-1">
                            <RadioGroup
                                name="momType"
                                options={momTypeOptions}
                                selectedValue={form.momType}
                                onChange={handleMomTypeChange}
                                required
                            />
                        </div>
                        <div className="mt-2">
                            <Input
                                label="Title"
                                name="title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                            />
                        </div>
                        <div className="mt-2">
                            <FileUpload
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
                        <div className="mt-2">
                            <FileUpload
                                label="Music"
                                accept="audio/*"
                                format="audio"
                                parentFile={audioPreviewUrl}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                                onFileSelect={(file) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    setForm({ ...form, music: file });
                                    setAudioPreviewUrl(previewUrl);
                                }}
                            />
                        </div>
                        {/* {form.momType === 'newMom' ? (
                            <div className="mt-2" >
                                <AutoCompleteInput
                                    label="Month"
                                    options={months}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    onSelect={handleMonthSelect}
                                    value={form.month}
                                    disabled={!form.momType}
                                />
                            </div>
                        ) : (
                            <div className="mt-2">
                                <AutoCompleteInput
                                    label="Week"
                                    options={weeks}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    onSelect={handleWeekSelect}
                                    value={form.week}
                                    disabled={!form.momType}
                                />
                            </div>
                        )} */}
                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                label={isEdit ? "Update" : "Save"}
                                type="submit"
                                size="small"
                                color="#fff"
                                backgroundColor={Colors.Primary2}
                                isLoading={buttonLoading}
                                disabled={!form.momType}
                            />
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}


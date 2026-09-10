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

import {
    showError,
    showSuccess
} from "@/common/toast/toastService";

import { Colors } from '@/common/constants/colorEnum';

import { CircularProgress } from '@mui/material';

import Textarea from '@/components/shared/textarea/page';

import ImageUpload from '@/components/shared/image/page';

import DateRangePicker from "@/components/shared/date-range/page";

import CustomTimeInput from '@/components/shared/time-range/page';

import {
    IOS_AMOUNT_OPTIONS
} from '@/common/constants/enum';

import AutoCompleteInput from '@/components/shared/autocomplete/page';


export default function AddLiveClasses() {

    const { id } = useParams();

    const router = useRouter();

    const fetchApiRef = useRef();
    const viewApiRef = useRef();
    const formRef = useRef(null);

    const isEdit = id !== 'add';


    // =========================================================
    // FORM
    // =========================================================

    const [form, setForm] = useState({

        // English
        name: '',

        // Tamil
        nameTa: '',

        status: 'Active',

        file: '',

        fromDate: '',
        toDate: '',

        startTime: '',
        endTime: '',

        momType: '',

        // English
        performedBy: '',

        // Tamil
        performedByTa: '',

        amount: '',

        // English
        description: '',

        // Tamil
        descriptionTa: '',

        // Meeting Link ONLY ONE
        MeetingLink: '',

        deviceType: '',
    });


    // =========================================================
    // OTHER STATES
    // =========================================================

    const [formSubmitted, setFormSubmitted] = useState(false);

    const [previewUrl, setPreviewUrl] = useState('');

    const [viewLiveClass, setViewLiveClass] = useState({});

    const [backLoading, setBackLoading] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [submitLoading, setSubmitLoading] = useState(false);

    const [dateRange, setDateRange] = useState({
        fromDate: '',
        toDate: ''
    });

    const [timeRange, setTimeRange] = useState({
        startTime: '',
        endTime: ''
    });


    // =========================================================
    // BREADCRUMB
    // =========================================================

    const breadcrumbItems = [

        {
            label: 'Content Management'
        },

        {
            label: 'Live Classes',
            href: '/live-classes'
        },

        {
            label: isEdit ? 'Edit' : 'Add',

            href: isEdit
                ? `/live-classes/${id}`
                : '/live-classes/add'
        }

    ];


    const breadcrumbAction = {

        label: 'Back',

        type: 'button',

        size: 'extraSmall',

        backgroundColor: Colors.Primary1,

        isLoading: backLoading,

        onClick: () => handleBackButton(),

    };


    // =========================================================
    // OPTIONS
    // =========================================================

    const momTypeOptions = [

        {
            label: 'Preg Mom',
            value: 'pregMom'
        },

        {
            label: 'New Mom',
            value: 'newMom'
        }

    ];


    const deviceOptions = [

        {
            label: 'Android',
            value: 'android'
        },

        {
            label: 'IOS',
            value: 'ios'
        }

    ];


    // =========================================================
    // INITIAL EFFECT
    // =========================================================

    useEffect(() => {

        if (isEdit) {

            setIsLoading(true);

        }

        if (fetchApiRef.current) {
            return;
        }

        fetchApiRef.current = true;

    }, [id]);


    // =========================================================
    // LOAD EDIT DATA
    // =========================================================

    useEffect(() => {

        if (isEdit && !viewApiRef.current) {

            viewApiRef.current = true;

            viewLiveClasses(id);

        }

    }, [isEdit, id]);


    // =========================================================
    // DATE CHANGE
    // =========================================================

    const handleDateChange = ({
        fromDate,
        toDate
    }) => {

        console.log(
            "Date range:",
            fromDate,
            toDate
        );

        setDateRange({

            fromDate: fromDate,

            toDate: toDate,

        });

    };


    // =========================================================
    // TIME CHANGE
    // =========================================================

    const handleTimeChange = ({
        startTime,
        endTime
    }) => {

        console.log(
            'Selected times:',
            {
                startTime,
                endTime
            }
        );

        setTimeRange({
            startTime,
            endTime
        });

    };


    // =========================================================
    // BACK
    // =========================================================

    const handleBackButton = () => {

        setBackLoading(true);

        router.push('/live-classes');

    };


    // =========================================================
    // MOM TYPE
    // =========================================================

    const handleMomTypeChange = (e) => {

        const value = e.target.value;

        console.log(
            "Radio selected:",
            value
        );

        setForm(prev => ({

            ...prev,

            momType: value,

        }));

    };


    // =========================================================
    // VIEW LIVE SESSION
    // =========================================================

    const viewLiveClasses = async (sessionId) => {

        try {

            const payload = {

                params: {
                    id: sessionId,
                    admin: true
                }

            };

            const data = await apiRequest(
                apiRoutes.viewLiveSession,
                'POST',
                payload,
                router
            );


            if (data?.response) {

                const live = data?.data;


                console.log(
                    'LIVE SESSION VIEW:',
                    live
                );


                setForm({

                    // English
                    name: live?.name || '',

                    // Tamil
                    nameTa:
                        live?.translations?.ta?.name || '',


                    file:
                        live?.file || '',


                    // English
                    performedBy:
                        live?.performedBy || '',

                    // Tamil
                    performedByTa:
                        live?.translations?.ta?.performedBy || '',


                    amount:
                        live?.amount || '',


                    status:
                        live?.status || 'Active',


                    // ONLY ONE MEETING LINK
                    MeetingLink:
                        live?.MeetingLink || '',


                    // English
                    description:
                        live?.description || '',

                    // Tamil
                    descriptionTa:
                        live?.translations?.ta?.description || '',


                    momType:
                        live?.momType || '',


                    deviceType:
                        (live?.deviceType || '').toLowerCase(),

                });


                setDateRange({

                    fromDate:
                        live?.fromDate || '',

                    toDate:
                        live?.toDate || '',

                });


                setTimeRange({

                    startTime:
                        live?.startTime || '',

                    endTime:
                        live?.endTime || '',

                });


                setPreviewUrl(
                    live?.file || ''
                );


                setViewLiveClass(live);


                setIsLoading(false);

            }

        } catch (error) {

            console.error(
                'Error loading live session:',
                error
            );

            setIsLoading(false);

        }

    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = (e) => {

        e.preventDefault();


        setFormSubmitted(true);

        setSubmitLoading(true);


        // =====================================================
        // MERGE DATE + TIME
        // =====================================================

        const updatedForm = {

            ...form,

            fromDate:
                dateRange.fromDate,

            toDate:
                dateRange.toDate,

            startTime:
                timeRange.startTime,

            endTime:
                timeRange.endTime,

        };


        console.log(
            '========== LIVE SESSION VALIDATION =========='
        );

        console.log(
            'name:',
            updatedForm.name
        );

        console.log(
            'nameTa:',
            updatedForm.nameTa
        );

        console.log(
            'performedBy:',
            updatedForm.performedBy
        );

        console.log(
            'performedByTa:',
            updatedForm.performedByTa
        );

        console.log(
            'description:',
            updatedForm.description
        );

        console.log(
            'descriptionTa:',
            updatedForm.descriptionTa
        );

        console.log(
            'MeetingLink:',
            updatedForm.MeetingLink
        );

        console.log(
            'amount:',
            updatedForm.amount
        );

        console.log(
            'momType:',
            updatedForm.momType
        );

        console.log(
            'deviceType:',
            updatedForm.deviceType
        );

        console.log(
            'fromDate:',
            updatedForm.fromDate
        );

        console.log(
            'toDate:',
            updatedForm.toDate
        );

        console.log(
            'startTime:',
            updatedForm.startTime
        );

        console.log(
            'endTime:',
            updatedForm.endTime
        );

        console.log(
            'file:',
            updatedForm.file
        );


        // =====================================================
        // REQUIRED FIELD VALIDATION
        // =====================================================

        const requiredFields = [

            {
                key: 'name',
                label: 'Name'
            },

            {
                key: 'nameTa',
                label: 'Name (Tamil)'
            },

            {
                key: 'fromDate',
                label: 'From Date'
            },

            {
                key: 'toDate',
                label: 'To Date'
            },

            {
                key: 'startTime',
                label: 'Start Time'
            },

            {
                key: 'endTime',
                label: 'End Time'
            },

            {
                key: 'amount',
                label: 'Amount'
            },

            {
                key: 'MeetingLink',
                label: 'Meeting Link'
            },

            {
                key: 'description',
                label: 'Description'
            },

            {
                key: 'descriptionTa',
                label: 'Description (Tamil)'
            },

            {
                key: 'performedBy',
                label: 'Performed By'
            },

            {
                key: 'performedByTa',
                label: 'Performed By (Tamil)'
            },

            {
                key: 'momType',
                label: 'Mom Type'
            },

            {
                key: 'deviceType',
                label: 'Device Type'
            }

        ];


        const missingField =
            requiredFields.find((field) => {

                const value =
                    updatedForm[field.key];

                return (
                    value === undefined ||
                    value === null ||
                    String(value).trim() === ''
                );

            });


        if (missingField) {

            showError(
                `Please fill in required field: ${missingField.label}`
            );

            setSubmitLoading(false);

            return;

        }


        // =====================================================
        // FILE VALIDATION
        // =====================================================

        if (!updatedForm.file) {

            showError(
                'Please select a thumbnail.'
            );

            setSubmitLoading(false);

            return;

        }


        // =====================================================
        // IOS AMOUNT VALIDATION
        // =====================================================

        if (
            updatedForm.deviceType === 'ios'
        ) {

            const checkAmount =
                IOS_AMOUNT_OPTIONS.find(
                    option =>
                        option.value ===
                        updatedForm.amount
                );


            if (!checkAmount) {

                showError(
                    'Please select a valid amount for IOS'
                );

                setSubmitLoading(false);

                return;

            }

        }


        // =====================================================
        // FINAL FORM
        // =====================================================

        let finalForm;


        if (isEdit) {

            // Only a real File means a new image was selected.
            const isFileChanged =
                updatedForm.file instanceof File;


            finalForm = {

                ...viewLiveClass,

                ...updatedForm,

                id: id,

                fileChanged:
                    isFileChanged,

                public_id:
                    viewLiveClass.public_id,

            };

        } else {

            finalForm = {

                ...updatedForm

            };

        }


        // =====================================================
        // FORM DATA
        // =====================================================

        const formData =
            objectToFormData(finalForm);


        // =====================================================
        // EXPLICIT ENGLISH + TAMIL FIELDS
        // =====================================================

        formData.set(
            'name',
            updatedForm.name
        );


        formData.set(
            'nameTa',
            updatedForm.nameTa
        );


        formData.set(
            'performedBy',
            updatedForm.performedBy
        );


        formData.set(
            'performedByTa',
            updatedForm.performedByTa
        );


        formData.set(
            'description',
            updatedForm.description
        );


        formData.set(
            'descriptionTa',
            updatedForm.descriptionTa
        );


        // ONLY ENGLISH MEETING LINK
        formData.set(
            'MeetingLink',
            updatedForm.MeetingLink
        );


        formData.set(
            'fromDate',
            updatedForm.fromDate
        );


        formData.set(
            'toDate',
            updatedForm.toDate
        );


        formData.set(
            'startTime',
            updatedForm.startTime
        );


        formData.set(
            'endTime',
            updatedForm.endTime
        );


        formData.set(
            'momType',
            updatedForm.momType
        );


        formData.set(
            'status',
            updatedForm.status
        );


        formData.set(
            'amount',
            updatedForm.amount
        );


        formData.set(
            'deviceType',
            updatedForm.deviceType
        );


        // =====================================================
        // FILE
        // =====================================================

        if (
            updatedForm.file instanceof File
        ) {

            formData.set(
                'file',
                updatedForm.file
            );

        }


        // =====================================================
        // EDIT ID
        // =====================================================

        if (isEdit) {

            formData.set(
                'id',
                id
            );

            formData.set(
                'fileChanged',
                String(
                    finalForm.fileChanged
                )
            );

        }


        // =====================================================
        // DEBUG FORM DATA
        // =====================================================

        console.log(
            '========== LIVE SESSION FORM DATA =========='
        );


        for (
            const [key, value]
            of formData.entries()
        ) {

            console.log(
                key,
                value
            );

        }


        // =====================================================
        // API
        // =====================================================

        manageLiveSession(formData);

    };


    // =========================================================
    // MANAGE LIVE SESSION
    // =========================================================

    const manageLiveSession = async (
        formData
    ) => {

        const action =
            !isEdit
                ? apiRoutes.addLiveSession
                : apiRoutes.updateLiveSession;


        try {

            const data =
                await apiRequest(
                    action,
                    'POST',
                    formData,
                    router
                );


            if (data?.response) {

                const message =
                    isEdit
                        ? 'Live Session updated successfully!'
                        : 'Live Session added successfully!';


                showSuccess(message);


                router.push(
                    '/live-classes'
                );

            } else {

                setFormSubmitted(false);

                setSubmitLoading(false);

            }

        } catch (error) {

            console.error(
                'Live Session API Error:',
                error
            );

            setFormSubmitted(false);

            setSubmitLoading(false);

        }

    };


    // =========================================================
    // DEVICE TYPE
    // =========================================================

    const handleDeviceTypeChange = (e) => {

        const value =
            e.target.value;


        setForm(prevForm => ({

            ...prevForm,

            deviceType:
                value,

        }));

    };


    // =========================================================
    // IOS AMOUNT
    // =========================================================

    const handleSelectIosAmount = (item) => {

        console.log(
            'Selected IOS amount:',
            item
        );


        setForm(prev => ({

            ...prev,

            amount:
                item.value,

        }));

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="max-w-6xl mx-auto mt-10">

            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />


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

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="d-flex gap-3"
                >

                    <div
                        className="custom-form row"
                        style={{
                            width: '100%',
                            height: 'max-content'
                        }}
                    >


                        {/* =====================================================
                            MOM TYPE
                        ===================================================== */}

                        <div className="col-12 col-sm-6 col-md-4">

                            <div className="d-flex gap-3 mt-1">

                                <RadioGroup

                                    label="Mom Type"

                                    name="momType"

                                    options={
                                        momTypeOptions
                                    }

                                    selectedValue={
                                        form.momType
                                    }

                                    onChange={
                                        handleMomTypeChange
                                    }

                                    required={true}

                                />

                            </div>

                        </div>


                        {/* =====================================================
                            DEVICE TYPE
                        ===================================================== */}

                        <div className="col-12 col-sm-6 col-md-4">

                            <RadioGroup

                                label="Device Type"

                                name="deviceType"

                                options={
                                    deviceOptions
                                }

                                selectedValue={
                                    form.deviceType
                                }

                                onChange={
                                    handleDeviceTypeChange
                                }

                                required={true}

                            />

                        </div>


                        {/* =====================================================
                            NAME
                        ===================================================== */}

                        <div className="mt-2 col-12 col-sm-6 col-md-4">

                            <Input

                                label="Name"

                                name="name"

                                value={
                                    form.name
                                }

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name:
                                            e.target.value
                                    })
                                }

                                required={true}

                                formSubmitted={
                                    formSubmitted
                                }

                                disabled={
                                    !form.momType
                                }

                            />

                        </div>


                        {/* =====================================================
                            NAME TAMIL
                        ===================================================== */}

                        <div className="mt-2 col-12 col-sm-6 col-md-4">

                            <Input

                                label="Name (Tamil)"

                                name="nameTa"

                                value={
                                    form.nameTa
                                }

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        nameTa:
                                            e.target.value
                                    })
                                }

                                required={true}

                                formSubmitted={
                                    formSubmitted
                                }

                                tamilKeyboard={true}

                                disabled={
                                    !form.momType
                                }

                            />

                        </div>


                        {/* =====================================================
                            PERFORMED BY
                        ===================================================== */}

                        <div className="mt-2 col-12 col-sm-6 col-md-4">

                            <Input

                                label="Performed By"

                                name="performedBy"

                                value={
                                    form.performedBy
                                }

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        performedBy:
                                            e.target.value
                                    })
                                }

                                required={true}

                                formSubmitted={
                                    formSubmitted
                                }

                                disabled={
                                    !form.momType
                                }

                            />

                        </div>


                        {/* =====================================================
                            PERFORMED BY TAMIL
                        ===================================================== */}

                        <div className="mt-2 col-12 col-sm-6 col-md-4">

                            <Input

                                label="Performed By (Tamil)"

                                name="performedByTa"

                                value={
                                    form.performedByTa
                                }

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        performedByTa:
                                            e.target.value
                                    })
                                }

                                required={true}

                                formSubmitted={
                                    formSubmitted
                                }

                                tamilKeyboard={true}

                                disabled={
                                    !form.momType
                                }

                            />

                        </div>


                        {/* =====================================================
                            MEETING LINK
                            ONLY ENGLISH
                        ===================================================== */}

                        <div className="mt-2 col-12 col-sm-6 col-md-4">

                            <Input

                                label="Meeting Link"

                                name="MeetingLink"

                                value={
                                    form.MeetingLink
                                }

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        MeetingLink:
                                            e.target.value
                                    })
                                }

                                required={true}

                                formSubmitted={
                                    formSubmitted
                                }

                                disabled={
                                    !form.momType
                                }

                            />

                        </div>


                        {/* =====================================================
                            ANDROID AMOUNT
                        ===================================================== */}

                        {form.deviceType === 'android' && (

                            <div className="mt-2 col-12 col-sm-6 col-md-4">

                                <Input

                                    label="Amount"

                                    name="amount"

                                    type="number"

                                    value={
                                        form.amount
                                    }

                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            amount:
                                                e.target.value
                                        })
                                    }

                                    required={true}

                                    formSubmitted={
                                        formSubmitted
                                    }

                                    disabled={
                                        !form.momType
                                    }

                                />

                            </div>

                        )}


                        {/* =====================================================
                            IOS AMOUNT
                        ===================================================== */}

                        {form.deviceType === 'ios' && (

                            <div className="mt-2 col-12 col-sm-6 col-md-4">

                                <AutoCompleteInput

                                    label="Plan Amount"

                                    options={
                                        IOS_AMOUNT_OPTIONS
                                    }

                                    required

                                    formSubmitted={
                                        formSubmitted
                                    }

                                    onSelect={
                                        handleSelectIosAmount
                                    }

                                    value={
                                        form.amount
                                    }

                                />

                            </div>

                        )}


                        {/* =====================================================
                            DATE
                        ===================================================== */}

                        <div
                            style={{
                                width: '350px',
                                marginTop: '11px'
                            }}
                        >

                            <DateRangePicker

                                onChange={
                                    handleDateChange
                                }

                                value={
                                    dateRange
                                }

                                required={true}

                                formSubmitted={
                                    formSubmitted
                                }

                            />

                        </div>


                        <div
                            className="d-flex gap-3 flex-wrap mt-2"
                        >


                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <div className="mt-2 col-12 col-sm-6 col-md-4">

                                <Textarea

                                    label="Description"

                                    name="description"

                                    value={
                                        form.description
                                    }

                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description:
                                                e.target.value
                                        })
                                    }

                                    required={true}

                                    formSubmitted={
                                        formSubmitted
                                    }

                                    disabled={
                                        !form.momType
                                    }

                                />

                            </div>


                            {/* =================================================
                                DESCRIPTION TAMIL
                            ================================================= */}

                            <div className="mt-2 col-12 col-sm-6 col-md-4">

                                <Textarea

                                    label="Description (Tamil)"

                                    name="descriptionTa"

                                    value={
                                        form.descriptionTa
                                    }

                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            descriptionTa:
                                                e.target.value
                                        })
                                    }

                                    required={true}

                                    formSubmitted={
                                        formSubmitted
                                    }

                                    tamilKeyboard={true}

                                    disabled={
                                        !form.momType
                                    }

                                />

                            </div>


                            {/* =================================================
                                THUMBNAIL
                            ================================================= */}

                            <div
                                className="mt-[1.9rem] col-12 col-sm-6 col-md-4 mb-4"
                            >

                                <ImageUpload

                                    label="Thumbnail"

                                    format="image"

                                    parentFile={
                                        previewUrl
                                    }

                                    required={true}

                                    formSubmitted={
                                        formSubmitted
                                    }

                                    disabled={
                                        !form.momType
                                    }

                                    onFileSelect={(file) => {

                                        const newPreviewUrl =
                                            URL.createObjectURL(
                                                file
                                            );

                                        setForm(prev => ({
                                            ...prev,
                                            file
                                        }));

                                        setPreviewUrl(
                                            newPreviewUrl
                                        );

                                    }}

                                />

                            </div>


                            {/* =================================================
                                TIME
                            ================================================= */}

                            <div
                                style={{
                                    marginLeft: '-10px',
                                    width: '28%',
                                    marginTop: '2px'
                                }}
                            >

                                <CustomTimeInput

                                    onChange={
                                        handleTimeChange
                                    }

                                    value={
                                        timeRange
                                    }

                                    required={true}

                                    formSubmitted={
                                        formSubmitted
                                    }

                                />

                            </div>

                        </div>


                        {/* =====================================================
                            SAVE / UPDATE
                        ===================================================== */}

                        <div className="d-flex justify-content-end mt-4">

                            <Button

                                label={
                                    isEdit
                                        ? "Update"
                                        : "Save"
                                }

                                type="submit"

                                size="small"

                                color="#fff"

                                backgroundColor={
                                    Colors.Primary2
                                }

                                isLoading={
                                    submitLoading
                                }

                                disabled={
                                    !form.momType
                                }

                            />

                        </div>

                    </div>

                </form>

            )}

        </div>

    );

}
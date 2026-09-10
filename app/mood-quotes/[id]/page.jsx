'use client';
import './page.css';
import { React, useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { showError, showSuccess } from "@/common/toast/toastService";
import Input from "@/components/shared/input/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import { Colors } from '@/common/constants/colorEnum';
import DatePicker from '@/components/shared/date/page';
import { convertToInputDate, formatDate, formatToDateInput } from '@/common/utils/util';
export default function AddQuotes() {
    const moodEmojis = {
        0: '😞', 1: '😰', 2: '😤', 3: '😡', 4: '😢',
        5: '😐', 6: '😴', 7: '🙂', 8: '😊', 9: '💪',
        10: '🙏', 11: '🏆', 12: '😃', 13: '🤩', 14: '❤️'
    };

    // const initialFormState = {
    //     date: '',
    //     quotes: Object.fromEntries(Object.keys(moodEmojis).concat('default').map(k => [k, '']))
    // };
    const initialFormState = {
    date: '',

    // English
    quotes: Object.fromEntries(
        Object.keys(moodEmojis)
            .concat('default')
            .map(k => [k, ''])
    ),

    // Tamil
    quotesTa: Object.fromEntries(
        Object.keys(moodEmojis)
            .concat('default')
            .map(k => [k, ''])
    )
};

    const { id } = useParams();
    const router = useRouter();
    const viewApiRef = useRef();
    const [form, setForm] = useState(initialFormState);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Mood Quotes', href: '/mood-quotes' },
        { label: isEdit ? 'Edit' : 'Add', href: isEdit ? `/quotes/${id}` : '/quotes/add' },
    ];

    const breadcrumbAction = {
        label: 'Back',
        type: 'button',
        size: 'extraSmall',
        backgroundColor: Colors.Primary1,
        onClick: () => router.push('/mood-quotes'),
    };

    useEffect(() => {
        if (id) setIsEdit(id !== 'add');
    }, [id]);

    useEffect(() => {
        if (isEdit && !viewApiRef.current) {
            viewApiRef.current = true;
            setIsLoading(true);
            viewQuotes(id);
        }
    }, [isEdit]);

    const viewQuotes = async (id) => {
        try {
            const payload = { params: { id } };
            const data = await apiRequest(apiRoutes.viewMoodQuotes, "POST", payload, router);

            if (data?.response) {
                const quotesData = data?.data;

                // setForm({
                //     id: quotesData.id || "",
                //     date: convertToInputDate(quotesData.date) || "",
                //     quotes: quotesData.quotes || {},
                // });
                setForm({
                    id: quotesData.id || '',

                    date:
                        convertToInputDate(
                            quotesData.date
                        ) || '',

                    // English
                    quotes:
                        quotesData.quotes || {},

                    // Tamil
                    quotesTa:
                        quotesData?.translations?.ta?.quotes || {}
                });

                setIsLoading(false);
            }
        } catch {
            setIsLoading(false);
        }
    };

    const handleQuoteChange = (key, value) => {
        setForm(prev => ({
            ...prev,
            quotes: { ...prev.quotes, [key]: value }
        }));
    };
    const handleTamilQuoteChange = (key, value) => {
        setForm(prev => ({
            ...prev,
            quotesTa: {
                ...prev.quotesTa,
                [key]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    setButtonLoading(true);

    if (!form.date) {
        showError('Please select a date');
        setButtonLoading(false);
        return;
    }

    const payload = {
        params: {
            id: form.id,
            date: form.date,

            // English
            quotes: form.quotes,

            // Tamil
            quotesTa: form.quotesTa
        }
    };

    console.log(
        '========== MOOD QUOTES PAYLOAD =========='
    );

    console.log('English:', form.quotes);
    console.log('Tamil:', form.quotesTa);

    const action =
        !isEdit
            ? apiRoutes.addMoodQuotes
            : apiRoutes.updateMoodQuotes;

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
                    ? 'Quotes updated successfully!'
                    : 'Quotes added successfully!'
            );

            router.push('/mood-quotes');
        }

    } catch (error) {

        console.error(
            'Mood Quotes Error:',
            error
        );

        showError(
            'Something went wrong'
        );

    } finally {

        setButtonLoading(false);

    }
};

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setButtonLoading(true);

    //     if (!form.date) {
    //         showError('Please select a date');
    //         setButtonLoading(false);
    //         return;
    //     }

    //     const payload = { params: { id: form.id, date: form.date, quotes: form.quotes } };
    //     const action = !isEdit ? apiRoutes.addMoodQuotes : apiRoutes.updateMoodQuotes;

    //     try {
    //         const data = await apiRequest(action, 'POST', payload, router);
    //         if (data?.response) {
    //             showSuccess(isEdit ? 'Quotes updated successfully!' : 'Quotes added successfully!');
    //             router.push('/mood-quotes');
    //         }
    //     } catch {
    //         showError('Something went wrong');
    //     } finally {
    //         setButtonLoading(false);
    //     }
    // };

    return (
        <div className="max-w-6xl mx-auto mt-10">
            <div className="mb-6">
                <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-[400px] w-full">
                    <CircularProgress />
                </div>
            ) : (
                <div className="form-container">
                    <form onSubmit={handleSubmit} className="quote-form">

                        {/* Date + Default Quote in same row */}
                        <div className="header-section">
                            <div className="field-wrapper">
                                <DatePicker
                                    value={form.date}
                                    onChange={(date) => setForm({ ...form, date })}
                                />
                            </div>

                            <div className="field-wrapper">
                                <Input
                                    name="default"
                                    label='Default Quote'
                                    placeholder="Enter motivational quote..."
                                    value={form.quotes.default}
                                    onChange={(e) => handleQuoteChange('default', e.target.value)}
                                    title={form.quotes.default}
                                />
                            </div>

                            <Input
                                name="defaultTa"
                                label="Default Quote (Tamil)"
                                placeholder="தமிழ் வாசகத்தை உள்ளிடவும்..."
                                value={form.quotesTa.default}
                                onChange={(e) =>
                                    handleTamilQuoteChange(
                                        'default',
                                        e.target.value
                                    )
                                }
                                tamilKeyboard={true}
                                title={form.quotesTa.default}
                            />
                        </div>


                        <h3 className="mood-title">Mood-Based Quotes</h3>

                        <div className="mood-grid">
                            {Object.entries({
                                0: '😞 Sad', 1: '😰 Anxious', 2: '😤 Frustrated',
                                3: '😡 Angry', 4: '😢 Crying', 5: '😐 Neutral',
                                6: '😴 Tired', 7: '🙂 Calm', 8: '😊 Happy',
                                9: '💪 Strong', 10: '🙏 Grateful', 11: '🏆 Proud',
                                12: '😃 Excited', 13: '🤩 Inspired', 14: '❤️ Loving',
                            }).map(([key, mood]) => (
                                <div key={key} className="mood-card">
                                    <div className="emoji">{mood.split(' ')[0]}</div>
                                    <div className="mood-label">{mood.split(' ')[1]}</div>

                                    {/* <input
                                        type="text"
                                        placeholder="Write a quote..."
                                        value={form.quotes[key]}
                                        onChange={(e) => handleQuoteChange(key, e.target.value)}
                                        className="quote-input"
                                        title={form.quotes[key]}
                                    /> */}
                                    <input
                                        type="text"
                                        placeholder="Write English quote..."
                                        value={form.quotes[key]}
                                        onChange={(e) =>
                                            handleQuoteChange(
                                                key,
                                                e.target.value
                                            )
                                        }
                                        className="quote-input"
                                        title={form.quotes[key]}
                                    />

                                    <Input
                                        name={`quoteTa-${key}`}
                                        placeholder="தமிழ் வாசகம்..."
                                        value={form.quotesTa[key]}
                                        onChange={(e) =>
                                            handleTamilQuoteChange(
                                                key,
                                                e.target.value
                                            )
                                        }
                                        tamilKeyboard={true}
                                        title={form.quotesTa[key]}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="button-container">
                            <button type="submit" className="save-btn">
                                {buttonLoading ? 'Saving...' : isEdit ? 'Update Quotes' : 'Save Quotes'}
                            </button>
                        </div>

                    </form>
                </div>
            )}
        </div>
    );
}

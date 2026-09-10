'use client';
import '../[id]/page.css';
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/shared/input/page";
import AutoCompleteInput from "@/components/shared/autocomplete/page";
import Button from "@/components/shared/button/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import FileUpload from "@/components/shared/file/page";
import RichTextEditor from "@/components/shared/text-editor/page";
import RadioGroup from "@/components/shared/radio/page";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { getMonths, getWeeks, objectToFormData } from "@/common/utils/util";
import { showError, showSuccess } from "@/common/toast/toastService";
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
import { addArticle } from '@/common/store/auth/articleSlice';
import { useDispatch } from 'react-redux';
export default function AddArticle() {
    const [form, setForm] = useState({
        title: '',
        titleTa: '',
        status: 'Active',
        file: '',
        // banner: '',
        description: '',
        descriptionTa: '',
        duration: '',
        momType: '',
        category: '',
        categoryId: '',
        month: '',
        week: '',
    });
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const fetchApiRef = useRef();
    const viewApiRef = useRef();
    const isEdit = id !== 'add';
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [content, setContent] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    // const [bannerUrl, setBannerUrl] = useState('');
    const [categories, setCategories] = useState([]);
    const [viewArticle, setViewArticle] = useState({});
    const [weeks, setWeeks] = useState('');
    const [months, setMonths] = useState('');
    const editorRef = useRef(null);
    const [backLoading, setBackLoading] = useState(false);
    const formRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Articles', href: '/articles' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/articles/${id}` : '/articles/add'
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
    useEffect(() => {
        const month = getMonths(12);
        setMonths(month);
        const week = getWeeks();
        setWeeks(week);
    }, []);
    useEffect(() => {
        if (isEdit) {
            setIsLoading(true)
        }
        if (fetchApiRef.current) return;
        fetchApiRef.current = true;
        fetchCategories();
    }, [id]);
    useEffect(() => {
        if (isEdit && categories.length > 0 && !viewApiRef.current) {
            viewApiRef.current = true;
            viewArticles(id);
        }
    }, [categories]);
    const momTypeOptions = [
        { label: 'Preg Mom', value: 'pregMom' },
        { label: 'New Mom', value: 'newMom' },
    ];
    const fetchCategories = async (momType = "") => {
        if (!momType && !isEdit) {
            setIsLoading(false);
            return;
        }
        const payload = {
            params: {
                status: "Active",
                momType: momType || '',
                pagination: 'true',
                page: '1',
                limit: '10',
            },
        };

        try {
            const data = await apiRequest(apiRoutes.getArticlesCategoryList, 'POST', payload, router);
            if (data?.response) {
                const categories = data?.data?.docs.map(item => ({
                    ...item,
                    label: item.title
                }))
                setCategories(categories);
                setIsLoading(false)
            } else {
                console.error('Error fetching categories:', data?.message);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    const handleMonthSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            month: item.label,
        }));
    };
    const handleWeekSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            week: item.label,
        }));
    };
    const handleCategorySelect = (item) => {
        console.log('item', item)
        setForm((prev) => ({
            ...prev,
            category: item.title,
            categoryId: item.id,
        }));
    };
    const handleMomTypeChange = async (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            momType: value,
            category: '',
            categoryId: '',
            month: '',
            week: '',
        }));
        setViewArticle(prev => ({
            ...prev,
            momType: value,
            category: '',
            categoryId: '',
            month: '',
            week: '',
        }));
        await fetchCategories(value);
    };
    const handleEditorChange = (value) => {
        setContent(value);
        setForm((prev) => ({ ...prev, description: value }));
    };
    const handleBackButton = () => {
        setBackLoading(true);
        router.push('/articles');
    }
    const viewArticles = async (id) => {
        try {
            const payload = { params: { id } }
            console.log('Id', id);
            const data = await apiRequest(apiRoutes.viewArticles, 'POST', payload, router);
            if (data?.response) {
                const article = data?.data;
                setForm({
                    title: article?.title || '',
                    titleTa: article?.translations?.ta?.title || '',
                    status: article?.status || '',
                    file: article?.file || '',
                    // banner: article?.banner || '',
                    description: article?.description || '',
                    descriptionTa: article?.translations?.ta?.description || '',
                    duration: article?.duration || '',
                    categoryId: article?.categoryId || '',
                    category: categories.find(cat => cat.id === article.categoryId)?.title || '',
                    momType: article.momType,
                    week: article.week,
                    month: article.month,
                });
               // setContent(article.description)
               setContent(article.description || '')
                setViewArticle(article)
                setPreviewUrl(article.file)
                // setBannerUrl(article.banner)
                setIsLoading(false)
            }
        } catch (error) {
            console.log('error', error)
        }
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        if (!form.title || !form.titleTa || !form.duration || !form.file || !form.category) {
            // showError('Invalid Form');
            setButtonLoading(false);
            return;
        }
        if (form.description.length === 0) {
            showError('Please add at least one description');
            setFormSubmitted(false);
            setButtonLoading(false);
            return;
        }
        if (!form.descriptionTa || form.descriptionTa === '<p><br></p>'
        ) {
            showError('Please add Tamil description');
            setFormSubmitted(false);
            setButtonLoading(false);
            return;
        }
        if (form.momType === 'pregMom' && !form.week) {
            showError('Please Select Week');
            setFormSubmitted(false);
            return;
        }
        if (form.momType === 'newMom' && !form.month) {
            showError('Please Select Month');
            setFormSubmitted(false);
            return;
        }
        let updateForm;
        if (isEdit) {
            const isFileChanged = form.file !== viewArticle.file;
            // const isBannerChanged = form.banner !== viewArticle.banner;
            updateForm = {
                ...viewArticle,
                ...form,
                id,
                fileChanged: isFileChanged,
                // bannerChanged: isBannerChanged,
            };
        }
        const preparedForm = {
            ...(isEdit ? updateForm : form),
            duration: Number(form.duration),
            translations: {
                    en: {
                        title: form.title,
                        description: form.description
                    },
                    ta: {
                        title: form.titleTa,
                        description: form.descriptionTa
                    }
                }
        };

        const formData = objectToFormData(preparedForm);
        manageArticles(formData)
    };
    const manageArticles = async (formData) => {
        const action = !isEdit ? apiRoutes.addArticles : apiRoutes.updateArticles
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                console.log('data', formData);
                // dispatch(addArticle(data.data));
                const message = isEdit ? 'Article updated successfully!' : 'Article added successfully!';
                showSuccess(message);
                router.push('/articles')
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
                <form ref={formRef} onSubmit={handleSubmit} className="d-flex gap-3">
                    <div className="custom-form" style={{ width: '35%', height: 'max-content' }}>
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
                        <div className="mt-3">
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
                        <div className="mt-3">
                            <Input
                                label="Title (Tamil)"
                                name="titleTa"
                                value={form.titleTa}
                                onChange={(e) =>
                                    setForm({ ...form, titleTa: e.target.value })
                                }
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                                tamilKeyboard={true}
                            />
                        </div>
                        <div className="mt-3">
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
                        {/* <div className="mt-3">
                            <FileUpload
                                label="Banner"
                                format="image"
                                parentFile={bannerUrl}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                                onFileSelect={(banner) => {
                                    const bannerUrl = URL.createObjectURL(banner);
                                    setForm({ ...form, banner });
                                    setBannerUrl(bannerUrl)
                                }}
                            />
                        </div> */}
                        <div className="mt-3">
                            <Input
                                placeholder=""
                                name="duration"
                                label="Duration In Mins"
                                type="number"
                                value={form.duration}
                                required={true}
                                disabled={!form.momType}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                            />
                        </div>
                        <div className="mt-3">
                            <AutoCompleteInput
                                label="Category"
                                options={categories}
                                value={form.category || ''}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                                onSelect={handleCategorySelect}
                            />
                        </div>
                        {form.momType === 'newMom' ? (
                            <div className="mt-3" >
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
                            <div className="mt-3">
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
                        )}
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
                    {/* <div className="custom-form editor-container" style={{ width: '65%', height: 'max-content' }}>
                        <label className="form-label mb-2"></label>
                        <RichTextEditor
                            ref={editorRef}
                            height={'400px'}
                            value={content || ''}
                            onChange={handleEditorChange}
                            required
                            formSubmitted={formSubmitted}
                            error={formSubmitted && (!form.description || form.description === '<p><br></p>')}
                        />
                    </div> */}
                    <div
                            className="custom-form editor-container"
                            style={{ width: '65%', height: 'max-content' }}
                        >
                            <label className="form-label mb-2">
                                Description (English)
                            </label>

                            <RichTextEditor
                                ref={editorRef}
                                height={'400px'}
                                value={content || ''}
                                onChange={handleEditorChange}
                                required
                                formSubmitted={formSubmitted}
                                error={
                                    formSubmitted &&
                                    (!form.description || form.description === '<p><br></p>')
                                }
                            />

                            <label className="form-label mb-2 mt-4">
                                Description (Tamil)
                            </label>

                            <RichTextEditor
                                height={'400px'}
                                value={form.descriptionTa || ''}
                                onChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        descriptionTa: value
                                    }))
                                }
                                required
                                formSubmitted={formSubmitted}
                                error={
                                    formSubmitted &&
                                    (!form.descriptionTa ||
                                        form.descriptionTa === '<p><br></p>')
                                }
                            />
                        </div>
                </form>
            )}
        </div>
    );
}


'use client';
import './page.css';
import { useState, useEffect, useRef } from "react";
import Input from "@/components/shared/input/page";
import Button from "@/components/shared/button/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import FileUpload from "@/components/shared/file/page";
import { useRouter, useParams } from "next/navigation";
import RadioGroup from "@/components/shared/radio/page";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { objectToFormData } from "@/common/utils/util";
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
import { showError, showSuccess } from '@/common/toast/toastService';
import Checkbox from '@/components/shared/checkbox/page';
export default function Book_Recommendations() {
    const [form, setForm] = useState({
        title: '',
        titleTa: '',
        status: 'Active',
        file: '',
        momType: '',
        book: '',
        link: '',
        pregMom: false,
        newMom: false,
    });
    const { id } = useParams();
    const router = useRouter();
    const fetchApiRef = useRef();
    const viewApiRef = useRef();
    const formRef = useRef(null);
    const isEdit = id !== 'add';
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [bookPreviewUrl, setBookPreviewUrl] = useState('');
    const [viewBook, setViewBook] = useState({});
    const [categories, setCategories] = useState([]);
    const [backLoading, setBackLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Book Recommendations', href: '/book-recommendations' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/book-recommendations/${id}` : '/book-recommendations/add'
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
    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
    ]
    const momTypeOptions = [
        { label: 'Preg Mom', value: 'pregMom' },
        { label: 'New Mom', value: 'newMom' },
    ]
    useEffect(() => {
        if (isEdit) {
            setIsLoading(true);
        }
        if (fetchApiRef.current) return;
        fetchApiRef.current = true;
    }, [id]);
    useEffect(() => {
        if (isEdit && !viewApiRef.current) {
            viewApiRef.current = true;
            viewBooks(id);
        }
    });
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            status: value,
        }));
    };
    const fetchCategories = async (momType = "") => {
        if (!momType && !isEdit) return;

        const payload = {
            params: {
                momType: momType || '',
                pagination: 'true',
                page: '1',
                limit: '10',
            },
        };

        try {
            const data = await apiRequest(apiRoutes.getBookList, 'POST', payload, router);
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
    const viewBooks = async (id) => {
        try {
            setIsLoading(true);
            const payload = { params: { id } };
            const data = await apiRequest(apiRoutes.viewBook, 'POST', payload, router);

            if (data?.response) {
                const book = data?.data;

                // setForm({
                //     title: book?.title || '',
                //     titleTa: book?.translations?.ta?.title || '',
                //     status: book?.status || '',
                //     momType: book?.momType || '',
                //     file: book?.file || '',
                //     book: book?.book || '',
                //     link: book?.link || '',
                //     pregMom: book.momType === 'pregMom' || book.momType === '',
                //     newMom: book.momType === 'newMom' || book.momType === ''
                // });
                setForm({
                    title: book?.title || '',
                    titleTa:
                        book?.titleTa ||
                        book?.translations?.ta?.title ||
                        '',
                    status: book?.status || '',
                    momType: book?.momType || '',
                    file: book?.file || '',
                    book: book?.book || '',
                    link: book?.link || '',
                    pregMom: book?.momType === 'pregMom' || book?.momType === '',
                    newMom: book?.momType === 'newMom' || book?.momType === ''
                });

                setViewBook(book);
                setPreviewUrl(book.file || '');
                setBookPreviewUrl(book.book || '');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('viewBooks error:', error);
            setIsLoading(false);
        }
    };
    const handleBackButton = () => {
        setBackLoading(true);
        router.push('/book-recommendations');
    }
    const handleMomTypeChange = async (e) => {
        const value = e.target.value;
        console.log("Radio selected:", value);
        setForm(prev => ({
            ...prev,
            momType: value,
        }));
        setViewBook(prev => ({
            ...prev,
            momType: value,
        }));
        await fetchCategories(value);
    };
    const handleCheckboxChange = (key) => (e) => {
        setForm((prev) => ({
            ...prev,
            [key]: e.target.checked,
        }));
    };

        const handleSubmit = (e) => {
            e.preventDefault();

            setFormSubmitted(true);
            setButtonLoading(true);

            console.log('FORM:', form);

            if (!form.pregMom && !form.newMom) {
                setButtonLoading(false);
                showError('Please Select Mom Type');
                return;
            }

            if (!form.title || !form.titleTa || !form.file) {
                setButtonLoading(false);
                return;
            }

            if (!form.link && !form.book) {
                showError('Required Book or Link');
                setButtonLoading(false);
                return;
            }

            let momType = '';

            if (form.pregMom && !form.newMom) {
                momType = 'pregMom';
            } else if (!form.pregMom && form.newMom) {
                momType = 'newMom';
            }

            let updateForm;

            if (isEdit) {
                updateForm = {
                    ...viewBook,
                    ...form,
                    id: id,
                    momType: momType,
                    fileChanged: form.file !== viewBook.file,
                    bookChanged: form.book !== viewBook.book
                };
            } else {
                updateForm = {
                    ...form,
                    momType: momType
                };
            }

            const formData = objectToFormData(updateForm);

            // Make sure Tamil title is included in multipart form-data
            formData.set('titleTa', form.titleTa);

            console.log('English Title:', form.title);
            console.log('Tamil Title:', form.titleTa);
            console.log('FormData Tamil Title:', formData.get('titleTa'));

            manageBooks(formData);
        };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     setFormSubmitted(true);
    //     setButtonLoading(true);
    //     console.log('form', form)

    //     if (!form.pregMom && !form.newMom) {
    //         setButtonLoading(false);
    //         showError('Please Select Mom Type');
    //         return;
    //     }

    //     if (!form.title || !form.titleTa || !form.file) {
    //         setButtonLoading(false);
    //         return;
    //     }
    //     if (!form.link && !form.book) {
    //         showError('Required Book or Link');
    //         setButtonLoading(false);
    //         return;
    //     }


    //     let momType = '';
    //     if (form.pregMom && !form.newMom) {
    //         momType = 'pregMom';
    //     } else if (!form.pregMom && form.newMom) {
    //         momType = 'newMom';
    //     }
    //     form.momType = momType;
    //     let updateForm = {
    //         ...viewBook,
    //         ...form,
    //         id,
    //         fileChanged: form.file !== viewBook.file,
    //     };

    //     if (momType) {
    //         updateForm.momType = momType;
    //     }

    //     console.log('updateForm', updateForm)
    //     const formData = objectToFormData(!isEdit ? form : updateForm)
    //     manageBooks(formData)
    // };

    const manageBooks = async (formData) => {
        const action = !isEdit ? apiRoutes.addBook : apiRoutes.updateBook
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                router.push('/book-recommendations')
            }
            setFormSubmitted(false);
            setButtonLoading(false);
            const message = isEdit ? 'Book updated successfully!' : 'Book added successfully!';
            showSuccess(message);
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
                        {/* <div>
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
                        </div> */}
                        <div>
                            <label className="" style={{ fontSize: '13px', fontWeight: '500' }}>Mom Type</label>
                            <div className="d-flex justify-content-start gap-3">
                                <Checkbox
                                    name="pregMom"
                                    label="Preg Mom"
                                    checked={form.pregMom}
                                    onChange={handleCheckboxChange('pregMom')}
                                />
                                <Checkbox
                                    name="newMom"
                                    label="New Mom"
                                    checked={form.newMom}
                                    onChange={handleCheckboxChange('newMom')}
                                />
                            </div>
                        </div>
                        <div className="mt-2">
                            <Input
                                label="Title"
                                name="title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                            //disabled={!form.momType}
                            />
                        </div>
                        <div className="mt-2">
                                <Input
                                    label="Tamil Title"
                                    name="titleTa"
                                    value={form.titleTa}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            titleTa: e.target.value
                                        })
                                    }
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    tamilKeyboard={true}
                                />
                            </div>
                        <div className="mt-2">
                            <FileUpload
                                label="Thumbnail"
                                format="image"
                                parentFile={previewUrl}
                                required={true}
                                formSubmitted={formSubmitted}
                                //disabled={!form.momType}
                                onFileSelect={(file) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    setForm({ ...form, file });
                                    setPreviewUrl(previewUrl);
                                }}
                            />
                        </div>

                        <div className="mt-2">
                            <FileUpload
                                label="Book"
                                format="pdf"
                                parentFile={bookPreviewUrl}
                                required={false}
                                formSubmitted={formSubmitted}
                                //disabled={!form.momType}
                                onFileSelect={(file) => {
                                    if (file) {
                                        setForm({ ...form, book: file });
                                        setBookPreviewUrl(previewUrl);
                                    } else {
                                        setForm({ ...form, book: null });
                                        setBookPreviewUrl(null);
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-2">
                            <Input
                                label="Link"
                                name="link"
                                value={form.link}
                                onChange={(e) => setForm({ ...form, link: e.target.value })}
                                required={false}
                                formSubmitted={formSubmitted}
                            //disabled={!form.momType}
                            />
                        </div>
                        <label className="mt-3" style={{ fontSize: '13px', fontWeight: '500' }}>Status</label>
                        <div className="d-flex gap-3 mt-1">
                            <RadioGroup
                                name="status"
                                options={statusOptions}
                                selectedValue={form.status}
                                onChange={handleStatusChange}
                                required
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                label={isEdit ? "Update" : "Save"}
                                type="submit"
                                size="small"
                                color="#fff"
                                backgroundColor={Colors.Primary2}
                                isLoading={buttonLoading}
                            //disabled={!form.momType}
                            />
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}


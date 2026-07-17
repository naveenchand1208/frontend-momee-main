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
import { objectToFormData } from "@/common/utils/util";
import { showError, showSuccess } from "@/common/toast/toastService";
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
export default function AddRefundPolicy() {
    const [form, setForm] = useState({
        description: '',
    });
    const { id } = useParams();
    const router = useRouter();
    const fetchApiRef = useRef();
    const viewApiRef = useRef();
    const isEdit = id !== 'add';
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [content, setContent] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [categories, setCategories] = useState([]);
    const [viewArticle, setViewArticle] = useState({});
    const editorRef = useRef(null);
    const [backLoading, setBackLoading] = useState(false);
    const formRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const breadcrumbItems = [
        { label: 'Refund Policy', href: '/refund-policy' },
        {
            label: isEdit ? 'Edit Refund Policy' : 'Add Refund Policy',
            href: isEdit ? undefined : '/refund-policy/add',
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
        if (isEdit) {
            setIsLoading(true)
        }
        if (fetchApiRef.current) return;
        fetchApiRef.current = true;
        fetchRefundPolicy();
    }, [id]);
    useEffect(() => {
        if (isEdit && categories.length > 0 && !viewApiRef.current) {
            viewApiRef.current = true;
            viewRefundPolicy(id);
        }
    }, [categories]);

    const fetchRefundPolicy = async () => {
        if (!isEdit) {
            setIsLoading(false);
            return;
        }
        const payload = {
            params: {
                status: "Active",
                pagination: 'true',
                page: '1',
                limit: '10',
            },
        };

        try {
            const data = await apiRequest(apiRoutes.getRefundPolicy, 'POST', payload, router);
            if (data?.response) {
                const categories = data?.data?.docs.map(item => ({
                    ...item,
                    label: item.description
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
    const handleEditorChange = (value) => {
        setContent(value);
        setForm((prev) => ({ ...prev, description: value }));
    };
    const handleBackButton = () => {
        setBackLoading(true);
        router.push('/refund-policy');
    }
    const viewRefundPolicy = async (id) => {
        try {
            const payload = { params: { id } }
            console.log('Id', id);
            const data = await apiRequest(apiRoutes.viewRefundPolicy, 'POST', payload, router);
            if (data?.response) {
                const refund = data?.data;
                setForm({
                    description: refund?.description || '',
                });
                setContent(refund.description)
                setViewArticle(refund)
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
        if (form.description.length === 0) {
            showError('Please add at least one description');
            setFormSubmitted(false);
            setButtonLoading(false);
            return;
        }
        let updateForm;
        if (isEdit) {
            updateForm = {
                ...viewArticle,
                ...form,
                id,
            };
        }
        const preparedForm = {
            ...(isEdit ? updateForm : form),
        };

        const payload = { params: preparedForm };
        manageRefundPolicy(payload);

    };
    const manageRefundPolicy = async (payload) => {
        const action = !isEdit ? apiRoutes.addRefundPolicy : apiRoutes.updateRefundPolicy;

        try {
            const data = await apiRequest(action, 'POST', payload, router);
            if (data?.response) {
                const message = isEdit ? 'Refund Policy updated successfully!' : 'Refund Policy added successfully!';
                showSuccess(message);
                router.push('/refund-policy');
            }
            setFormSubmitted(false);
            setButtonLoading(false);
        } catch (error) {
            console.error('API Error:', error);
            setFormSubmitted(false);
            setButtonLoading(false);
        }
    };

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
                    <div className="custom-form editor-container" style={{ width: '65%', height: 'max-content' }}>
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
                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                label={isEdit ? "Update" : "Save"}
                                type="submit"
                                size="small"
                                color="#fff"
                                backgroundColor={Colors.Primary2}
                                isLoading={buttonLoading}
                            />
                        </div>
                    </div>

                </form>
            )}
        </div>
    );
}


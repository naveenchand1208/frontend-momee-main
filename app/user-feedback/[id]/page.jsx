'use client';
import './page.css';
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/shared/input/page";
import Button from "@/components/shared/button/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
import Textarea from '@/components/shared/textarea/page';
import FileUpload from '@/components/shared/file/page';
import { showError, showSuccess } from '@/common/toast/toastService';
export default function AddUserFeedback() {
    const [form, setForm] = useState({
        title: '',
        description: '',
        files: [],
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [backLoading, setBackLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewUserFeedbacks, setViewUserFeedbacks] = useState({});
    const { id } = useParams();
    const isEdit = id !== 'add';
    const router = useRouter();
    const viewApiRef = useRef(false);
    const breadcrumbItems = [
        { label: 'User Feedback', href: '/user-feedback' },
        {
            label: isEdit ? 'Edit User Feedback' : 'Add User Feedback',
            href: isEdit ? undefined : '/user-feedback/add',
        },
    ];
    const breadcrumbAction = {
        label: 'Back',
        type: 'button',
        size: 'extraSmall',
        backgroundColor: Colors.Primary1,
        isLoading: backLoading,
        onClick: () => {
            setBackLoading(true);
            router.push('/user-feedback');
        },
    };
    useEffect(() => {
        if (isEdit && !viewApiRef.current) {
            viewApiRef.current = true;
            viewUserFeedback(id);
        }
    }, [isEdit, id])
    const viewUserFeedback = async (id) => {
        try {
            setIsLoading(true);
            const payload = { params: { id } };
            const data = await apiRequest(apiRoutes.viewUserFeedback, 'POST', payload, router);
            if (data?.response) {
                const feedback = data.data;
                const existingFiles = feedback?.files || [];
                const formattedFiles = existingFiles.map((fileObj) => ({
                    file: null,
                    url: fileObj.url,
                    fileChanged: false,
                }));
                setForm({
                    title: feedback?.title || '',
                    description: feedback?.description || '',
                    files: formattedFiles,
                });
                setViewUserFeedbacks(feedback);
            }
        } catch (error) {
            console.log('viewUserFeedback error', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        if (!form.title || !form.description) {
            // showError('Please fill all required fields');
            return;
        }
        if (!form.files.length) {
            showError('Please upload at least one file');
            return;
        }
        setButtonLoading(true);
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);

        form.files.forEach(({ file, fileChanged }) => {
            if (file && !fileChanged) {
                formData.append('files', file);
            }
        });
        form.files
            .filter((f) => !f.file && !f.fileChanged)
            .forEach((f) => formData.append('oldFiles[]', f.url));

        if (isEdit) {
            formData.append('id', id);
        }
        try {
            const data = await apiRequest(isEdit ? apiRoutes.updateUserFeedback : apiRoutes.addUserFeedback, 'POST', formData, router);
            if (data?.response) {
                const message = isEdit ? 'Feedback updated successfully!' : 'Feedback added successfully!';
                showSuccess(message);
                router.push('/user-feedback');
            }
        } catch (error) {
            console.error('submit error', error);
        } finally {
            setButtonLoading(false);
            setFormSubmitted(false);
        }
    };
    return (
        <div className="max-w-6xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />
            {isLoading ? (
                <div className="flex justify-center items-center h-[400px] w-full">
                    <CircularProgress />
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="custom-form w-1/2">
                        <div className="mt-2">
                            <Input
                                label="Title"
                                name="title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                                formSubmitted={formSubmitted}
                            />
                        </div>
                        <div className="mt-2">
                            <Textarea
                                label="Description"
                                name="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                                formSubmitted={formSubmitted}
                            />
                        </div>
                        <div className="mt-2">
                            <FileUpload
                                label="Thumbnail"
                                format="image"
                                parentFile=""
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={false}
                                onFileSelect={(file) => {
                                    const url = URL.createObjectURL(file);
                                    setForm((prev) => ({
                                        ...prev,
                                        files: [...prev.files, { file, url, fileChanged: false }],
                                    }));
                                }}
                            />
                        </div>
                        {form.files.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
                                {form.files.map((item, index) => {
                                    if (!item.file && item.fileChanged) return null;
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                position: 'relative',
                                                width: '112px',
                                                height: '112px',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '1px solid #ddd',
                                                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                                            }}
                                        >
                                            <img
                                                src={item.url}
                                                alt={`thumbnail-${index}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setForm((prev) => {
                                                        const updated = [...prev.files];
                                                        const item = updated[index];

                                                        if (item.file) {
                                                            updated.splice(index, 1);
                                                        } else {
                                                            updated[index] = { ...item, fileChanged: true };
                                                        }

                                                        return { ...prev, files: updated };
                                                    });
                                                }}
                                                title="Remove"
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#dc2626',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    lineHeight: '20px',
                                                    textAlign: 'center',
                                                    border: 'none',
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="flex justify-end mt-4">
                            <Button
                                label={isEdit ? 'Update' : 'Save'}
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



'use client'
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/shared/image/page';
import Input from '@/components/shared/input/page';
import Button from '@/components/shared/button/page';
import { Colors } from '@/common/constants/colorEnum';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { objectToFormData } from '@/common/utils/util';
import { showSuccess } from '@/common/toast/toastService';
export default function Banner({ product, onClose }) {
    // const { id } = useParams();
    const id = product;
    const router = useRouter();
    const isArticle = id?.startsWith('Article');
    const isProduct = id?.startsWith('Product');
    const isArticleProductPage = isProduct || isArticle;
    const defaultType = isArticle ? 'article' : isProduct ? 'product' : 'custom';
    const [form, setForm] = useState({
        file: '',
        url: '',
        type: defaultType,
    });
    const [viewBannerData, setViewBannerData] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [bannerUrl, setBannerUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fetchApiRef = useRef();
    const formRef = useRef(null);
    const isEdit = id && !id.startsWith('Article') && !id.startsWith('Product') && id !== 'add';
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            type: id
                ? id.startsWith('Article')
                    ? 'blog'
                    : id.startsWith('Product')
                        ? 'product'
                        : 'custom'
                : 'custom',
        }));
    }, [id]);
    useEffect(() => {
        if (isEdit && !fetchApiRef.current) {
            console.log('Calling viewBanner with ID:', id);
            fetchApiRef.current = true;
            viewBanner(id);
        }
    }, [isEdit, id]);
    const viewBanner = async (bannerId) => {
        try {
            setIsLoading(true);
            const payload = { params: { id: bannerId } };
            const data = await apiRequest(apiRoutes.viewBanner, 'POST', payload, router);
            if (data?.response) {
                const banner = data.data;
                setForm({
                    file: banner?.file || '',
                    url: banner?.url || '',
                    type: banner?.type || defaultType,
                });
                setViewBannerData(banner);
                setBannerUrl(banner.file || '');
            }
        } catch (error) {
            console.error('viewBanner error:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        if (!form.file || (!isArticleProductPage && !form.url) || !form.type) {
            setButtonLoading(false);
            return;
        }
        if (isEdit && isArticleProductPage) {
            console.warn("Edit is not supported for Product or Article banners.");
            setButtonLoading(false);
            return;
        }
        let updateForm = {
            ...form,
            url: isArticleProductPage ? id : form.url,
        };
        if (isEdit) {
            const isFileChanged = form.file !== viewBannerData.file;
            updateForm = {
                ...viewBannerData,
                ...form,
                id,
                url: isArticleProductPage ? id : form.url,
                fileChanged: isFileChanged,
            };
        }
        const formData = objectToFormData(updateForm);
        let action;
        if (!isEdit) {
            action = apiRoutes.addBanner;
        } else {
            action = apiRoutes.updateBanner;
        }
        try {
            const response = await apiRequest(action, 'POST', formData, router);
            if (response?.response || response?.data?.success) {
                if (onClose) {
                    onClose();
                } else {
                    router.replace(isArticle ? '/articles' : isProduct ? '/product-listings' : '/banner');
                }
                const message = isEdit ? 'Banner updated successfully!' : 'Banner added successfully!';
                showSuccess(message);
                // Reset form state
                setForm({
                    file: '',
                    url: '',
                    type: defaultType,
                });
                setBannerUrl('');
                setFormSubmitted(false);
                formRef.current?.reset();
            }

            setButtonLoading(false);
        } catch (error) {
            console.error('manageBanner error:', error);
            setFormSubmitted(false);
            setButtonLoading(false);
        }
    };
    return (
        <div className="max-w-6xl mx-auto mt-10">
            {/* <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} /> */}
            <form ref={formRef} onSubmit={handleSubmit} className="d-flex gap-3">
                <div className="custom-form" style={{ width: '100%' }}>
                    <div className="mt-3">
                        {/* <FileUpload
                            label="Banner"
                            format="image"
                            parentFile={bannerUrl}
                            required={true}
                            formSubmitted={formSubmitted}
                            onFileSelect={(file) => {
                                const bannerUrl = URL.createObjectURL(file);
                                setForm((prev) => ({ ...prev, file }));
                                setBannerUrl(bannerUrl);
                            }}
                        /> */}
                        <ImageUpload
                            label="Banner"
                            format="image"
                            required={true}
                            parentFile={form.file}
                            formSubmitted={formSubmitted}
                            onFileSelect={(file) => setForm((prev) => ({ ...prev, file }))}
                            exactWidth={1920}
                            exactHeight={1080}
                        />
                    </div>
                    <div className="mt-5">
                        <Input
                            placeholder="Type"
                            name="type"
                            label="Type"
                            value={form.type}
                            required={true}
                            disabled={true}
                            formSubmitted={formSubmitted}
                            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                        />
                    </div>
                    {!isArticleProductPage && (
                        <div className="mt-3">
                            <Input
                                placeholder="Enter URL"
                                name="url"
                                label="URL"
                                value={form.url}
                                required={true}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                            />
                        </div>
                    )}
                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            label="Save"
                            type="submit"
                            size="small"
                            color="#fff"
                            backgroundColor={Colors.Primary2}
                            isLoading={buttonLoading}
                            disabled={false}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}


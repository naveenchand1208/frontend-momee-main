'use client';
import './page.css';
import Image from 'next/image';
import { Colors } from '@/common/constants/colorEnum';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { objectToFormData } from '@/common/utils/util';
import { showError, showSuccess } from '@/common/toast/toastService';
import { BANNER_TYPE } from '@/common/constants/enum';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import Input from '@/components/shared/input/page';
import Button from '@/components/shared/button/page';
import ImageUpload from '@/components/shared/image/page';
import RadioGroup from '@/components/shared/radio/page';
import { CircularProgress } from '@mui/material';
import PaginationComponent from '@/components/shared/pagination/page';
export default function BannerList() {
    const [id, setId] = useState(null);
    const router = useRouter();
    const fetchedRef = useRef(false);
    const [isEdit, setIsEdit] = useState(false);
    const formRef = useRef(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [viewform, setViewform] = useState({});
    const [articles, setArticles] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('Active/Inactive');
    const [viewBannerData, setViewBannerData] = useState({});
    const [buttonLoading, setButtonLoading] = useState(false);
    const [bannerUrl, setBannerUrl] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [limit, setLimit] = useState(8);
    const [totalCount, setTotalCount] = useState(0);
    const [form, setForm] = useState({
        type: '',
        status: '',
        dateRange: { fromDate: '', toDate: '' },
    });
    const [addForm, setAddForm] = useState({
        file: '',
        url: '',
        type: 'custom',
        status: 'Active',
    });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Banner', href: '/banner' },
    ];
    const breadcrumbAction = [
        // {
        //     iconPath: '/assets/icons/download-icon.svg',
        //     type: 'textIcon',
        //     label: 'Export',
        //     onClick: () => console.log('Download clicked'),
        // },
        {
            iconPath: '/assets/icons/outlined-filter-icon.svg',
            type: 'textIcon',
            label: 'Filter',
            onClick: () => setFilterOpen(true),
        },
        {
            type: 'statusTabs',
            onChange: (val) => {
                if (val === 'All') {
                    setForm((prev) => ({ ...prev, status: '' }));
                    const filters = { ...form };
                    delete filters.status;
                    fetchArticles({ page: 1, limit: 10, ...filters });
                    setStatusLabel('Active/Inactive');
                } else {
                    setForm((prev) => ({ ...prev, status: val }));
                    fetchArticles({ page: 1, limit: 10, ...form, status: val });
                    setStatusLabel(val);
                }
            },
        },

    ];
    const inputFields = [
        // {
        //     name: 'status',
        //     label: '',
        //     placeholder: 'Choose Status',
        //     inputType: 'autocomplete',
        //     options: ACTIVE_STATUS,
        //     value: form.status,
        // },
        {
            name: 'type',
            label: '',
            placeholder: 'Choose Banner type',
            inputType: 'autocomplete',
            options: BANNER_TYPE,
            value: form.type,
        },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        }
    ];
    const WEBSITE_URL_REGEX =
        /^(https?:\/\/(www\.)?|www\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([/?#].*)?$/;
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchArticles({ page: page, limit: rowsPerPage, sortField, sortOrder });
    }, []);
    useEffect(() => {
        if (isBannerDialogOpen) {
            setAddLoading(false);
        }
    }, [isBannerDialogOpen]);
    const handleClear = () => {
        setAddForm({
            file: '',
            url: '',
            type: 'custom',
        });
        setBannerUrl('');
        setFormSubmitted(false);
        setIsEdit(false);
        setId(null);
        formRef.current?.reset();
    };
    const handleEdit = (banner) => {
        setIsEdit(true);
        setId(banner.id);
        viewBanner(banner.id);
    };
    const handleDelete = (row) => {
        setViewform(row)
        setIsDeleteDialogOpen(true)
    };
    const handleDeleteCancel = () => {
        setIsDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);
        const payload = { params: { id: viewform.id } };
        const data = await apiRequest(apiRoutes.deleteBanner, 'POST', payload, router);
        if (data.response) {
            fetchArticles(page, rowsPerPage, {});
        }
    };
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const fetchArticles = async (options = {}) => {
        setIsLoading(true);
        const formatDate = (date) =>
            date ? new Date(date).toISOString().split('T')[0] : '';
        const currentPage = options.page || page;
        const currentLimit = options.limit || limit;
        const payload = {
            params: {
                sortField: options.sortField || '',
                sortOrder: options.sortOrder || 'asc',
                pagination: 'true',
                page: String(currentPage),
                limit: String(currentLimit),
                status: options.status || '',
                type:
                    options.type === 'Blog'
                        ? 'blog'
                        : options.type === 'Product'
                            ? 'product'
                            : options.type === 'Custom'
                                ? 'custom'
                                : '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };

        try {
            const data = await apiRequest(apiRoutes.getBannerList, 'POST', payload, router);
            console.log('Fetched articles:', data);

            if (data?.response) {
                const articles = data?.data?.docs.map((art) => ({
                    ...art,
                }))
                setArticles(articles);
                setTotalDocs(data?.data?.totalDocs);
                setTotalCount(data?.data?.totalDocs || 0);
                setPage(data?.data?.page || currentPage);
                setLimit(data?.data?.limit || currentLimit);
            }
        } catch (err) {
            console.error('Failed to fetch articles:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false)
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            type: filterValues.type || '',
            status: filterValues.status || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
        }));
        fetchArticles({ page: page, limit: rowsPerPage, sortField, sortOrder, ...filterValues });
    }
    const iconMap = {
        blog: '/assets/icons/blog-icon.svg',
        product: '/assets/icons/products-icon.svg',
        custom: '/assets/icons/custom-url-icon.svg',
    };
    const iconPrimaryMap = {
        blog: '/assets/icons/blog-primary-icon.svg',
        product: '/assets/icons/products-primary-icon.svg',
        custom: '/assets/icons/custom-url-primary-icon.svg',
    }
    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
    ];
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setAddForm((prevForm) => ({
            ...prevForm,
            status: value,
        }));
    };
    const viewBanner = async (bannerId) => {
        try {
            setIsLoading(true);
            const payload = { params: { id: bannerId } };
            const data = await apiRequest(apiRoutes.viewBanner, 'POST', payload, router);

            if (data?.response) {
                const banner = data.data;

                setAddForm({
                    file: banner?.file || '',
                    url: banner?.url || '',
                    type: banner?.type || 'custom',
                    status: banner?.status || 'Active',
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
    const isValidWebsiteUrl = (value) => {
        try {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        // if (!addForm.file || !addForm.url || !addForm.type) {
        if (!addForm.file || !addForm.type) {
            setButtonLoading(false);
            return;
        }
        const value = (addForm?.url || "").trim().replace(/\s+/g, "");
        console.log("URL value:", value);

        if (value && !isValidWebsiteUrl(value)) {
            showError("Enter a valid website URL (http or https)");
            setButtonLoading(false);
            return;
        }
        let updateForm = {
            ...addForm,
        };
        if (isEdit) {
            const isFileChanged = addForm.file !== viewBannerData.file;
            updateForm = {
                ...viewBannerData,
                ...addForm,
                id,
                fileChanged: isFileChanged,
            };
        }
        const formData = objectToFormData(updateForm);
        const action = isEdit ? apiRoutes.updateBanner : apiRoutes.addBanner;
        try {
            const response = await apiRequest(action, 'POST', formData, router);
            if (response?.response || response?.data?.success) {
                setArticles((prev) => {
                    if (isEdit) {
                        return prev.map((article) =>
                            article.id === id
                                ? {
                                    ...article,
                                    ...addForm,
                                    file:
                                        typeof addForm.file === 'string'
                                            ? addForm.file
                                            : URL.createObjectURL(addForm.file),
                                }
                                : article
                        );
                    } else {
                        return [
                            {
                                ...addForm,
                                file:
                                    typeof addForm.file === 'string'
                                        ? addForm.file
                                        : URL.createObjectURL(addForm.file),
                                id: response.data?.id || Date.now(),
                            },
                            ...prev,
                        ];
                    }
                });
                const message = isEdit ? 'Banner updated successfully!' : 'Banner added successfully!';
                showSuccess(message);
                setAddForm({
                    file: '',
                    url: '',
                    type: 'custom',
                    status: 'Active',
                });
                setBannerUrl('');
                setFormSubmitted(false);
                setIsEdit(false);
                setId(null);
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
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <div className="d-flex justify-content-between gap-3" style={{ height: 'calc(100vh - 120px)' }}>
                <div className="banner-grid" style={{ width: '70%', overflowY: 'auto', paddingRight: '10px' }}>
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
                    ) : articles.length === 0 ? (
                        <div style={{ textAlign: 'center', width: '100%', marginTop: '280px', color: '#999' }}>
                            <p style={{ fontSize: '16px' }}>No banners found</p>
                        </div>
                    ) : (
                        <div className="banner-card-grid">
                            {articles.map((item, idx) => (
                                <div key={idx} className="banner-card">
                                    {/* Image + Content */}
                                    <div className="banner-card-main">
                                        {/* Image Section */}
                                        <div className="banner-image-container">
                                            <img src={item.file} alt={item.id} className="banner-image" />
                                        </div>

                                        {/* Right Section */}
                                        <div className="banner-info">
                                            <div className="published-date">
                                                <i>Published At:</i>{" "}
                                                {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </div>
                                            <div className={`banner-status ${item.status === "Active" ? "active" : "inactive"}`}>
                                                {item.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full-width Divider */}
                                    <hr className="banner-divider" />

                                    {/* Bottom: Chips and Actions */}
                                    <div className="banner-footer">
                                        <div className="banner-chips">
                                            {["blog", "product", "custom"].map((type) => {
                                                const isActive = item.type === type;
                                                return (
                                                    <span key={type} className={`type-chip ${isActive ? "active-chip" : ""}`}>
                                                        <img
                                                            src={isActive ? iconPrimaryMap[type] : iconMap[type]}
                                                            alt={type}
                                                            className="chip-icon"
                                                        />
                                                        {type}
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        <div className="banner-actions">
                                            {actionConfig.map((action) => (
                                                <Image
                                                    key={action.iconName}
                                                    src={`/assets/icons/${action.iconName}.svg`}
                                                    alt={action.iconName}
                                                    width={14}
                                                    height={14}
                                                    className="action-icon"
                                                    onClick={() => action.onClick(item)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <form className="d-flex gap-3" ref={formRef} onSubmit={handleSubmit} style={{ width: '30%', flexShrink: 0, }}>
                    <div className="custom-form" style={{ width: '100%', marginLeft: '-10px' }}>
                        <h6 className="text-sm font-semibold text-gray-800 mb-3">Add Banner</h6>

                        <div className="mt-3">
                            <ImageUpload
                                label="Banner"
                                format="image"
                                required={true}
                                parentFile={addForm.file}
                                formSubmitted={formSubmitted}
                                onFileSelect={(file) => setAddForm((prev) => ({ ...prev, file }))}
                                exactWidth={1920}
                                exactHeight={1080}
                            />
                        </div>
                        <div className="mt-5">
                            <label className="form-label" style={{ fontSize: '0.875rem' }}>Type</label>
                            <div className="d-flex gap-2">
                                {['blog', 'product', 'custom'].map((type) => {
                                    const isSelected = addForm.type === type;
                                    const disabled = isEdit
                                        ? addForm.type !== type
                                        : type !== 'custom';

                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`btn btn-sm cursor ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setAddForm((prev) => ({ ...prev, type }))}
                                            style={{ textTransform: 'capitalize', borderRadius: '8px', padding: '6px 12px' }}
                                            disabled={disabled}
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                            {formSubmitted && !addForm.type && (
                                <p className="text-danger mt-1" style={{ fontSize: '12px' }}>
                                    Type is required
                                </p>
                            )}
                        </div>
                        <div className="mt-3">
                            <Input
                                placeholder="Enter URL"
                                name="url"
                                label="URL"
                                value={addForm.url}
                                required={false}
                                formSubmitted={formSubmitted}
                                disabled={addForm.type !== 'custom'}
                                onChange={(e) => setAddForm((prev) => ({ ...prev, url: e.target.value }))}
                            />
                        </div>
                        <div className='mt-3'>
                            <label className="form-label" style={{ fontSize: '0.875rem' }}>Status</label>
                            <RadioGroup
                                name="status"
                                options={statusOptions}
                                selectedValue={addForm.status}
                                onChange={handleStatusChange}
                                required
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-4" style={{ gap: '5px' }}>
                            <Button
                                label="Clear"
                                type="button"
                                color="#fff"
                                backgroundColor={Colors.Primary1}
                                size='small'
                                onClick={handleClear}
                            />
                            <Button
                                label={isEdit ? "Update" : "Save"}
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
            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title='Delete'
                message="Are you sure you want to delete?"
                cancelLabel="No"
                confirmLabel="Yes"
            />
            {
                filterOpen && (
                    <CustomDialog
                        open={filterOpen}
                        onClose={() => setFilterOpen(false)}
                        title=""
                        titleColor="#000000"
                        backgroundColor="#fafcfc"
                        content={
                            <CommonFilter
                                inputFields={inputFields}
                                initialValues={form}
                                onSubmit={(formValues) => handleFilterSubmit(formValues)}
                                onclose={() => setFilterOpen(false)}
                            />
                        }
                        actions={<button onClick={() => setFilterOpen(false)}>Close</button>}
                        maxWidth="xs"
                        position="top-left"
                    />

                )
            }

            {totalCount > limit && (
                <div className="mt-1" style={{ marginRight: '355px' }}>
                    <PaginationComponent
                        totalCount={totalCount}
                        page={page}
                        limit={limit}
                        onPageChange={(newPage) => {
                            setPage(newPage);
                            fetchArticles({ ...form, page: newPage, limit });
                        }}
                    />

                </div>
            )}
        </div>
    );
}

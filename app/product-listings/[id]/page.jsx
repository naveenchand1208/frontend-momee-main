'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import { showSuccess, showError } from '@/common/toast/toastService';
import { Colors } from '@/common/constants/colorEnum';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { CircularProgress } from '@mui/material';
import Button from '@/components/shared/button/page';
import Input from '@/components/shared/input/page';
import Textarea from '@/components/shared/textarea/page';
import FileUpload from '@/components/shared/file/page';
import RadioGroup from '@/components/shared/radio/page';
import { newObjectToFormData } from '@/common/utils/util';
import Image from 'next/image';

export default function AddProductListings() {
    // const [form, setForm] = useState({
    //     name: '',
    //     status: 'Active',
    //     files: [],
    //     description: '',
    //     discountPercentage: '',
    //     actualPrice: '',
    //     momType: '',
    // });
    const [form, setForm] = useState({
        name: '',
        nameTa: '',
        status: 'Active',
        files: [],
        description: '',
        descriptionTa: '',
        discountPercentage: '',
        actualPrice: '',
        momType: '',
    });
    const { id } = useParams();
    const router = useRouter();
    const fetchApiRef = useRef();
    const viewApiRef = useRef();
    const isEdit = id !== 'add';
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [categories, setCategories] = useState([]);
    const [viewProduct, setViewProduct] = useState({});
    const [backLoading, setBackLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);

    const breadcrumbItems = [
        { label: 'Product Listings', href: '/product-listings' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/product-listings/${id}` : '/product-listings/add'
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
    ];
    const momTypeOptions = [
        { label: 'Preg Mom', value: 'pregMom' },
        { label: 'New Mom', value: 'newMom' },
    ];

    useEffect(() => {
        if (isEdit) setIsLoading(true);
        if (fetchApiRef.current) return;
        fetchApiRef.current = true;
        fetchCategories();
    }, [id]);

    useEffect(() => {
        if (isEdit && categories.length > 0 && !viewApiRef.current) {
            viewApiRef.current = true;
            viewProducts(id);
        }
    }, [categories]);

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            status: value,
        }));
    };
    const fetchCategories = async () => {
        if (!form.momType && !isEdit) return;
        const payload = {
            params: {
                momType: form.momType || '',
                pagination: 'true',
                page: '1',
                limit: '10',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getArticlesCategoryList, 'POST', payload, router);
            if (data?.response) {
                const categories = data.data.docs.map(item => ({ ...item, label: item.title }));
                setCategories(categories);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const viewProducts = async (id) => {
        try {
            const payload = { params: { id } };
            const data = await apiRequest(apiRoutes.viewProducts, 'POST', payload, router);
            if (data?.response) {
                const product = data.data;
                const formattedFiles = product.files?.map((file) => ({
                    url: file.url,
                    public_id: file.public_id,
                    fileChanged: false
                })) || [];

                // setForm({
                //     name: product.name || '',
                //     files: formattedFiles,
                //     description: product.description || '',
                //     actualPrice: product.actualPrice || '',
                //     discountPercentage: product.discountPercentage || '',
                //     momType: product.momType,
                //     status: product.status || 'Active',
                // });
                setForm({
                    name:product?.name || '',
                    // nameTa:
                    //     product?.translations?.ta?.name || '',
                    nameTa:
                        product?.nameTa ||
                        product?.translations?.ta?.name ||
                        '',

                    files:
                        formattedFiles,

                    description:
                        product?.description || '',

                    // descriptionTa:
                    //     product?.translations?.ta?.description || '',

                    descriptionTa:
                        product?.descriptionTa ||
                        product?.translations?.ta?.description ||
                        '',

                    actualPrice:
                        product?.actualPrice || '',

                    discountPercentage:
                        product?.discountPercentage || '',

                    momType:
                        product?.momType || '',

                    status:
                        product?.status || 'Active',
                });
                setViewProduct(product);
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleBackButton = () => {
        setBackLoading(true);
        router.push('/product-listings');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);

        // if (!form.name || !form.description || !form.actualPrice || !form.discountPercentage || form.files.length === 0) {
        //     showError("Please fill all required fields and upload at least one image");
        //     setButtonLoading(false);
        //     return;
        // }
        if (
            !form.name ||
            !form.nameTa ||
            !form.description ||
            !form.descriptionTa ||
            !form.actualPrice ||
            !form.discountPercentage ||
            form.files.length === 0
        ) {
            showError(
                "Please fill all required fields and upload at least one image"
            );

            setButtonLoading(false);

            return;
        }

        const newFiles = form.files.filter(f => f.fileChanged && f.file);
        const oldFiles = form.files.filter(f => !f.fileChanged);

        const payload = {
            ...form,
            files: newFiles.map(f => f.file),
            oldFiles: oldFiles.map(f => ({ public_id: f.public_id, url: f.url })),
            id: isEdit ? viewProduct.id : undefined,
        };

        // const formData = newObjectToFormData(payload);
        // manageProducts(formData);
        const formData = newObjectToFormData(payload);


            // Force Tamil fields into FormData
            formData.set(
                'name',
                form.name
            );

            formData.set(
                'nameTa',
                form.nameTa
            );

            formData.set(
                'description',
                form.description
            );

            formData.set(
                'descriptionTa',
                form.descriptionTa
            );

            formData.set(
                'momType',
                form.momType
            );

            formData.set(
                'actualPrice',
                form.actualPrice
            );

            formData.set(
                'discountPercentage',
                form.discountPercentage
            );

            formData.set(
                'status',
                form.status
            );


            if (isEdit) {

                formData.set(
                    'id',
                    viewProduct.id
                );
            }


            // DEBUG
            console.log(
                '========== PRODUCT FORM DATA =========='
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


            manageProducts(formData);
    };

    const manageProducts = async (formData) => {
        const action = !isEdit ? apiRoutes.addProducts : apiRoutes.updateProducts;
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                showSuccess(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
                router.push('/product-listings');
            }
            setFormSubmitted(false);
            setButtonLoading(false);
        } catch (error) {
            setFormSubmitted(false);
            setButtonLoading(false);
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
                <form onSubmit={handleSubmit} className="d-flex gap-3">
                    <div className="custom-form w-[35%]">
                        <label className="text-sm font-medium">Mom Type</label>
                        <div className="mt-1">
                            <RadioGroup
                                name="momType"
                                options={momTypeOptions}
                                selectedValue={form.momType}
                                onChange={(e) => setForm({ ...form, momType: e.target.value })}
                                required
                            />
                        </div>
                        <div className='mt-3'>
                            <Input label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required formSubmitted={formSubmitted} disabled={!form.momType} />
                            <Input
                                label="Name (Tamil)"
                                name="nameTa"
                                value={form.nameTa}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        nameTa: e.target.value
                                    })
                                }
                                required
                                formSubmitted={formSubmitted}
                                tamilKeyboard={true}
                            />
                        </div>
                        <Input label="Actual Price" name="actualPrice" type="number" value={form.actualPrice} onChange={(e) => setForm({ ...form, actualPrice: e.target.value })} required formSubmitted={formSubmitted} disabled={!form.momType} />
                        <Input label="Discount Percentage" name="discountPercentage" type="number" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} required formSubmitted={formSubmitted} disabled={!form.momType} />
                        <Textarea label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required formSubmitted={formSubmitted} disabled={!form.momType} />
                        <Textarea
                            label="Description (Tamil)"
                            name="descriptionTa"
                            value={form.descriptionTa}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    descriptionTa: e.target.value
                                })
                            }
                            required
                            formSubmitted={formSubmitted}
                            disabled={!form.momType}
                        />
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
                    </div>

                    <div className="custom-form w-[35%]">
                        <label className="form-label mb-3">Add Thumbnails</label>
                        <FileUpload
                            label="Thumbnail"
                            format="image"
                            parentFile=""
                            required={false}
                            formSubmitted={formSubmitted}
                            disabled={!form.momType}
                            onFileSelect={(file) => {
                                // if (form.files.length >= 5) {
                                //     showError("Maximum 5 thumbnails allowed");
                                //     return;
                                // }
                                const previewUrl = URL.createObjectURL(file);
                                setForm(prev => ({
                                    ...prev,
                                    files: [...prev.files, { file, preview: previewUrl, fileChanged: true }]
                                }));
                            }}
                        />

                        {form.files.length > 0 && (
                            <table className="mt-4 text-sm w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-2">Preview</th>
                                        <th className="p-2">File Name</th>
                                        <th className="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.files.map((fileObj, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="p-2">
                                                <div className="relative w-5 h-5">
                                                    <img
                                                        src={fileObj.preview || fileObj.url}
                                                        alt={`Preview ${idx}`}
                                                        className="w-full h-full object-contain rounded"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute -top-2 -right-2 bg-white rounded-full p-[2px] shadow hover:bg-red-100"
                                                        onClick={() =>
                                                            setForm(prev => ({
                                                                ...prev,
                                                                files: prev.files.filter((_, i) => i !== idx),
                                                            }))
                                                        }
                                                    >
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="p-2">{fileObj.file?.name || `Image ${idx + 1}`}</td>
                                            <td className="p-2">
                                                <Image
                                                    src="/assets/icons/delete-icon.svg"
                                                    alt="Delete"
                                                    width={20}
                                                    height={20}
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        setForm(prev => ({
                                                            ...prev,
                                                            files: prev.files.filter((_, i) => i !== idx)
                                                        }));
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="flex justify-end mt-4">
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


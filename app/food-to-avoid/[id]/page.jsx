'use client';
import './page.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from "react";
import Input from "@/components/shared/input/page";
import AutoCompleteInput from "@/components/shared/autocomplete/page";
import Button from "@/components/shared/button/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import FileUpload from "@/components/shared/file/page";
import { useRouter, useParams } from "next/navigation";
import RadioGroup from "@/components/shared/radio/page";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { getMonths, getWeeks, objectToFormData } from "@/common/utils/util";
import { showError, showSuccess } from "@/common/toast/toastService";
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
import Textarea from '@/components/shared/textarea/page';
export default function AddArticle() {
    const [form, setForm] = useState({
        title: '',
        titleTa: '',
        description: '',
        descriptionTa: '',
        status: 'Active',
        file: '',
        momType: '',
        category: '',
        //categoryTa: '',
        categoryId: '',
        month: '',
        week: '',
        foodType: '',
        //foodTypeTa: '',
        foodTypeId: '',
        region: '',
        symptoms: [],
    });
    const { id } = useParams();
    const router = useRouter();
    const formRef = useRef(null);
    const fetchApiRef = useRef();
    const viewApiRef = useRef();
    const isEdit = id !== 'add';
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [foodInput, setFoodInput] = useState('');
    const [foodInputTa, setFoodInputTa] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [categories, setCategories] = useState([]);
    const [viewFood, setViewFood] = useState({});
    const [weeks, setWeeks] = useState('');
    const [months, setMonths] = useState('');
    const [backLoading, setBackLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Foods to avoid', href: '/food-to-avoid' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/food-to-avoid/${id}` : '/food-to-avoid/add'
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
    const regionOptions = [
        { label: 'Southern', value: 'Southern' },
        { label: 'Northern', value: 'Northern' },
        { label: 'Both', value: 'both' },
    ];
    const foodTypes = [
    {
        label: 'Vegetables',
        labelTa: 'காய்கறிகள்',
        value: 'vegetables',
        id: 1
    },
    {
        label: 'Non Veg',
        labelTa: 'அசைவ உணவு',
        value: 'nonVeg',
        id: 2
    },
    {
        label: 'Fruits',
        labelTa: 'பழங்கள்',
        value: 'fruits',
        id: 3
    },
    {
        label: 'Grains',
        labelTa: 'தானியங்கள்',
        value: 'grains',
        id: 4
    },
    {
        label: 'Nuts',
        labelTa: 'கொட்டைகள்',
        value: 'nuts',
        id: 5
    },
    {
        label: 'Dairy Products',
        labelTa: 'பால் பொருட்கள்',
        value: 'dairyProducts',
        id: 6
    },
    {
        label: 'Common',
        labelTa: 'பொதுவானவை',
        value: 'common',
        id: 7
    }
];
    // const foodTypes = [
    //     { label: 'Vegetables', value: 'vegetables', id: 1 },
    //     { label: 'Non Veg', value: 'nonVeg', id: 2 },
    //     { label: 'Fruits', value: 'fruits', id: 3 },
    //     { label: 'Grains', value: 'grains', id: 4 },
    //     { label: 'Nuts', value: 'nuts', id: 5 },
    //     { label: 'Dairy Products', value: 'dairyProducts', id: 6 },
    //     { label: 'Common', value: 'common', id: 7 },
    //     // { label: 'Sea Food', value: 'seaFood', id: 4 },
    // ];
    useEffect(() => {
        const month = getMonths(12);
        setMonths(month);
        const week = getWeeks();
        setWeeks(week);
    }, []);
    useEffect(() => {
        if (isEdit) {
            setIsLoading(true);
        } if (fetchApiRef.current) return;
        fetchApiRef.current = true;
        fetchCategories();
    }, [id]);
    useEffect(() => {
        if (isEdit && categories.length > 0 && !viewApiRef.current) {
            viewApiRef.current = true;
            viewFoods(id);
        }
    }, [categories]);
    const viewFoods = async (id) => {
        try {
            // const payload = { params: { id } }
            const payload = {
                params: {
                    id,
                    admin: true
                }
            };
            const data = await apiRequest(apiRoutes.viewFoodsAvoid, 'POST', payload, router);
            if (data?.response) {
                const food = data?.data;
                setForm({
                    title: food?.title || '',
                    titleTa: food?.translations?.ta?.title || '',
                    description: food?.description || '',
                    descriptionTa: food?.translations?.ta?.description || '',
                    status: food?.status || '',
                    file: food?.file || '',
                    categoryId: food?.categoryId || '',
                    // category: categories.find(
                    //     cat => cat.id === food.categoryId
                    // )?.title || '',
                    // foodType: food?.foodType || '',
                    // foodTypeId: foodTypes.find(
                    //     fd => fd.id === food.foodTypeId
                    // )?.label || '',
                    category: categories.find(
                        cat => cat.id === food.categoryId
                    )?.title || '',

                    // categoryTa:
                    //     food?.translations?.ta?.category ||
                    //     categories.find(cat => cat.id === food.categoryId)?.labelTa ||
                    //     '',

                    foodType: food?.foodType || '',

                    // foodTypeTa:
                    //     food?.translations?.ta?.foodType ||
                    //     foodTypes.find(fd => fd.id === food.foodTypeId)?.labelTa ||
                    //     '',

                    foodTypeId: foodTypes.find(
                        fd => fd.id === food.foodTypeId
                    )?.id || '',
                    momType: food.momType,
                    week: weeks.find(
                        wk => wk.label === food.week
                    )?.label || '',
                    month: food.month,
                    region: food.region,
                    symptoms: food.symptoms || [],
                });
                // setForm({
                //     title: food?.title || '',
                //     titleTa: food?.translations?.ta?.title || '',
                //     description: food?.description || '',
                //     descriptionTa: food?.translations?.ta?.description || '',
                //     status: food?.status || '',
                //     file: food?.file || '',
                //     categoryId: food?.categoryId || '',
                //     category: categories.find(cat => cat.id === food.categoryId)?.title || '',
                //     foodType: food?.foodType || '',
                //     foodTypeId: foodTypes.find(fd => fd.id === food.foodTypeId)?.label || '',
                //     momType: food.momType,
                //     week: weeks.find(wk => wk.label === food.week)?.label || '',
                //     month: food.month,
                //     region: food.region,
                //     symptoms: food.symptoms || [],
                // });
                setViewFood(food)
                setPreviewUrl(food.file)
                setIsLoading(false)
            }
        } catch (error) {
            console.log('error', error)
        }
    }
    const fetchCategories = async (momType = "") => {
        if (!momType && !isEdit) return;

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
            const data = await apiRequest(apiRoutes.getFoodAvoidCategoryList, 'POST', payload, router);
            if (data?.response) {
                const categories = data?.data?.docs.map(item => ({
                    ...item,
                    label: item.title,
                    labelTa: item?.translations?.ta?.title || ''
                }));
                console.log('categories', categories)
                setCategories(categories);
                setIsLoading(false)
            } else {
                console.error('Error fetching categories:', data?.message);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    const handleBackButton = () => {
        setBackLoading(true);
        router.push('/food-to-avoid');
    }
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            status: value,
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
        setViewFood(prev => ({
            ...prev,
            momType: value,
            category: '',
            categoryId: '',
            month: '',
            week: '',
        }));
        await fetchCategories(value);
    };
    // const handleCategorySelect = (item) => {
    //     console.log('item', item)
    //     setForm((prev) => ({
    //         ...prev,
    //         category: item.title,
    //         categoryId: item.id,
    //     }));
    // };
    const handleCategorySelect = (item) => {
    console.log('Selected category:', item);

    setForm((prev) => ({
        ...prev,
        category: item.title,
       // categoryTa: item?.translations?.ta?.title || item?.labelTa || '',
        categoryId: item.id,
    }));
};
    const handleFoodTypeSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            foodType: item.label,
            //foodTypeTa: item.labelTa,
            foodTypeId: item.id,
        }));
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
    // const handleAddSymptoms = () => {
    //     if (!foodInput.trim()) return;
    //     const newFoods = {
    //         id: form.symptoms.length > 0
    //             ? form.symptoms[form.symptoms.length - 1].id + 1
    //             : 1,
    //         description: foodInput,
    //     };
    //     setForm((prev) => ({
    //         ...prev,
    //         symptoms: [...prev.symptoms, newFoods],
    //     }));
    //     setFoodInput('');
    // };
            const handleAddSymptoms = () => {

            if (!foodInput.trim() || !foodInputTa.trim()) {
                return;
            }

            const newFoods = {
                id: form.symptoms.length > 0
                    ? form.symptoms[form.symptoms.length - 1].id + 1
                    : 1,

                description: foodInput,

                translations: {
                    en: {
                        description: foodInput
                    },
                    ta: {
                        description: foodInputTa
                    }
                }
            };

            setForm((prev) => ({
                ...prev,
                symptoms: [
                    ...prev.symptoms,
                    newFoods
                ],
            }));

            setFoodInput('');
            setFoodInputTa('');
        };
    const handleDeleteSymptoms = (idToDelete) => {
        const updatedsymptoms = form.symptoms
            .filter((sympt) => sympt.id !== idToDelete)
            .map((f, i) => ({
                ...f,
                id: i + 1,
            }));
        setForm({ ...form, symptoms: updatedsymptoms });
    };
    const handleRegionTypeChange = async (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            region: value,
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setSubmitLoading(true);
        console.log('form', form)

        if (!form.momType) {
            showError('Please select Mom Type');
            setSubmitLoading(false);
            return;
        }

        if (!form.region) {
            showError('Please select Region');
            setSubmitLoading(false);
            return;
        }
        if (
                !form.title ||
                !form.titleTa ||
                !form.foodType ||
                !form.file ||
                !form.category ||
                !form.description ||
                !form.descriptionTa
            ) {
                setSubmitLoading(false);
                return;
            }
        if (form.momType === 'pregMom' && !form.week) {
            showError('Please Select Week');
            setSubmitLoading(false);
            return;
        }
        if (form.momType === 'newMom' && !form.month) {
            showError('Please Select Month');
            setSubmitLoading(false);
            return;
        }
        if (form.symptoms.length === 0) {
            showError('Please add at least one symptoms');
            setSubmitLoading(false);
            return;
        }
        let updateForm;
        if (isEdit) {
            const isFileChanged = form.file !== viewFood.file;
            updateForm = {
                ...viewFood,
                ...form,
                id,
                fileChanged: isFileChanged,
            };
        }
        //const formData = objectToFormData(!isEdit ? form : updateForm)
        // formData.set('titleTa', form.titleTa);
        // formData.set('descriptionTa', form.descriptionTa);
        const formData = objectToFormData(
                !isEdit ? form : updateForm
            );
            formData.set('titleTa', form.titleTa);
            formData.set(
                'descriptionTa',
                form.descriptionTa
            );
            // formData.set(
            //     'categoryTa',
            //     form.categoryTa
            // );

            // formData.set(
            //     'foodTypeTa',
            //     form.foodTypeTa
            // );
            formData.set(
                'symptoms',
                JSON.stringify(form.symptoms)
            );

            console.log('========== FOOD FORMDATA ==========');

            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            manageFoods(formData)
    };
    const manageFoods = async (formData) => {
        const action = !isEdit ? apiRoutes.addFoodsAvoid : apiRoutes.updateFoodsAvoid
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                const message = isEdit ? 'Food-to-avoid updated successfully!' : 'Food-to-avoid added successfully!';
                showSuccess(message);
                router.push('/food-to-avoid')
            }
            setFormSubmitted(false);
            setSubmitLoading(false);
        } catch (error) {
            setFormSubmitted(false);
            setSubmitLoading(false);
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
                <form ref={formRef} onSubmit={handleSubmit} noValidate className="d-flex gap-3">
                    <div className="custom-form" style={{ width: '35%', height: 'max-content' }}>
                        <div>
                            <label className="" style={{ fontSize: '13px', fontWeight: '500' }}>Mom Type</label>
                            <div className="d-flex gap-3 mt-1">
                                <RadioGroup
                                    name="momType"
                                    options={momTypeOptions}
                                    selectedValue={form.momType}
                                    onChange={handleMomTypeChange}
                                    // required={true}
                                    formSubmitted={formSubmitted}

                                />
                            </div>
                        </div>
                        <div className='mt-2'>
                            <label className="" style={{ fontSize: '13px', fontWeight: '500' }}>Region</label>
                            <div className="d-flex gap-3 mt-1">
                                <RadioGroup
                                    name="regionType"
                                    options={regionOptions}
                                    selectedValue={form.region}
                                    onChange={handleRegionTypeChange}
                                    // required={true}
                                    formSubmitted={formSubmitted}
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
                                disabled={!form.momType}
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
                                disabled={!form.momType}
                                tamilKeyboard={true}
                            />
                        </div>
                        <div className="mt-2">
                            <Textarea
                                label="Description"
                                name="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                            />
                        </div>
                        <div className="mt-2">
                                <Textarea
                                    label="Tamil Description"
                                    name="descriptionTa"
                                    value={form.descriptionTa}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            descriptionTa: e.target.value
                                        })
                                    }
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
                        {/* <div className="mt-2">
                            <Input
                                label="Tamil Category"
                                name="categoryTa"
                                value={form.categoryTa || ''}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        categoryTa: e.target.value
                                    })
                                }
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                                tamilKeyboard={true}
                            />
                        </div> */}
                        <div className="mt-2">
                            <AutoCompleteInput
                                label="Food Type"
                                options={foodTypes}
                                value={form.foodType || ''}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                                onSelect={handleFoodTypeSelect}
                            />
                        </div>
                        {/* <div className="mt-2">
                            <Input
                                label="Tamil Food Type"
                                name="foodTypeTa"
                                value={form.foodTypeTa || ''}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        foodTypeTa: e.target.value
                                    })
                                }
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                                tamilKeyboard={true}
                            />
                        </div> */}
                        {form.momType === 'newMom' ? (
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
                        )}
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
                                isLoading={submitLoading}
                            />
                        </div>
                    </div>

                    <div className="custom-form" style={{ width: '65%' }}>
                        <div style={{ border: 'none' }}>
                            <label htmlFor="symptoms" className="form-label mb-3" style={{ minWidth: '100px' }}>
                                Add Symptoms
                            </label>
                            <div>
                                <Input
                                    placeholder=""
                                    name="symptoms"
                                    label="Symptoms Name"
                                    value={foodInput}
                                    required={false}
                                    onChange={(e) => setFoodInput(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-2">
                            <Input
                                placeholder=""
                                name="symptomsTa"
                                label="Tamil Symptoms Name"
                                value={foodInputTa}
                                required={false}
                                tamilKeyboard={true}
                                onChange={(e) => setFoodInputTa(e.target.value)}
                            />
                        </div>
                        <div className="d-flex justify-content-end align-items-center mt-2">
                            <Button
                                label="Add"
                                type="button"
                                color="#fff"
                                size='small'
                                backgroundColor={Colors.Primary1}
                                onClick={handleAddSymptoms}
                            />
                        </div>
                        {form.symptoms.length > 0 && (
                            <div className="mb-3" style={{ border: 'none' }}>
                                <label
                                    htmlFor="symptoms"
                                    className="form-label mb-0 pt-1"
                                    style={{ minWidth: '100px' }}
                                >
                                    Symptoms
                                </label>

                                <div className="mt-2 ms-3"
                                    style={{
                                        maxHeight: '180px', overflow: 'auto'
                                    }}
                                >
                                    <ul className="cursor"
                                        style={{
                                            listStyleType: 'circle',
                                            paddingLeft: '20px',
                                            marginBottom: 0,
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {form.symptoms.map((food, index) => (
                                            <li
                                                key={index}
                                                className='cursor'
                                                style={{
                                                    listStyleType: 'circle',
                                                }}
                                            >
                                                <div
                                                    className="d-flex justify-content-between align-items-center"
                                                    style={{
                                                        borderBottom: index !== form.symptoms.length - 1 ? '1px solid #ccc' : 'none',
                                                        paddingBottom: '6px',
                                                        paddingTop: '6px',
                                                    }}
                                                >
                                                    {/* <span>{food.description || 'ITEM'}</span> */}
                                                    <div>
                                                        <div>
                                                            {food?.translations?.en?.description ||
                                                                food?.description ||
                                                                'ITEM'}
                                                        </div>

                                                        <div style={{ marginTop: '3px' }}>
                                                            {food?.translations?.ta?.description || ''}
                                                        </div>
                                                    </div>
                                                    <Image
                                                        src="/assets/icons/delete-icon.svg"
                                                        alt="icon"
                                                        width={18}
                                                        height={18}
                                                        className="ms-2"
                                                        onClick={() => handleDeleteSymptoms(food.id)}
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                </div>
                            </div>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}


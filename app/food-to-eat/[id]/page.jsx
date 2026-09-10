'use client';
import './page.css';
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
export default function FoodToEatAdd() {
    const [form, setForm] = useState({
        title: '',
        titleTa: '',
        status: 'Active',
        file: '',
        momType: '',
        region: '',
        category: '',
        categoryTa: '',
        categoryId: '',
        month: '',
        week: '',
        foodType: '',
        foodTypeTa: '',
        foodTypeId: '',
        energy: '',
        duration: '',
        protein: '',
    });
    const { id } = useParams();
    const router = useRouter();
    const fetchApiRef = useRef();
    const viewApiRef = useRef();
    const formRef = useRef(null);
    const isEdit = id !== 'add';
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [categories, setCategories] = useState([]);
    const [viewFood, setViewFood] = useState({});
    const [weeks, setWeeks] = useState('');
    const [months, setMonths] = useState('');
    const [backLoading, setBackLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const breadcrumbItems = [

        { label: 'Content Management' },
        { label: 'Foods to eat', href: '/food-to-eat' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/food-to-eat/${id}` : '/food-to-eat/add'
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
            viewFoods(id);
        }
    }, [categories]);
    const viewFoods = async (id) => {
        try {
            //const payload = { params: { id } }
            const payload = {
                    params: {
                        id,
                        admin: true
                    }
                };
            const data = await apiRequest(apiRoutes.viewFoodsEat, 'POST', payload, router);
            if (data?.response) {
                const food = data?.data;
                setForm({
                    title:food?.title || '',
                    titleTa:
                        food?.translations?.ta?.title || '',

                    status:
                        food?.status || '',

                    file:
                        food?.file || '',

                    categoryId:
                        food?.categoryId || '',

                    category:
                        categories.find(
                            cat => cat.id === food.categoryId
                        )?.title || '',

                    categoryTa:
                        food?.translations?.ta?.category ||
                        categories.find(
                            cat => cat.id === food.categoryId
                        )?.labelTa ||
                        '',

                    foodType:
                        food?.foodType || '',

                    foodTypeTa:
                        food?.translations?.ta?.foodType ||
                        foodTypes.find(
                            fd => fd.id === food.foodType
                        )?.labelTa ||
                        '',

                    foodTypeId:
                        food?.foodType || '',

                    momType:
                        food?.momType || '',

                    week:
                        weeks.find(
                            wk => wk.label === food.week
                        )?.label || '',

                    month:
                        food?.month || '',

                    region:
                        food?.region || '',

                    energy:
                        food?.energy || '',

                    duration:
                        food?.duration || '',

                    protein:
                        food?.protein || ''

                });
                // setForm({
                //     title: food?.title || '',
                //     status: food?.status || '',
                //     file: food?.file || '',
                //     categoryId: food?.categoryId || '',
                //     category: categories.find(cat => cat.id === food.categoryId)?.title || '',
                //     foodType: food?.foodType || '',
                //     foodTypeId: foodTypes.find(fd => fd.id === food.foodTypeId)?.label || '',
                //     momType: food.momType,
                //     week: weeks.find(wk => wk.label === food.week)?.label || '',
                //     month:food.month || '',
                //     region: food.region,
                //     energy: food.energy,
                //     duration: food.duration,
                //     protein: food.protein,
                // });
                setViewFood(food)
                setPreviewUrl(food.file)
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
            const data = await apiRequest(apiRoutes.getFoodEatCategoryList, 'POST', payload, router);
            if (data?.response) {
                // const categories = data?.data?.docs.map(item => ({
                //     ...item,
                //     label: item.title
                // }))
                const categories =
                    data?.data?.docs.map(item => ({
                        ...item,
                        label: item.title,
                        labelTa:
                            item?.translations?.ta?.title || ''
                    }));
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
        router.push('/food-to-eat');
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
        console.log("Radio selected:", value);
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
    const handleRegionTypeChange = async (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            region: value,
        }));
    };
    // const handleCategorySelect = (item) => {
    //     setForm((prev) => ({
    //         ...prev,
    //         category: item.title,
    //         categoryId: item.id,
    //     }));
    // };
    const handleCategorySelect = (item) => {
        setForm((prev) => ({
            ...prev,

            category:
                item?.title || '',

            categoryTa:
                item?.translations?.ta?.title ||
                item?.labelTa ||
                '',

            categoryId:
                item?.id || ''
        }));
    };
    // const handleFoodTypeSelect = (item) => {
    //     setForm((prev) => ({
    //         ...prev,
    //         foodType: item.label,
    //         foodTypeId: item.id,
    //     }));
    // };
        const handleFoodTypeSelect = (item) => {
        setForm((prev) => ({
            ...prev,

            foodType:
                item?.label || '',

            foodTypeTa:
                item?.labelTa || '',

            foodTypeId:
                item?.id || ''
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
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setSubmitLoading(true);
        // if (!form.title || !form.foodType || !form.file || !form.category
        //     || !form.region || !form.energy || !form.duration || !form.protein
        // ) {
        //     // showError('Invalid Form');
        //     setSubmitLoading(false);
        //     return;
        // }
        if (
            !form.title ||
            !form.titleTa ||

            !form.foodType ||
            !form.foodTypeTa ||

            !form.file ||

            !form.category ||
            !form.categoryTa ||

            !form.region ||

            !form.energy ||
            !form.duration ||
            !form.protein
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
        const formData =
                objectToFormData(
                    !isEdit ? form : updateForm
                );

            formData.set(
                'titleTa',
                form.titleTa
            );

            formData.set(
                'category',
                form.category
            );

            formData.set(
                'categoryTa',
                form.categoryTa
            );

            formData.set(
                'foodType',
                form.foodType
            );

            formData.set(
                'foodTypeTa',
                form.foodTypeTa
            );

            formData.set(
                'energy',
                form.energy
            );

            formData.set(
                'duration',
                form.duration
            );

            formData.set(
                'protein',
                form.protein
            );
        manageFoods(formData)
    };
    const manageFoods = async (formData) => {
        const action = !isEdit ? apiRoutes.addFoodsEat : apiRoutes.updateFoodsEat
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                const message = isEdit ? 'Food-to-eat updated successfully!' : 'Food-to-eat added successfully!';
                showSuccess(message);
                router.push('/food-to-eat')
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
                <form ref={formRef} onSubmit={handleSubmit} className="d-flex gap-3">
                    <div className="custom-form row" style={{ width: '100%', height: 'max-content' }}>
                        <div className='col-12 col-sm-6 col-md-4'>
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
                        </div>
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
                            <Input
                                label="Name"
                                name="title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                            />
                        </div>
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
                            <Input
                                label="Tamil Name"
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
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
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
                        <div className='col-12 col-sm-6 col-md-4'>
                            <label className="" style={{ fontSize: '13px', fontWeight: '500' }}>Region</label>
                            <div className="d-flex gap-3 mt-1">
                                <RadioGroup
                                    name="regionType"
                                    options={regionOptions}
                                    selectedValue={form.region}
                                    onChange={handleRegionTypeChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
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
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
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
                        </div>
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
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
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
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
                        </div>
                        {form.momType === 'newMom' ? (
                            <div className="mt-2 col-12 col-sm-6 col-md-4" >
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
                            <div className="mt-2 col-12 col-sm-6 col-md-4">
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
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
                            <Input
                                label="Energy"
                                name="energy"
                                placeholder="Example: 65 kcal"
                                type="number"
                                value={form.energy}
                                onChange={(e) => setForm({ ...form, energy: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                            />
                        </div>
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
                            <Input
                                label="Duration"
                                name="duration"
                                placeholder="Example: 10 min"
                                type="number"
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                            />
                        </div>
                        <div className="mt-2 col-12 col-sm-6 col-md-4">
                            <Input
                                label="Protein"
                                name="protein"
                                placeholder="Example: 20 g"
                                type="number"
                                value={form.protein}
                                onChange={(e) => setForm({ ...form, protein: e.target.value })}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
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
                                isLoading={submitLoading}
                                disabled={!form.momType}
                            />
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}


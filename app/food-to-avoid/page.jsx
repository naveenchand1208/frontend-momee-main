'use client';
import './page.css';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { getMonths, getWeeks,formattedDate } from '@/common/utils/util';
import { MOM_TYPE, FOOD_TYPE, FOOD_REGION } from '@/common/constants/enum';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
import PaginationComponent from '@/components/shared/pagination/page';
export default function Food_to_avoid() {
    const router = useRouter();
    const fetchedRef = useRef(false);
    const [foods, setFoods] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [viewform, setViewform] = useState({});
    const [addLoading, setAddLoading] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [months, setMonths] = useState(false);
    const [weeks, setWeeks] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('Active/Inactive');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [totalCount, setTotalCount] = useState(0);
    const [lastPageBeforeFilter, setLastPageBeforeFilter] = useState(1)
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        momType: '',
        dateRange: { fromDate: '', toDate: '' },
        month: '',
        week: '',
        foodType: '',
        region: '',
    });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Foods To Avoid', href: '/food-to-avoid' },
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
            backgroundColor: Colors.Primary2,
            onClick: () => setFilterOpen(true),
        },
        {
            type: 'statusTabs',
            onChange: (val) => {
                if (val === 'All') {
                    setForm((prev) => ({ ...prev, status: '' }));
                    const filters = { ...form };
                    delete filters.status;
                    fetchFoods(filters);
                    setStatusLabel('Active/Inactive');
                } else {
                    setForm((prev) => ({ ...prev, status: val }));
                    fetchFoods({ ...form, status: val });
                    setStatusLabel(val);
                }
            },
        },
        {
            iconPath: '/assets/icons/category-icon.svg',
            label: 'Category',
            type: 'textIcon',
            isLoading: categoryLoading,
            onClick: () => handleAddCategory(),
        },
        {
            iconPath: '/assets/icons/new-icon.svg',
            label: 'Add',
            type: 'button',
            size: 'extraSmall',
            color: '#fff',
            backgroundColor: Colors.Primary1,
            isLoading: addLoading,
            onClick: () => handleAddFoods(),
        }

    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search title',
            inputType: 'text',
            value: form.searchKey,
        },
        // {
        //     name: 'status',
        //     label: '',
        //     placeholder: 'Choose Status',
        //     inputType: 'autocomplete',
        //     options: ACTIVE_STATUS,
        //     value: form.status,
        // },
        {
            name: 'foodType',
            label: '',
            placeholder: 'Choose Food type',
            inputType: 'autocomplete',
            options: FOOD_TYPE,
            value: form.foodType,
        },
        {
            name: 'region',
            label: '',
            placeholder: 'Choose Region',
            inputType: 'autocomplete',
            options: FOOD_REGION,
            value: form.region,
        },
        {
            name: 'momType',
            label: '',
            placeholder: 'Choose Mom type',
            inputType: 'autocomplete',
            options: MOM_TYPE,
            value: form.momType,
        },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        },
        {
            name: 'month',
            label: '',
            placeholder: 'Choose month',
            inputType: 'autocomplete',
            options: months,
            value: form.month,
        },
        {
            name: 'week',
            label: '',
            placeholder: 'Choose week',
            inputType: 'autocomplete',
            options: weeks,
            value: form.week,
        }
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchFoods();
    }, []);
    useEffect(() => {
        const month = getMonths();
        setMonths(month);
        const week = getWeeks();
        setWeeks(week);
    }, []);
    const fetchFoods = async (options = {}) => {
        setIsLoading(true);
        const formatDate = (date) =>
            date ? new Date(date).toISOString().split('T')[0] : '';
        const currentPage = options.page || page;
        const currentLimit = options.limit || limit;
        const payload = {
            params: {
                pagination: 'true',
                page: String(currentPage),
                limit: String(currentLimit),
                searchKey: options.searchKey || '',
                status: options.status || '',
                foodType: options.foodType || '',
                momType:
                    options.momType === 'Preg Mom'
                        ? 'pregMom'
                        : options.momType === 'New Mom'
                            ? 'newMom'
                            : '',
                week: options.week || '',
                month: options.month || '',
                region: options.region || '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getFoodsAvoidList, 'POST', payload, router);
            if (data?.response) {
                setFoods(data.data.docs);
                setTotalCount(data.data.totalDocs || 0);
                setPage(data.data.page || currentPage);
                setLimit(data.data.limit || currentLimit);
            }
        } catch (err) {
            console.error('Failed to fetch articles:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleEdit = (row) => {
        router.push(`/food-to-avoid/${row?.id}`)
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
        const payload = { params: { id: viewform.id } }
        const data = await apiRequest(apiRoutes.deleteFoodsAvoid, 'POST', payload, router);
        if (data.response) {
            fetchFoods()
        }
    };

    const handleFilterSubmit = (filterValues) => {
        const isClearingFilter =
            !filterValues.searchKey &&
            !filterValues.momType &&
            !filterValues.month &&
            !filterValues.week &&
            !filterValues.foodType &&
            !filterValues.region &&
            (!filterValues.dateRange?.fromDate && !filterValues.dateRange?.toDate);
        setFilterOpen(false)
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            momType: filterValues.momType || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
            month: filterValues.month || '',
            week: filterValues.week || '',
            foodType: filterValues.foodType || '',
            region: filterValues.region || '',
        }));
        if (isClearingFilter) {
            setPage(lastPageBeforeFilter);
            fetchFoods({ ...filterValues, page: lastPageBeforeFilter });
        } else {
            setLastPageBeforeFilter(page);
            setPage(1);
            fetchFoods({ ...filterValues, page: 1 });
        }
    }
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const handleAddFoods = () => {
        setAddLoading(true);
        router.push('/food-to-avoid/add')
    }
    const handleAddCategory = () => {
        setCategoryLoading(true);
        router.push('/food-to-avoid/manage-category')
    }
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
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
            ) : foods.length === 0 ? (
                <div style={{ textAlign: 'center', width: '100%', marginTop: '280px', color: '#999' }}>
                    <p style={{ fontSize: '16px' }}>No foods found</p>
                </div>
            ) : (
                <div className="food-grid">
                    {foods.map((food) => (
                        <div key={food.id} className="food-card-wrapper">
                            <div className="food-card">
                                <div style={{
                                    fontSize: '11px', marginLeft: '130px', color: '#6b7280'
                                }}>{food.momType}</div>
                                <div style={{
                                    fontSize: '11px', marginRight: '130px', color: '#6b7280', marginTop: '-15px'
                                }}>
                                    {food.momType === 'pregMom' && food.week
                                        ? food.week
                                        : food.momType === 'newMom' && food.month
                                            ? `Month ${food.month}`
                                            : null}

                                </div>
                                <div className="food-image-container mt-1">
                                    <Image
                                        src={food?.file || '/assets/food.jpg'}
                                        alt={food?.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="food-overlay">
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginTop: '16px',
                                            }}
                                        >
                                            <span className="food-type">
                                                {food.foodType || 'Type'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="food-footer">
                                    <div className="food-footer-text" style={{ flex: 1 }}>
                                        <p className="truncate w-[120px]" title={food.title || 'Unknown Title'}>
                                            {food.title || 'Unknown Title'}
                                        </p>
                                        <p className="truncate w-[120px]" title={food.category?.title || 'Unknown Title'}>{food.category?.title || 'Favourited by'}</p>
                                        <p style={{ fontSize: '10px' }}>Created at: {formattedDate(food.createdAt)}</p>

                                        {/* <p>
                                            {food.momType === 'pregMom' && food.week
                                                ? food.week
                                                : food.momType === 'newMom' && food.month
                                                    ? food.month
                                                    : null}
                                        </p> */}
                                    </div>

                                    <div className="d-flex justify-content-center gap-2 mt-3 cursor">
                                        {actionConfig.length > 0 &&
                                            actionConfig.map((action) => (
                                                <Image
                                                    key={action.iconName}
                                                    src={`/assets/icons/${action.iconName}.svg`}
                                                    alt={action.iconName}
                                                    width={14}
                                                    height={14}
                                                    onClick={() => action.onClick(food)}
                                                />
                                            ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
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
                <div className="mt-5">
                    <PaginationComponent
                        totalCount={totalCount}
                        page={page}
                        limit={limit}
                        onPageChange={(newPage) => {
                            setPage(newPage);
                            fetchFoods({ ...form, page: newPage });
                        }}
                    />

                </div>
            )}
        </div>
    )
}



'use client';
import './page.css';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import { Colors } from '@/common/constants/colorEnum';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import { objectToFormData } from '@/common/utils/util';
export default function Orders() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [productOptions, setProductOptions] = useState(false);
    const [userOptions, setUserOptions] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [dropdownSelections, setDropdownSelections] = useState({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [viewform, setViewform] = useState({});
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('');
    const isDownloadingRef = useRef(false);
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        dateRange: { fromDate: '', toDate: '' },
        productId: '',
        userId: '',
    });
    const fetchedRef = useRef(false);
    const productFetchedRef = useRef(false);
    const userFetchedRef = useRef(false);
    const breadcrumbItems = [
        { label: 'Product Management' },
        { label: 'orders', href: '/orders' },
    ];
    const breadcrumbAction = [
        // {
        //     label: 'Add',
        //     type: 'button',
        //     size: 'small',
        //     color: '#fff',
        //     backgroundColor: '#e88691',
        //     isLoading: addLoading,
        //     onClick: () => handleAddPodCasts(),
        // }
        {
            iconPath: '/assets/icons/download-icon.svg',
            type: 'textIcon',
            label: 'Export',
            onClick: () => downloadExcel(),
        },
        {
            iconPath: '/assets/icons/outlined-filter-icon.svg',
            type: 'textIcon',
            label: 'Filter',
            onClick: () => setFilterOpen(true),
        },
        // {
        //     type: 'statusTabs',
        //     onChange: (val) => {
        //         if (val === 'All') val = '';
        //         setStatusLabel(val)
        //         setForm((prev) => {
        //             const updatedForm = { ...prev, status: val };
        //             fetchOrders(1, 10, updatedForm);
        //             return updatedForm;
        //         });
        //     }
        // },
    ];
    const myTableHeaders = [
        { id: 'file', label: 'Thumbnail', sortable: false },
        { id: 'productName', label: 'Product Name', sortable: true },
        { id: 'price', label: 'Price', sortable: true },
        { id: 'quantity', label: 'Quantity', sortable: true },
        { id: 'userName', label: 'User', sortable: true },
        { id: 'dropdownStatus', label: 'Status', sortable: false },
        // { id: 'action', label: 'Action', sortable: false },
    ];
    const dropdownStatusOptions = [
        { id: 'Ordered', label: 'Ordered' },
        { id: 'Delivered', label: 'Delivered' },
        { id: 'Returned', label: 'Returned' },
        { id: 'Cancelled', label: 'Cancelled' }
    ]
    const inputFields = [
        {
            name: 'productId',
            placeholder: 'Choose Product',
            inputType: 'autocomplete',
            options: productOptions,
            value: form.productId,
        },
        {
            name: 'status',
            label: '',
            placeholder: 'Choose Status',
            inputType: 'autocomplete',
            options: dropdownStatusOptions,
            value: form.status,
        },
        {
            name: 'userId',
            label: '',
            placeholder: 'Choose User',
            inputType: 'autocomplete',
            options: userOptions,
            value: form.userId,
        },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        }
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchOrders(page + 1, rowsPerPage, { sortField, sortOrder });
    }, []);
    useEffect(() => {
        if (productFetchedRef.current) return;
        productFetchedRef.current = true;
        const fetchProductOptions = async () => {
            try {
                const payload = { params: { pagination: 'false' } };
                const data = await apiRequest(apiRoutes.getProductList
                    , 'POST', payload, router);
                if (data?.response) {
                    const products = data.data.docs.map((product) => ({
                        label: product.name,
                        value: product.id,
                    }));
                    setProductOptions(products);
                    console.log(products);
                }
            } catch (error) {
                console.error('Failed to fetch plan options:', error);
            }
        };
        fetchProductOptions();
    }, []);
    useEffect(() => {
        if (userFetchedRef.current) return;
        userFetchedRef.current = true;
        const fetchUserOptions = async () => {
            try {
                const payload = { params: { pagination: 'false' } };
                const data = await apiRequest(apiRoutes.userList
                    , 'POST', payload, router);
                if (data?.response) {
                    const users = data.data.docs.map((user) => ({
                        label: user.userName,
                        value: user.id,
                    }));
                    setUserOptions(users);
                    console.log(users);
                }
            } catch (error) {
                console.error('Failed to fetch plan options:', error);
            }
        };
        fetchUserOptions();
    }, []);
    const fetchOrders = async (pageNum = 1, limit = 5, options = {}) => {
        setIsLoading(true);
        const formatDate = (date) =>
            date ? new Date(date).toISOString().split('T')[0] : '';
        const payload = {
            params: {
                sortField: options.sortField || '',
                sortOrder: options.sortOrder || 'asc',
                pagination: 'true',
                page: pageNum,
                limit: limit,
                searchKey: options.searchKey || '',
                status: options.status || '',
                productId: options.productId || '',
                userId: options.userId || '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };

        try {
            const data = await apiRequest(apiRoutes.getOrdersList, 'POST', payload, router);
            if (data?.response) {
                // const responseDate = data?.data?.docs?.map(order => ({
                //     ...order,
                //     productName: order.product.name,
                //     price: order.product.price,
                //     file: order.product.file1,
                //     userName: order.user.userName,
                //     dropdownStatus: order.status,
                // }))
                const responseDate = data?.data?.docs?.map(order => ({
                    ...order,
                    productName: order.product?.name,
                    quantity: order.quantity || '1',
                    price: order.product?.price,
                    file: order.product?.files?.[0]?.url ?? null,
                    userName: order.user?.userName,
                    dropdownStatus: order.status,
                }));

                console.log('responseDate', responseDate)
                setOrders(responseDate);
                setTotalDocs(data?.data?.totalDocs);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchOrders(finalPage + 1, finalRowsPerPage, { sortField, sortOrder });
    };
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchOrders(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    // const handleToggleStatus = async (updatedRow) => {
    //     setIsLoading(true);
    //     // const payload = { params: updatedRow };
    //     const formData = new FormData();
    //     for (const key in updatedRow) {
    //         if (updatedRow.hasOwnProperty(key)) {
    //             const value = updatedRow[key];
    //             formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    //         }
    //     }
    //     try {
    //         const data = await apiRequest(apiRoutes.updatePodCasts, 'POST', formData, router);
    //         fetchOrders()
    //     } catch (error) {
    //         console.error('Failed to fetch subscriptions:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    // const handleAddPodCasts = () => {
    //     setAddLoading(true);
    //     router.push('/podcasts/add');
    // }
    // const handleEdit = (row) => {
    //     router.push(`/orders/${row?.id}`)
    // };
    // const handleDelete = (row) => {
    //     setViewform(row)
    //     setIsDeleteDialogOpen(true)
    // };
    const actionConfig = [
        // { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        // { iconName: 'view-icon', disabled: false, onClick: handleView },
        // { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    // const handleDeleteCancel = () => {
    //     setIsDeleteDialogOpen(false);
    // };
    // const handleDeleteConfirm = async () => {
    //     setIsDeleteDialogOpen(false);
    //     const payload = { params: { id: viewform.id } }
    //     const data = await apiRequest(apiRoutes.deleteOrders, 'POST', payload, router);
    //     if (data.response) {
    //         fetchOrders(page + 1, rowsPerPage, {})
    //     }
    // };
    const handleDropdownChange = async (updatedRow) => {
        console.log('Updated Row:', updatedRow);
        if (updatedRow) {
            setIsLoading(true);
            const formData = objectToFormData(updatedRow);
            const payload = { params: updatedRow }
            try {
                const data = await apiRequest(apiRoutes.updateOrders, 'POST', payload, router);
                fetchOrders()
            } catch (error) {
                console.error('Failed to fetch subscriptions:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };
    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false)
        const productId = productOptions.find(productId => productId.label === filterValues.productId)?.value;
        filterValues.productId = productId;
        const userId = userOptions.find(userId => userId.label === filterValues.userId)?.value;
        filterValues.userId = userId;
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            status: filterValues.status || '',
            productId: filterValues.productId || '',
            userId: filterValues.userId || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
        }));
        fetchOrders(page + 1, rowsPerPage, { sortField, sortOrder, ...filterValues },);
    }
    const downloadExcel = async () => {
        if (isDownloadingRef.current) return;
        isDownloadingRef.current = true;
        try {
            const { searchKey, ...rest } = form;
            const payload = {
                params: {
                    ...rest,
                }
            };
            await apiRequest(apiRoutes.ordersExport, 'POST', payload, router, 'blob', 'order.xlsx');
        } catch (error) {
            console.log('Excel download error:', error);
            showError(error.message || 'Download failed');
        } finally {
            isDownloadingRef.current = false;
        }
    };
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <MaterialTable
                headers={myTableHeaders}
                data={orders}
                actionConfig={actionConfig}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalDocs}
                isLoading={isLoading}
                dropdownStatusOptions={dropdownStatusOptions}
                sortConfig={{ [sortField]: sortOrder }}
                onSortChange={handleSortChange}
                // onToggleStatus={handleToggleStatus}
                onTableChange={handleTableChange}
                onDropdownChange={handleDropdownChange}
                dropdownSelections={dropdownSelections}
            />
            {/* <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title='Delete'
                message="Are you sure you want to delete?"
                cancelLabel="No"
                confirmLabel="Yes"
            /> */}
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
        </div>
    );
}

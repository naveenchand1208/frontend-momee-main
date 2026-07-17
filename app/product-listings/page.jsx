'use client';
import './page.css';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { ACTIVE_STATUS, MOM_TYPE } from '@/common/constants/enum';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import { Colors } from '@/common/constants/colorEnum';
import { Tooltip } from '@mui/material';
import { CircularProgress } from '@mui/material';
import Banner from '../banner/[id]/page';
import PaginationComponent from '@/components/shared/pagination/page';
import { formattedDate } from '@/common/utils/util';
export default function Product_Listings() {
  const router = useRouter();
  const fetchedRef = useRef(false);
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewform, setViewform] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [statusLabel, setStatusLabel] = useState('Active/Inactive');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [form, setForm] = useState({
    searchKey: '',
    status: '',
    momType: '',
    dateRange: { fromDate: '', toDate: '' },
  });
  const breadcrumbItems = [
    { label: 'Product Management' },
    { label: 'Product Listings', href: '/product-listings' },
  ];
  const breadcrumbAction = [
    // {
    //   iconPath: '/assets/icons/download-icon.svg',
    //   type: 'textIcon',
    //   label: 'Export',
    //   onClick: () => console.log('Download clicked'),
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
          fetchProducts(filters);
          setStatusLabel('Active/Inactive');
        } else {
          setForm((prev) => ({ ...prev, status: val }));
          fetchProducts({ ...form, status: val });
          setStatusLabel(val);
        }
      },
    },
    {
      iconPath: '/assets/icons/new-icon.svg',
      label: 'Add',
      type: 'button',
      size: 'extraSmall',
      color: '#fff',
      backgroundColor: Colors.Primary1,
      isLoading: addLoading,
      onClick: () => handleAddProducts(),
    },

  ];
  const inputFields = [
    {
      name: 'searchKey',
      placeholder: 'search product name',
      inputType: 'text',
      value: form.searchKey,
    },
    // {
    //   name: 'status',
    //   label: '',
    //   placeholder: 'Choose Status',
    //   inputType: 'autocomplete',
    //   options: ACTIVE_STATUS,
    //   value: form.status,
    // },
    {
      name: 'momType',
      label: '',
      placeholder: 'Choose mom type',
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
    }
  ];
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchProducts();
  }, []);
  const fetchProducts = async (options = {}) => {
    setIsLoading(true);
    const formatDate = (date) =>
      date ? new Date(date).toISOString().split('T')[0] : '';
    const currentPage = options.page || page;
    const currentLimit = options.limit || limit;
    const payload = {
      params: {
        pagination: 'true',
        page: currentPage,
        limit: currentLimit,
        searchKey: options.searchKey || '',
        status: options.status || '',
        momType:
          options.momType === 'Preg Mom'
            ? 'pregMom'
            : options.momType === 'New Mom'
              ? 'newMom'
              : '',
        fromDate: formatDate(options.dateRange?.fromDate),
        toDate: formatDate(options.dateRange?.toDate),

      }
    };
    try {
      const data = await apiRequest(apiRoutes.getProductList, 'POST', payload, router);
      if (data?.response)
        setFoods(data.data.docs);
      setTotalCount(data.data.totalDocs || 0);
      setPage(data.data.page || currentPage);
      setLimit(data.data.limit || currentLimit);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEdit = (row) => router.push(`/product-listings/${row.id}`);
  const handleDelete = (row) => {
    setViewform(row);
    setIsDeleteDialogOpen(true);
  };
  // const handleAdd = (row) => {
  //  router.push(`/banner/${row.id}`);
  // };
  const handleAdd = (row) => {
    setSelectedProduct(row.id);
    setIsBannerDialogOpen(true);
  }
  const handleDeleteCancel = () => setIsDeleteDialogOpen(false);
  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    if (!viewform?.id) return console.error('Missing product ID');

    try {
      const data = await apiRequest(apiRoutes.deleteProducts, 'POST', { params: { id: viewform.id } }, router);
      if (data.response) fetchProducts();
      else alert('Delete failed: ' + (data?.message || 'Unknown error'));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('An unexpected error occurred.');
    }
  };
  const handleFilterSubmit = (filterValues) => {
    setFilterOpen(false);
    setPage(1);

    const updatedFilters = {
      searchKey: filterValues.searchKey || '',
      status: filterValues.status || '',
      momType: filterValues.momType || '',
      dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
    };

    setForm(prev => ({
      ...prev,
      ...updatedFilters,
    }));

    // fetch first page with new filters
    fetchProducts({
      page: 1,
      limit,
      sortField,
      sortOrder,
      ...updatedFilters,
    });
  };

  const actionConfig = [
    { iconName: 'edit-icon', disabled: false, onClick: handleEdit, tooltip: 'edit' },
    { iconName: 'delete-icon', disabled: false, onClick: handleDelete, tooltip: 'delete' },
    { iconName: 'add-icon', disabled: false, onClick: handleAdd, tooltip: 'Add banner' }
  ];
  const handleAddProducts = () => {
    setAddLoading(true);
    router.push('/product-listings/add');
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
      ) : foods.length === 0 ? (
        <div style={{ textAlign: 'center', width: '100%', marginTop: '280px', color: '#999' }}>
          <p style={{ fontSize: '16px' }}>No products found</p>
        </div>
      ) : (
        <div className="product-grid">
          {foods.map((item) => (
            <div
              key={item.id}
              className="product-card bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition w-[240px]"
            >
              <div className="relative">
                <span className="discount-badge absolute top-2 left-2">
                  {item.discountPercentage}%
                </span>
                <Image
                  src={item.files?.[0]?.url || ''}
                  alt={item.name}
                  width={350}
                  height={450}
                  className="w-full h-[140px] object-contain rounded mt-5"
                />
              </div>
              <div className="mt-3">
                <h3 className="text-[18px] font-semibold text-[#1d2371] truncate">
                  {item.name || 'Product Name'}
                </h3>
                <div className="mt-2 flex justify-center items-center gap-2 text-sm">
                  <span className="text-[#7e8299] line-through font-medium fs-16">
                    ₹{item.actualPrice}
                  </span>
                  <span className="text-black text-[16px] font-bold">₹{item.price}</span>
                </div>
                <span className="text-black text-[12px]">Created Date: {formattedDate(item.createdAt)}</span>

                <div className="flex justify-center gap-4 mt-3">
                  {actionConfig.map((action) => (
                    <Tooltip title={action.tooltip ?? ''} key={action.iconName}>
                      <Image
                        key={action.iconName}
                        src={`/assets/icons/${action.iconName}.svg`}
                        alt={action.iconName}
                        width={18}
                        height={18}
                        onClick={() => action.onClick(item)}
                        className="cursor"
                      />
                    </Tooltip>
                  ))}
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
        title="Delete"
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
      <CustomDialog
        open={isBannerDialogOpen}
        onClose={() => {
          setIsBannerDialogOpen(false);
          setTimeout(() => setSelectedProduct(null), 200);
        }}
        title="Add Banner"
        titleColor="#000000"
        backgroundColor="#fafcfc"
        content={
          <Banner
            product={selectedProduct}
            onClose={() => {
              setIsBannerDialogOpen(false);
              setSelectedProduct(null);
              fetchProducts({ sortField, sortOrder });
            }}
          />
        }
        maxWidth="xs"
      />
      {totalCount > limit && (
        <div className="mt-5">
          <PaginationComponent
            totalCount={totalCount}
            page={page}
            limit={limit}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchProducts({ ...form, page: newPage });
            }}
          />
        </div>
      )}
    </div>
  );
}

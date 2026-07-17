'use client';
import './page.css';
import { Colors } from '@/common/constants/colorEnum';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { objectToFormData } from '@/common/utils/util';
import { ACTIVE_STATUS, MOM_TYPE } from '@/common/constants/enum';
import { getMonths, getWeeks, formatDate } from '@/common/utils/util';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import { useDispatch } from 'react-redux';
import { setArticles } from '@/common/store/auth/articleSlice';
import Banner from '../banner/[id]/page';
import { hexToRgba } from '@/common/utils/colorUtils';

export default function Articles() {
  const router = useRouter()
  const dispatch = useDispatch();
  // const articles = useSelector((state) => state.articles.list);
  // const totalDocs = useSelector((state) => state.articles.total);
  const [formattedData, setFormattedData] = useState([]);
  const fetchedRef = useRef(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  const [viewform, setViewform] = useState({});
  const [articles, setArticles] = useState([]);
  const [months, setMonths] = useState(false);
  const [weeks, setWeeks] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [statusLabel, setStatusLabel] = useState('');

  const [form, setForm] = useState({
    searchKey: '',
    status: '',
    momType: '',
    dateRange: { fromDate: '', toDate: '' },
    month: '',
    week: '',
  });
  const [indexOpen, setIndexOpen] = useState(false);
  const [indexForm, setIndexForm] = useState({
    id: '',
    index: '',
  });
  const breadcrumbItems = [
    { label: 'Content Management' },
    { label: 'Articles', href: '/articles' },
  ];
  const breadcrumbAction = [
    // {
    //   iconPath: '/assets/icons/download-icon.svg',
    //   type: 'textIcon',
    //   label: 'Export',
    //   onClick: () => downloadExcel(),
    // },
    {
      iconPath: '/assets/icons/outlined-filter-icon.svg',
      type: 'textIcon',
      label: 'Filter',
      onClick: () => setFilterOpen(true),
    },
    {
      type: 'statusTabs',
      // onChange: (val) => {
      //   if (val === 'All') val = '';
      //   setStatusLabel(val)
      //   setForm((prev) => {
      //     const updatedForm = { ...prev, status: val };
      //     fetchArticles(1, 10, updatedForm);
      //     return updatedForm;
      //   });
      // }
      onChange: (val) => {
        if (val === 'All') val = '';
        setStatusLabel(val);

        const updatedForm = { ...form, status: val };

        setPage(0); // reset to first page
        setForm(updatedForm);

        fetchArticles(
          1,                 // page 1
          rowsPerPage,       // use selected rowsPerPage
          { ...updatedForm, sortField, sortOrder }
        );
      }

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
      onClick: () => handleAddArticle(),
    }
  ];
  const myTableHeaders = [
    { id: 'file', label: 'Thumbnail', sortable: false },
    { id: 'title', label: 'Article Name', sortable: true },
    {
      id: 'categoryTitle',
      label: 'Category Name',
      sortable: true,
      render: (row) => {
        const catColor = row.category?.color || '#000';
        return (
          <span
            style={{
              color: catColor,
              backgroundColor: hexToRgba(catColor, 0.1),
              padding: '4px 12px',
              borderRadius: '5px',
              display: 'inline-block',
              fontWeight: 'bolder'
            }}
          >
            {row.category?.title || 'No category'}
          </span>
        );
      }
    },
    { id: 'momType', label: 'Mom Type', sortable: true },
    { id: 'period', label: 'Period', sortable: true },
    { id: 'status', label: 'Status', sortable: false },
    { id: 'createdAt', label: 'Created Date', sortable: false },
    { id: 'action', label: 'Action', sortable: false },
  ];
  const indexFields = [
    {
      type: 'number',
      name: 'index',
      placeholder: 'Enter Type',
      inputType: 'text',
      value: indexForm.index,
    }
  ]
  const inputFields = [
    {
      name: 'searchKey',
      placeholder: 'search article name',
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
    const month = getMonths();
    setMonths(month);
    const week = getWeeks();
    setWeeks(week);
  }, []);
  // useEffect(() => {
  //   if (fetchedRef.current) return;
  //   fetchedRef.current = true;
  //   fetchArticles(page + 1, rowsPerPage, { sortField, sortOrder });
  // }, []);
  // useEffect(() => {
  //   fetchArticles(page + 1, rowsPerPage, { sortField, sortOrder, ...form })
  //     .then((formatted) => {
  //       if (formatted) setFormattedData(formatted);
  //     });
  // }, [page, rowsPerPage, sortField, sortOrder, form]);
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchArticles(page + 1, rowsPerPage, { sortField, sortOrder, ...form })
        .then((formatted) => {
          if (formatted) setFormattedData(formatted);
        });
    }
  }, [page, rowsPerPage, sortField, sortOrder, form]);
  const handleEdit = (row) => {
    router.push(`/articles/${row?.id}`)
  };
  const handleIndexChange = async (row) => {
    console.log('row', row)
    setIndexOpen(true)
    setIndexForm((prev) => ({
      ...prev,
      id: row.id,
      index: row.index,
    }))
  }
  // const handleAdd = (row) => {
  //   router.push(`/banner/${row?.id}`)
  // };
  const handleAdd = (row) => {
    setSelectedArticle(row.id);
    setIsBannerDialogOpen(true);
  }
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
    const data = await apiRequest(apiRoutes.deleteArticles, 'POST', payload, router);
    if (data.response) {
      fetchArticles(page + 1, rowsPerPage, {})
    }
  };
  const actionConfig = [
    { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
    { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    { iconName: 'add-icon', disabled: false, onClick: handleAdd, tooltip: 'Add banner' },
    // { iconName: 'index-change', disabled: false, onClick: handleIndexChange, tooltip: 'index' },
  ];
  const fetchArticles = async (pageNum, limit, options = {}) => {
    setIsLoading(true);
    // const formatDate = (date) =>
    //   date ? new Date(date).toISOString().split('T')[0] : '';
    const payload = {
      params: {
        sortField: options.sortField || '',
        sortOrder: options.sortOrder || 'asc',
        pagination: 'true',
        page: pageNum,
        limit: limit,
        searchKey: options.searchKey || '',
        status: options.status || '',
        momType:
          options.momType === 'Preg Mom'
            ? 'pregMom'
            : options.momType === 'New Mom'
              ? 'newMom'
              : '',
        week: options.week || '',
        month: options.month || '',
        subscribed:
          options.subscribed === 'Subscribed'
            ? 'true'
            : options.subscribed === 'Not Subscribed'
              ? 'false'
              : '',
        fromDate: options.dateRange?.fromDate,
        toDate: options.dateRange?.toDate,
      },
    };
    try {
      const data = await apiRequest(apiRoutes.getArticlesList, 'POST', payload, router);
      console.log('Fetched articles:', data);
      if (data?.response) {
        const articles = data?.data?.docs || [];

        const formatted = articles.map((art) => ({
          ...art,
          // period: art.week
          //   ? `Week ${Number(art.week)}`
          //   : art.month
          //     ? `Month ${Number(art.month)}`
          //     : '-',
          period:
            art.momType === 'pregMom'
              ? (art.week ? `Week ${art.week.replace(/\D/g, '')}` : '-')
              : art.momType === 'newMom'
                ? (art.month ? `Month ${art.month.replace(/\D/g, '')}` : '-')
                : '-',


          categoryTitle: art.category?.title || '-',
          createdAt: formatDate(art.createdAt, 'DD MMM YYYY'),
        }));

        setArticles(formatted);
        setTotalDocs(data?.data?.totalDocs || 0);

        // dispatch(setArticles({ list: formatted, total: data?.data?.totalDocs }));
        return formatted;
      }

    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleIndexSubmit = async (filterValues) => {
    console.log('filterValues', filterValues)
    if (Object.keys(filterValues) && filterValues.index !== '') {
      setIndexForm(prev => ({
        ...prev,
        id: filterValues.id || '',
        index: Number(filterValues.index) || '',
      }));
      const payload = {
        params: {
          // ...indexForm,
          id: filterValues.id,
          newIndex: Number(filterValues.index)
        }
      }
      console.log('payload', payload)
      try {
        const data = await apiRequest(apiRoutes.updateIndexArticles, 'POST', payload, router);
        if (data.response) {
          // setCategoryList(data?.data?.docs);
          // setTotalDocs(data?.data?.totalDocs);
          fetchArticles(page + 1, rowsPerPage, { sortField, sortOrder });
          setIndexOpen(false)
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      }
    } else {
      setIndexOpen(false)
    }
  }
  // const handleFilterSubmit = (filterValues) => {
  //   setFilterOpen(false)
  //   const selectedWeek = weeks.find(e => e.label === filterValues.week);
  //   const weekId = selectedWeek?.label;
  //   const resetPage = 0;
  //   setPage(resetPage);
  //   setForm(prev => ({
  //     ...prev,
  //     searchKey: filterValues.searchKey || '',
  //     // status: filterValues.status || '',
  //     momType: filterValues.momType || '',
  //     dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
  //     month: filterValues.month || '',
  //     week: filterValues.week || '',
  //   }));
  //   fetchArticles(resetPage + 1, rowsPerPage, { sortField, sortOrder, ...filterValues, week: weekId },);
  // }
  const handleFilterSubmit = (filterValues) => {
    setFilterOpen(false);
    const selectedWeek = weeks.find(e => e.label === filterValues.week);
    const weekId = selectedWeek?.label;
    const resetPage = 0;

    // Build the updated form first
    const updatedForm = {
      ...form,
      searchKey: filterValues.searchKey || '',
      momType: filterValues.momType || '',
      dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
      month: filterValues.month || '',
      week: filterValues.week || '',
    };

    setPage(resetPage);
    setForm(updatedForm);

    // Pass updatedForm instead of filterValues
    fetchArticles(resetPage + 1, rowsPerPage, {
      sortField,
      sortOrder,
      ...updatedForm,
      week: weekId
    });
  };

  const handleTableChange = ({ newPage, newRowsPerPage }) => {
    const finalPage = newPage !== undefined ? newPage : page;
    const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;
    if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
    if (newPage !== undefined) setPage(newPage);
    fetchArticles(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
  };
  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortOrder(direction);
    fetchArticles(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
  };
  const handleAddCategory = () => {
    setCategoryLoading(true);
    router.push('/articles/manage-category');
  };
  const handleAddArticle = () => {
    setAddLoading(true);
    router.push('/articles/add');
  }
  const handleToggleStatus = async (updatedRow) => {
    setIsLoading(true);
    const payload = {
      id: updatedRow.id,
      status: updatedRow.status
    };
    const formData = objectToFormData(payload)
    try {
      const data = await apiRequest(apiRoutes.updateArticles, 'POST', formData, router);
      fetchArticles(page + 1, rowsPerPage, { sortField, sortOrder, ...form })
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setIsLoading(false);
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
        data={articles}
        actionConfig={actionConfig}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalDocs}
        isLoading={isLoading}
        sortConfig={{ [sortField]: sortOrder }}
        onSortChange={handleSortChange}
        onToggleStatus={handleToggleStatus}
        onTableChange={handleTableChange}
      />
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
      {
        indexForm && (
          <CustomDialog
            open={indexOpen}
            onClose={() => setIndexOpen(false)}
            title=""
            titleColor="#000000"
            backgroundColor="#fafcfc"
            content={
              <CommonFilter
                inputFields={indexFields}
                initialValues={indexForm}
                onSubmit={(formValues) => handleIndexSubmit(formValues)}
                onclose={() => handleIndexSubmit({})}
              />
            }
            actions={
              <button type="button" onClick={() => setIndexOpen(false)}>
                Close
              </button>
            }
            maxWidth="xs"
            position="top-left"
          />
        )
      }
      <CustomDialog
        open={isBannerDialogOpen}
        onClose={() => {
          setIsBannerDialogOpen(false);
          setTimeout(() => setSelectedArticle(null), 200);
        }}
        title="Add Banner"
        titleColor="#000000"
        backgroundColor="#fafcfc"
        content={
          <Banner
            product={selectedArticle}
            onClose={() => {
              setIsBannerDialogOpen(false);
              setSelectedArticle(null);
              fetchArticles(page + 1, rowsPerPage, { sortField, sortOrder });
            }}
          />
        }
        maxWidth="xs"
      />
    </div>
  );
}

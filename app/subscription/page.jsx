'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { Colors } from '@/common/constants/colorEnum';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
export default function Subscription() {
  const router = useRouter();
  const fetchedRef = useRef(false);
  const [page, setPage] = useState(0);
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  const [statusLabel, setStatusLabel] = useState('');
  const isDownloadingRef = useRef(false);
  const [form, setForm] = useState({
    searchKey: '',
    status: '',
    // momType: '',
    dateRange: { fromDate: '', toDate: '' },
  });
  const breadcrumbItems = [
    { label: 'User Management' },
    { label: 'Subscription', href: '/subscription' },
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
      onChange: (val) => {
        if (val === 'All') val = '';
        setStatusLabel(val)
        setForm((prev) => {
          const updatedForm = { ...prev, status: val };
          fetchSubscriptions(1, 10, updatedForm);
          return updatedForm;
        });
      }
    },
    {
      iconPath: '/assets/icons/new-icon.svg',
      label: 'Add',
      type: 'button',
      size: 'extraSmall',
      backgroundColor: Colors.Primary1,
      isLoading: addLoading,
      onClick: () => navigateToAddPage(),
    },

  ];
  const myTableHeaders = [
    { id: 'planName', label: 'Plan Name', sortable: true },
    { id: 'planAmount', label: 'Plan Amount', sortable: true },
    { id: 'durationMonths', label: 'Duration Months', sortable: false },
    // { id: 'momType', label: 'Mom Type', sortable: false },
    { id: 'status', label: 'Status', sortable: false },
    { id: 'action', label: 'Action', sortable: false },
  ];
  const inputFields = [
    {
      name: 'searchKey',
      placeholder: 'search plan name',
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
    // {
    //   name: 'momType',
    //   label: '',
    //   placeholder: 'Choose mom type',
    //   inputType: 'autocomplete',
    //   options: MOM_TYPE,
    //   value: form.momType,
    // },
    {
      name: 'dateRange',
      label: '',
      placeholder: 'Choose dateRange',
      inputType: 'dateRange',
      value: { fromDate: '', toDate: '' },
    },
  ];
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchSubscriptions(page + 1, rowsPerPage, { sortField, sortOrder });
  }, [sortField, sortOrder]);
  const handleEdit = (row) => {
    router.push(`/subscription/${row?.id}`)
  };
  const actionConfig = [
    { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
    // { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
  ];
  const navigateToAddPage = () => {
    setAddLoading(true);
    router.push('/subscription/add')
  }
  const fetchSubscriptions = async (pageNum = 1, limit = 10, options = {}) => {
    setIsLoading(true);
    const formatDate = (date) =>
      date ? new Date(date).toISOString().split('T')[0] : '';
    const payload = {
      params: {
        sortField: options.sortField || '',
        sortOrder: options.sortOrder || '',
        pagination: 'true',
        page: pageNum,
        limit: limit,
        status: options.status || '',
        searchKey: options.searchKey || '',
        // // isMobile: false
        // momType:
        //   options.momType === 'Preg Mom'
        //     ? 'pregMom'
        //     : options.momType === 'New Mom'
        //       ? 'newMom'
        //       : '',
        fromDate: formatDate(options.dateRange?.fromDate),
        toDate: formatDate(options.dateRange?.toDate),
      },
    };
    try {
      const data = await apiRequest(apiRoutes.subscriptionList, 'POST', payload, router);
      if (data.response) {
        setSubscriptionList(data?.data?.docs || []);
        setTotalDocs(data?.data?.totalDocs);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleFilterSubmit = (filterValues) => {
    console.log('filterValues', filterValues)
    setFilterOpen(false)
    setPage(0);
    setForm(prev => ({
      ...prev,
      searchKey: filterValues.searchKey || '',
      // status: filterValues.status || '',
      // momType: filterValues.momType || '',
      dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
    }));
    fetchSubscriptions(page, rowsPerPage, { sortField, sortOrder, ...filterValues },);
  }
  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortOrder(direction);
    fetchSubscriptions(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
  };
  const handleTableChange = ({ newPage, newRowsPerPage }) => {
    const finalPage = newPage !== undefined ? newPage : page;
    const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

    if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
    if (newPage !== undefined) setPage(newPage);

    fetchSubscriptions(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
  };
  const handleToggleStatus = async (updatedRow) => {
    setIsLoading(true);
    const payload = {
      params: {
        id: updatedRow.id,
        status: updatedRow.status
      }
    }; try {
      const data = await apiRequest(apiRoutes.UpdateSubscription, 'POST', payload, router);
      fetchSubscriptions()
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setIsLoading(false);
    } 1
  };
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <Breadcrumb
        items={breadcrumbItems}
        actionButton={breadcrumbAction}
      />
      <MaterialTable
        headers={myTableHeaders}
        data={subscriptionList}
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

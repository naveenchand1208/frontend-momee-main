'use client';
import React from 'react';
import './page.css';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import { useState, useRef, useEffect } from 'react';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { Colors } from '@/common/constants/colorEnum';
import { objectToFormData } from '@/common/utils/util';
import { ACTIVE_STATUS, MOM_TYPES } from '@/common/constants/enum';
import { getMonths, getWeeks, formattedDate } from '@/common/utils/util';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
export default function MusicPlaylists() {
  const router = useRouter();
  const [musicList, setMusicList] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewform, setViewform] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  const fetchedRef = useRef();
  // const [months, setMonths] = useState(false);
  // const [weeks, setWeeks] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusLabel, setStatusLabel] = useState('Active/Inactive');
  const [form, setForm] = useState({
    searchKey: '',
    status: '',
    momType: '',
    dateRange: { fromDate: '', toDate: '' },
    // month: '',
    // week: '',
  });
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchMusicPlaylists(page + 1, rowsPerPage, { sortField, sortOrder });
      fetchedRef.current = true;
    }
  }, []);
  // useEffect(() => {
  //   const month = getMonths();
  //   setMonths(month);
  //   const week = getWeeks();
  //   setWeeks(week);
  // }, []);
  const handleEdit = (row) => {
    console.log('Parent received EDIT action:', row);
    router.push(`/music-playlists/${row?.id}`);
  };
  const manageCategory = () => {
    router.push('/music-playlists/main-category')
  }
  const manageAdd = () => {
    setAddLoading(true);
    router.push('/music-playlists/add')
  }
  const handleView = (row) => {
    console.log('Parent received VIEW action:', row);
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
    const data = await apiRequest(apiRoutes.deleteMusic, 'POST', payload, router);
    if (data.response) {
      fetchMusicPlaylists(page + 1, rowsPerPage, {})
    }
  };
  const myTableHeaders = [
    { id: 'file', label: 'Thumbnail', sortable: false },
    { id: 'name', label: 'Title', sortable: true },
    { id: 'momType', label: 'Mom Type', sortable: true },
    // { id: 'period', label: 'Period', sortable: true },
    { id: 'createdAt', label: 'Created Date', sortable: false },
    { id: 'status', label: 'Status', sortable: false },
    { id: 'action', label: 'Action', sortable: false },
  ];
  const breadcrumbItems = [
    { label: 'Content Management' },
    { label: 'Music Playlists', href: '/music-playlists' },
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
      // onChange: (val) => {
      //   if (val === 'All') {
      //     setForm((prev) => ({ ...prev, status: '' }));
      //     const filters = { ...form };
      //     delete filters.status;
      //     fetchMusicPlaylists(1, 10, filters);
      //     setStatusLabel('Active/Inactive');
      //   } else {
      //     setForm((prev) => ({ ...prev, status: val }));
      //     fetchMusicPlaylists(1, 10, { ...form, status: val });
      //     setStatusLabel(val);
      //   }
      // },
      onChange: (val) => {
        setPage(0);

        if (val === 'All') {
          setForm((prev) => ({ ...prev, status: '' }));
          const filters = { ...form };
          delete filters.status;

          fetchMusicPlaylists(
            1,
            rowsPerPage,   // ✅ FIX
            filters
          );

          setStatusLabel('Active/Inactive');
        } else {
          setForm((prev) => ({ ...prev, status: val }));

          fetchMusicPlaylists(
            1,
            rowsPerPage,   // ✅ FIX
            { ...form, status: val }
          );

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
      onClick: () => manageAdd(),
    },
  ];
  const inputFields = [
    {
      name: 'searchKey',
      placeholder: 'search title',
      inputType: 'text',
      value: '',
    },
    // {
    //   name: 'status',
    //   label: '',
    //   placeholder: 'Choose Status',
    //   inputType: 'autocomplete',
    //   options: ACTIVE_STATUS,
    //   value: '',
    // },
    {
      name: 'momType',
      label: '',
      placeholder: 'Choose Mom type',
      inputType: 'autocomplete',
      options: MOM_TYPES,
      value: form.momType,
    },
    {
      name: 'dateRange',
      label: '',
      placeholder: 'Choose dateRange',
      inputType: 'dateRange',
      value: { fromDate: '', toDate: '' },
    },
    // {
    //   name: 'month',
    //   label: '',
    //   placeholder: 'Choose month',
    //   inputType: 'autocomplete',
    //   options: months,
    //   value: form.month,
    // },
    // {
    //   name: 'week',
    //   label: '',
    //   placeholder: 'Choose week',
    //   inputType: 'autocomplete',
    //   options: weeks,
    //   value: form.week,
    // }
  ];
  const fetchMusicPlaylists = async (pageNum, limit, options = {}) => {
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
        // isMobile: false
        searchKey: options.searchKey || '',
        status: options.status || '',
        momType:
          options.momType === 'Preg Mom'
            ? 'pregMom'
            : options.momType === 'New Mom'
              ? 'newMom'
              : options.momType === 'Both'
                ? 'Both'
                : '',
        // week: options.week || '',
        // month: options.month || '',
        fromDate: formatDate(options.dateRange?.fromDate),
        toDate: formatDate(options.dateRange?.toDate),
      },
    };
    try {
      const data = await apiRequest(apiRoutes.getMusicList, 'POST', payload, router);
      if (data.response) {
        const updatedDocs = data?.data?.docs.map(doc => ({
          ...doc,
          createdAt: formattedDate(doc.createdAt)
        }));
        // const music = data?.data?.docs;
        // .map((ms) => ({
        //   ...ms,
        //   period: ms.week
        //     ? `Week ${Number(ms.week)}`
        //     : ms.month
        //       ? `Month ${Number(ms.month)}`
        //       : '-',
        // }))
        setMusicList(updatedDocs || []);
        setTotalDocs(data?.data?.totalDocs);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const actionConfig = [
    { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
    // { iconName: 'view-icon', disabled: false, onClick: handleView },
    { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
  ];
  const handleFilterSubmit = (filterValues) => {
    setFilterOpen(false)
    setPage(0);
    // const selectedWeek = weeks.find(e => e.label === filterValues.week);
    // const weekId = selectedWeek?.value;
    setForm(prev => ({
      ...prev,
      searchKey: filterValues.searchKey || '',
      status: filterValues.status || '',
      momType: filterValues.momType || '',
      dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
      // month: filterValues.month || '',
      // week: filterValues.week || '',
    }));
    fetchMusicPlaylists(1, rowsPerPage, {
      sortField, sortOrder, ...filterValues
      // , week: weekId 
    },);
  }
  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortOrder(direction);
    fetchMusicPlaylists(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
  };
  const handleTableChange = ({ newPage, newRowsPerPage }) => {
    const finalPage = newPage !== undefined ? newPage : page;
    const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;
    if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
    if (newPage !== undefined) setPage(newPage);
    fetchMusicPlaylists(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
  };
  const handleToggleStatus = async (updatedRow) => {
    setIsLoading(true);
    const payload = {
      id: updatedRow.id,
      status: updatedRow.status
    };
    const formData = objectToFormData(payload)
    try {
      const data = await apiRequest(apiRoutes.updateMusic, 'POST', formData, router);
      fetchMusicPlaylists(page + 1, rowsPerPage, { ...form, sortField, sortOrder });
    } catch (error) {
      console.error('Failed to update music playlist status:', error);
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
        data={musicList}
        actionConfig={actionConfig}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalDocs}
        isLoading={isLoading}
        sortConfig={{ [sortField]: sortOrder }}
        onSortChange={handleSortChange}
        onToggleStatus={handleToggleStatus}
        onTableChange={handleTableChange} />

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
    </div>

  )
}


'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import { Colors } from '@/common/constants/colorEnum';
import { formattedDate } from '@/common/utils/util';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';

export default function MoodQuotes() {
  const router = useRouter();
  const fetchedRef = useRef();

  const [quotesList, setQuotesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [form, setForm] = useState({
    searchKey: '',
    date: '',
  });

  const breadcrumbItems = [
    { label: 'Content Management' },
    { label: 'Mood Quotes', href: '/mood-quotes' },
  ];

  const breadcrumbAction = [
    {
      iconPath: '/assets/icons/outlined-filter-icon.svg',
      type: 'textIcon',
      label: 'Filter',
      onClick: () => setFilterOpen(true),
    },
    {
      iconPath: '/assets/icons/new-icon.svg',
      label: 'Add',
      type: 'button',
      size: 'extraSmall',
      color: '#fff',
      backgroundColor: Colors.Primary1,
      isLoading: addLoading,
      onClick: () => handleAdd(),
    },
  ];

  const myTableHeaders = [
    { id: 'sno', label: 'S.No', sortable: false },
    { id: 'date', label: 'Date', sortable: false },
    { id: 'action', label: 'Action', sortable: false },
  ];

  const inputFields = [
    // {
    //   name: 'searchKey',
    //   placeholder: 'Search by date (DD-MM-YYYY)',
    //   inputType: 'text',
    //   value: form.searchKey,
    // },
    {
      name: 'date',
      label: 'Select Date',
      placeholder: 'Choose date',
      inputType: 'date',
      value: form.date,
    },
  ];

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchMoodQuotes(page + 1, rowsPerPage, { sortField, sortOrder });
  }, [sortField, sortOrder]);

  const handleAdd = () => {
    setAddLoading(true);
    router.push('/mood-quotes/add');
  };

  const handleEdit = (row) => {
    router.push(`/mood-quotes/${row.id}`);
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    const payload = { params: { id: selectedRow.id } };
    const data = await apiRequest(apiRoutes.deleteMoodQuotes, 'POST', payload, router);
    if (data.response) {
      fetchMoodQuotes(page + 1, rowsPerPage);
    }
  };

  const handleDeleteCancel = () => setIsDeleteDialogOpen(false);

  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortOrder(direction);
    fetchMoodQuotes(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
  };

  const handleTableChange = ({ newPage, newRowsPerPage }) => {
    const finalPage = newPage ?? page;
    const finalRowsPerPage = newRowsPerPage ?? rowsPerPage;
    setPage(finalPage);
    setRowsPerPage(finalRowsPerPage);
    fetchMoodQuotes(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
  };

  const handleFilterSubmit = (filterValues) => {
    setFilterOpen(false);
    const updatedForm = {
      ...form,
      searchKey: filterValues.searchKey || '',
      date: filterValues.date || '',
    };
    setForm(updatedForm);
    setPage(0);
    fetchMoodQuotes(1, rowsPerPage, { ...updatedForm, sortField, sortOrder });
  };

  const fetchMoodQuotes = async (pageNum = 1, limit = 10, options = {}) => {
    setIsLoading(true);
    try {
      const payload = {
        params: {
          pagination: 'true',
          page: pageNum,
          limit,
          searchKey: options.searchKey || '',
          date: options.date || '',
        },
      };

      const data = await apiRequest(apiRoutes.getMoodQuotes, 'POST', payload, router);

      if (data.response) {
        const startIndex = (pageNum - 1) * limit;

        const list = data.data.docs.map((item, index) => ({
          ...item,
          sno: startIndex + index + 1,   // ← ADD SERIAL NUMBER
          totalQuotes: Object.keys(item.quotes || {}).length,
          createdAt: formattedDate(item.createdAt),
        }));

        setQuotesList(list);
        setTotalDocs(data.data.totalDocs);
      }
    } catch (error) {
      console.error('Failed to fetch mood quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const actionConfig = [
    { iconName: 'edit-icon', onClick: handleEdit },
    { iconName: 'delete-icon', onClick: handleDelete },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />

      <MaterialTable
        headers={myTableHeaders}
        data={quotesList}
        actionConfig={actionConfig}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalDocs}
        isLoading={isLoading}
        sortConfig={{ [sortField]: sortOrder }}
        onSortChange={handleSortChange}
        onTableChange={handleTableChange}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete"
        message="Are you sure you want to delete this mood quote entry?"
        cancelLabel="No"
        confirmLabel="Yes"
      />

      {filterOpen && (
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
              onSubmit={handleFilterSubmit}
              onclose={() => setFilterOpen(false)}
            />
          }
          actions={<button onClick={() => setFilterOpen(false)}>Close</button>}
          maxWidth="xs"
          position="top-left"
        />
      )}
    </div>
  );
}

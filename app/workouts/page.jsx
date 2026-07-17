'use client';
import '../exercises/main-category/page.css';
import React from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { useEffect } from 'react';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import { objectToFormData } from '@/common/utils/util';
import { Colors } from '@/common/constants/colorEnum';
import { ACTIVE_STATUS, MOM_TYPE } from '@/common/constants/enum';
import { getWeeks, getMonths, formattedDate } from '@/common/utils/util';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
export default function Workouts() {
  const router = useRouter();
  const fetchedRef = useRef();
  const [workoutsList, setWorkoutsList] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewform, setViewform] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [months, setMonths] = useState(false);
  const [weeks, setWeeks] = useState(false);
  const [statusLabel, setStatusLabel] = useState('');
  const [form, setForm] = useState({
    searchKey: '',
    status: '',
    momType: '',
    week: '',
    month: '',
    dateRange: { fromDate: '', toDate: '' },
  });
  const breadcrumbItems = [
    { label: 'Content Management' },
    { label: 'Workouts', href: '/workouts' },
  ]
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
        if (val === 'All') val = '';
        setStatusLabel(val)
        setForm((prev) => {
          const updatedForm = { ...prev, status: val };
          fetchWorkouts(1, 10, updatedForm);
          return updatedForm;
        });
      }
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
    { id: 'file', label: 'Thumbnail', sortable: false },
    { id: 'name', label: 'Workout Name', sortable: true },
    // { id: 'sets', label: 'Sets', sortable: true },
    // { id: 'reps', label: 'Reps', sortable: true },
    { id: 'createdAt', label: 'Created Date', sortable: false },
    { id: 'status', label: 'Status', sortable: false },
    { id: 'action', label: 'Action', sortable: false },
  ];
  const inputFields = [
    {
      name: 'searchKey',
      placeholder: 'search collection name',
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
    fetchWorkouts(page + 1, rowsPerPage, { sortField, sortOrder });
  }, [sortField, sortOrder]);
  useEffect(() => {
    const month = getMonths();
    setMonths(month);
    const week = getWeeks();
    setWeeks(week);
  }, []);
  const handleEdit = (row) => {
    console.log('Parent received EDIT action:', row);
    router.push(`/workouts/${row?.id}`);
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
    const data = await apiRequest(apiRoutes.deleteMasterExercise, 'POST', payload, router);
    if (data.response) {
      fetchWorkouts(page + 1, rowsPerPage, {})
    }
  };
  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortOrder(direction);
    fetchWorkouts(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
  };
  const handleTableChange = ({ newPage, newRowsPerPage }) => {
    const finalPage = newPage !== undefined ? newPage : page;
    const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;
    if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
    if (newPage !== undefined) setPage(newPage);
    fetchE(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
  };
  const handleToggleStatus = async (updatedRow) => {
    setIsLoading(true);
    const payload = {
      id: updatedRow.id,
      status: updatedRow.status
    };
    const formData = objectToFormData(payload)
    try {
      const data = await apiRequest(apiRoutes.updateMasterExercise, 'POST', formData, router);
      fetchWorkouts();
    } catch (error) {
      console.error('Failed to update workout:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAdd = () => {
    setAddLoading(true);
    router.push('/workouts/add');
  }
  const actionConfig = [
    { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
    // { iconName: 'view-icon', disabled: false, onClick: handleView },
    { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
  ];
  const fetchWorkouts = async (pageNum = 1, limit = 5, options = {}) => {
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
        fromDate: formatDate(options.dateRange?.fromDate),
        toDate: formatDate(options.dateRange?.toDate),
      },
    };
    try {
      const data = await apiRequest(apiRoutes.getMasterExercise, 'POST', payload, router);
      if (data.response) {
        const workout = data?.data?.docs.map((ex) => ({
          ...ex,
          period:
            ex.momType === 'pregMom'
              ? (ex.week ? `Week ${ex.week.replace(/\D/g, '')}` : '-')
              : ex.momType === 'newMom'
                ? (ex.month ? `Month ${ex.month.replace(/\D/g, '')}` : '-')
                : '-',
          createdAt: formattedDate(ex.createdAt),
        }))
        setWorkoutsList(workout || []);
        setTotalDocs(data?.data?.totalDocs);
      }
    } catch (error) {
      console.error('Failed to fetch workout:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // const handleFilterSubmit = (filterValues) => {
  //   setFilterOpen(false)
  //   const selectedWeek = weeks.find(e => e.label === filterValues.week);
  //   const weekId = selectedWeek?.value;
  //   setForm(prev => ({
  //     ...prev,
  //     searchKey: filterValues.searchKey || '',
  //     status: filterValues.status || '',
  //     momType: filterValues.momType || '',
  //     dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
  //     month: filterValues.month || '',
  //     week: filterValues.week || '',
  //   }));
  //   fetchExercises(page + 1, rowsPerPage, { sortField, sortOrder, ...filterValues, week: weekId },);
  // }
  const handleFilterSubmit = (filterValues) => {
    setFilterOpen(false);

    // const selectedWeek = weeks.find(e => e.label === filterValues.week);
    // const weekId = selectedWeek?.value || '';

    // Update form state first
    const updatedForm = {
      ...form,
      searchKey: filterValues.searchKey || '',
      status: filterValues.status || '',
      momType: filterValues.momType || '',
      dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
      month: filterValues.month || '',
      week: filterValues.week || '',
    };

    setForm(updatedForm);

    // Always reset to first page when applying a new filter
    setPage(0);

    // Fetch with updated filters
    fetchWorkouts(1, rowsPerPage, { ...updatedForm, sortField, sortOrder });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <Breadcrumb
        items={breadcrumbItems}
        actionButton={breadcrumbAction}
      />
      <MaterialTable
        headers={myTableHeaders}
        data={workoutsList}
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
    </div>
    // <div className="max-w-4xl mx-auto mt-10">
    //   <div className="px-4 shadow rounded bg-white mb-3">
    //     <div className="content-header ">
    //       <div className="row align-items-center">
    //         <div className="d-inline-block col-lg-6 align-items-center">
    //           <nav>
    //             <ol className="breadcrumb">
    //               <li className="breadcrumb-item"><a>Content Management-
    //               Exercises
    //               </a>
    //               </li>
    //             </ol>
    //           </nav>
    //         </div>
    //         <div className="d-inline-block col-lg-6 text-end p-4">
    //           <a href="add-preg-mom.html" className="waves-effect1 waves-light btn btn-primary  p-2 mx-2">Add Exercises</a>
    //           <button type="button" className="waves-effect waves-light btn btn-danger p-2 ">Exercises category</button>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   <MaterialTable headers={myTableHeaders} data={myTableData} actionConfig={actionConfig} />
    // </div>
  )
}
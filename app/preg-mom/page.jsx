'use client';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import CommonFilter from '@/components/shared/common-filter/page';
import CustomDialog from '@/components/shared/dialog/dialog';
import { ACTIVE_STATUS, SUBSCRIPTION } from '@/common/constants/enum';
import { formatDate, getWeeks } from '@/common/utils/util';
import SkeletonCard from "@/components/loader/skeleton-dashboard-card/page";
import DashboardCard from "@/components/shared/dashboard-card/page";
import { showError } from "@/common/toast/toastService";
import ConfirmationDialog from "@/components/shared/confirmation-dialog/confirmation-dialog";
export default function PreqMom() {
  const [userList, setUserList] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [weeks, setWeeks] = useState('');
  const fetchedRef = useRef(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [planOptions, setPlanOptions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  const [statusLabel, setStatusLabel] = useState('');
  const [userCountData, setUserCountData] = useState({});
  const [inactiveRange, setInactiveRange] = useState('last7Days');
  const [inactiveRangeData, setInactiveRangeData] = useState({});
  const [viewform, setViewform] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletePasswordDialogOpen, setIsDeletePasswordDialogOpen] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState('');

  const router = useRouter();
  const hasFetchedUsers = useRef(false);
  const hasFetchedPlans = useRef(false);
  const isDownloadingRef = useRef(false);
  const [form, setForm] = useState({
    searchKey: '',
    status: '',
    subscribed: '',
    plan: '',
    week: '',
  });
  const handleView = (row) => {
    router.push(`/preg-mom/${row.id}`);
  };
  const handleInactiveRangeChange = (val) => {
    setInactiveRange(val);
  };
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const fetchUserCounts = async () => {
      try {
        const activePayload = { params: { momType: 'pregMom' } };
        const inactivePayload = { params: { momType: 'pregMom' } };

        // const [activeRes, inactiveRes] = await Promise.all([
        //   apiRequest(apiRoutes.activeUsersCount, 'POST', activePayload, router),
        //   apiRequest(apiRoutes.inActiveUsersCount, 'POST', inactivePayload, router),
        // ]);
        const [activeRes, inactiveRes, totalRes] = await Promise.all([
          apiRequest(
            apiRoutes.activeUsersCount,
            'POST',
            activePayload,
            router
          ),

          apiRequest(
            apiRoutes.inActiveUsersCount,
            'POST',
            inactivePayload,
            router
          ),

          apiRequest(
            apiRoutes.totalUsersCount,
            'POST',
            {
              params: {
                momType: 'pregMom'
              }
            },
            router
          ),
        ]);

        if (activeRes?.response && inactiveRes?.response) {
          // setUserCountData(prev => ({
          //   ...prev,
          //   activeUsersCount: activeRes.data.counts || 0,
          //   activeUsersIds: activeRes.data.userIds || [],
          //   inactiveUsersCount: inactiveRes.data.last7Days.count || 0,
          //   inactiveUsersIds: inactiveRes.data.last7Days.userIds || [],
          // }));
          setUserCountData(prev => ({
            ...prev,

            activeUsersCount:
              activeRes?.data?.counts || 0,

            activeUsersIds:
              activeRes?.data?.userIds || [],

            inactiveUsersCount:
              inactiveRes?.data?.last7Days?.count || 0,

            inactiveUsersIds:
              inactiveRes?.data?.last7Days?.userIds || [],

            totalUsersCount:
              totalRes?.data?.count || 0,
          }));

          setInactiveRangeData(inactiveRes.data);
        }

      } catch (err) {
        console.error('Failed to fetch user counts:', err);
      }
    };

    fetchUserCounts();
  }, []);
  const handleDelete = (row) => {
    setViewform(row)
    setIsDeleteDialogOpen(true)
  };
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };
  const handleDeleteConfirm = () => {
    setIsDeletePasswordDialogOpen(true)
  };
  const handleDeleteConfirmPassword = () => {
    if (deleteConfirmValue !== 'personal@123') {
      alert('Invalid confirmation value');
      setDeleteConfirmValue('');
      setIsDeletePasswordDialogOpen(false);
      return;
    }

    setDeleteConfirmValue('');
    setIsDeletePasswordDialogOpen(false);
    handleDeleteUser(); // 🔥 call delete function
  };
  const handleDeleteUser = async () => {
    setIsDeleteDialogOpen(false);
    console.log('coming')
    const payload = { params: { id: viewform.id } }
    const data = await apiRequest(apiRoutes.deleteMom, 'POST', payload, router);
    if (data.response) {
      fetchUsers(page + 1, rowsPerPage, {})
    }
  };
  const userListHeaders = [
    { id: 'userName', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'completedWeeks', label: 'Weeks', sortable: true },
    { id: 'subscriptionDetails', label: 'Plan Validity', sortable: false },
    { id: 'subscribed', label: 'Subscription Status', sortable: false },
    { id: 'status', label: 'Status', sortable: false },
    { id: 'action', label: 'Action', sortable: false },
  ];
  const cards = [
    {
      title: "Active Users",
      subTitle: "activeUsersCount",
      count: `${userCountData?.activeUsersCount ?? '-'}`,
      iconPath: '/assets/icons/active-icon.svg'
    },
    {
      title: "Inactive Users",
      subTitle: "inactiveUsersCount",
      count: `${userCountData?.inactiveUsersCount ?? '-'}`,
      iconPath: '/assets/icons/inactive-icon.svg',
      // dropdown: true,
      // dropdownOptions: [
      //   { label: 'Last 7 Days', value: 'last7Days' },
      //   { label: 'Last 15 Days', value: 'last15Days' },
      //   { label: 'Last 1 Month', value: 'last1Month' },
      //   { label: 'Last 3 Months', value: 'last3Months' },
      //   { label: 'Last 6 Months', value: 'last6Months' },
      //   { label: 'Last 1 Year', value: 'last1Year' },
      // ],
      // onDropdownChange: handleInactiveRangeChange,
    },
    {
      title: "Total Users",
      subTitle: "totalUsersCount",
      count: `${userCountData?.totalUsersCount ?? '-'}`,
      iconPath: '/assets/icons/active-icon.svg'
    },
  ]
  const actionConfig = [
    { iconName: 'view-icon', disabled: false, onClick: handleView },
    { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
  ];
  const breadcrumbItems = [
    { label: 'User Management' },
    { label: 'Pregnant Mom', href: '/preg-mom' },
  ];
  const breadcrumbAction = [
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
    {
      type: 'statusTabs',
      onChange: (val) => {
        if (val === 'All') val = '';
        setStatusLabel(val)
        setForm((prev) => {
          const updatedForm = { ...prev, status: val };
          if (!hasFetchedUsers.current) {
            hasFetchedUsers.current = true;
            fetchUsers(1, rowsPerPage, updatedForm);
          }
          return updatedForm;
        });
      }
    }
  ];
  const inputFields = [
    {
      name: 'searchKey',
      placeholder: 'search name or email',
      inputType: 'text',
      value: form.searchKey,
    },
    {
      name: 'status',
      label: '',
      placeholder: 'Choose Status',
      inputType: 'autocomplete',
      options: ACTIVE_STATUS,
      value: form.status,
    },
    {
      name: 'subscribed',
      label: '',
      placeholder: 'Choose subscribed',
      inputType: 'autocomplete',
      options: SUBSCRIPTION,
      value: '',
    },
    {
      name: 'plan',
      label: '',
      placeholder: 'Choose plan',
      inputType: 'autocomplete',
      options: planOptions,
      value: form.plan,
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
    const week = getWeeks();
    setWeeks(week);
  }, []);
  useEffect(() => {
    if (!hasFetchedUsers.current) {
      hasFetchedUsers.current = true;
      fetchUsers(page + 1, rowsPerPage, { sortField, sortOrder });
    }
  }, []);
  useEffect(() => {
    if (!hasFetchedPlans.current) {
      hasFetchedPlans.current = true;
      const fetchPlanOptions = async () => {
        try {
          const payload = { params: { pagination: 'false' } };
          const data = await apiRequest(apiRoutes.subscriptionList, 'POST', payload, router);
          if (data?.response) {
            const plans = data.data.docs.map((plan) => ({
              label: plan.planName,
              value: plan.id,
            }));
            setPlanOptions(plans);
            console.log(plans);
          }
        } catch (error) {
          console.error('Failed to fetch plan options:', error);
        }
      };

      fetchPlanOptions();
    }
  }, []);

  const handleCardExport = async (card) => {
    const dataKey = card.subTitle;
    let userIds = [];

    if (dataKey === 'activeUsersCount') {
      userIds = userCountData?.activeUsersIds ?? [];
    } else if (dataKey === 'inactiveUsersCount') {
      userIds = userCountData?.inactiveUsersIds ?? [];
    }

    if (!userIds || userIds.length === 0) {
      showError("No user data available to export.");
      return;
    }

    if (isDownloadingRef.current) return;
    isDownloadingRef.current = true;

    try {
      const payload = { params: { userIds } };
      await apiRequest(
        apiRoutes.getActiveInactiveUsersExcel,
        'POST',
        payload,
        router,
        'blob',
        'users.xlsx'
      );
    } catch (error) {
      console.error('Excel download error:', error);
      showError(error.message || 'Download failed');
    } finally {
      isDownloadingRef.current = false;
    }
  };
  const fetchUsers = async (pageNum = 1, limit = 5, options = {}) => {
    setIsLoading(true);
    const payload = {
      params: {
        sortField: options.sortField || '',
        sortOrder: options.sortOrder || 'asc',
        pagination: 'true',
        page: pageNum,
        limit: limit,
        momType: "pregMom",
        searchKey: options.searchKey || '',
        status: options.status || '',
        plan: options.plan || '',
        week: options.week || '',
        subscribed:
          options.subscribed === 'Subscribed'
            ? 'true'
            : options.subscribed === 'Not Subscribed'
              ? 'false'
              : '',
      },
    };
    try {
      const data = await apiRequest(apiRoutes.userList, 'POST', payload, router);
      if (data?.response) {
        const userList = data?.data?.docs?.map((item) => ({
          ...item,
          subscriptionDetails: item?.subscriptions?.length > 0
            ? [item.subscriptions[0]?.subscribedPlan?.planName, item.subscriptions[0]?.validaityEndDate]
              .filter(val => val && val.trim() !== '')
              .join(' ') || 'Not Subscribed'
            : '-',
          completedWeeks: item.completedWeeks
            ? `Week ${Number(item.completedWeeks)}`
            : '-',
          subscribed: item?.subscribed ? 'Subscribed' : 'Not Subscribed'
        }));
        setUserList(userList || []);
        console.log('totalDocs', data?.data?.totalDocs)
        setTotalDocs(data?.data?.totalDocs);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      hasFetchedUsers.current = false;
      setIsLoading(false);
    }
  };
  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortOrder(direction);
    fetchUsers(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
  };
  const handleTableChange = ({ newPage, newRowsPerPage }) => {
    const finalPage = newPage !== undefined ? newPage : page;
    const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

    if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
    if (newPage !== undefined) setPage(newPage);
    fetchUsers(finalPage + 1, finalRowsPerPage, { ...form, sortField, sortOrder });
  };
  const handleToggleStatus = async (updatedRow) => {
    setIsLoading(true);
    const payload = {
      params: {
        id: updatedRow.id,
        status: updatedRow.status,
        // lastLogin: updatedRow.status === 'Active' ? formatDate(new Date, 'DD-MM-YYYY HH:mm') : "",
        activeUser: updatedRow.status === 'Active' ? true : false,
      }
    }; try {
      const data = await apiRequest(apiRoutes.updateUSer, 'POST', payload, router);
      fetchUsers(
        page + 1,
        rowsPerPage,
        {
          ...form,
          sortField,
          sortOrder,
        }
      )
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const downloadExcel = async () => {
    if (isDownloadingRef.current) return;
    isDownloadingRef.current = true;
    try {
      const { plan, week, searchKey, subscribed, ...rest } = form;
      const selectedWeek = weeks.find(w => w.label === week);
      const weekId = selectedWeek?.value;
      const payload = {
        params: {
          ...rest,
          status: statusLabel,
          momType: "pregMom",
          week: weekId,
          searchKey: searchKey,
          subscribed: subscribed,
        }
      };
      await apiRequest(apiRoutes.userExport, 'POST', payload, router, 'blob', 'pregMom.xlsx');
    } catch (error) {
      console.log('Excel download error:', error);
      showError(error.message || 'Download failed');
    } finally {
      isDownloadingRef.current = false;
    }
  };
  const handleFilterSubmit = (filterValues) => {
    setFilterOpen(false)
    setPage(0);
    const selectedPlan = planOptions.find(plan => plan.label === filterValues.plan);
    const planId = selectedPlan?.value;
    const selectedWeek = weeks.find(e => e.label === filterValues.week);
    const weekId = selectedWeek?.value;
    setForm(prev => ({
      ...prev,
      searchKey: filterValues.searchKey || '',
      // status: filterValues.status || '',
      subscribed: filterValues.subscribed || '',
      plan: filterValues.plan,
      week: filterValues.week || '',
    }));
    console.log(filterValues);
    fetchUsers(page, rowsPerPage, { sortField, sortOrder, ...filterValues, plan: planId, week: weekId },);
  }
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <Breadcrumb
        items={breadcrumbItems}
        actionButton={breadcrumbAction}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '10px' }}>
        {isLoading
          ? Array.from({ length: 2 }).map((_, idx) => <SkeletonCard key={idx} />)
          : cards.map((card, idx) => <DashboardCard key={idx} {...card} exportIcon={true} onExport={() => handleCardExport(card)} />
          )}
      </div>
      <MaterialTable
        headers={userListHeaders}
        data={userList}
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
      {isDeletePasswordDialogOpen && (
        <CustomDialog
          open={isDeletePasswordDialogOpen}
          onClose={() => setIsDeletePasswordDialogOpen(false)}
          title=""
          titleColor="#000000"
          backgroundColor="#fafcfc"
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Enter confirmation code"
                value={deleteConfirmValue}
                onChange={(e) => setDeleteConfirmValue(e.target.value)}
                style={{ padding: '8px' }}
              />

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirmPassword}
              >
                Confirm
              </button>

            </div>
          }
          actions={
            <button onClick={() => setIsDeletePasswordDialogOpen(false)}>
              Close
            </button>
          }
          maxWidth="xs"
          position="top-left"
        />
      )}

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

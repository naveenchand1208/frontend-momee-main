'use client';
import './page.css';
import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { objectToFormData } from '@/common/utils/util';
import MaterialTable from '@/components/shared/material-table/page';
import { Colors } from '@/common/constants/colorEnum';
import Breadcrumb from '@/components/shared/breadcrumb/page';
export default function Exercise_Plans() {
  const router = useRouter();
  const fetchedRef = useRef(false);
  const [viewform, setViewform] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [id, setId] = useState(null)
  const [exerciseList, setExerciseList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [totalDocs, setTotalDocs] = useState(0);
  const [form, setForm] = useState({
    planName: '',
    planAmount: '',
    durationMonths: '',
    status: 'Active',
  });
  const breadcrumbItems = [
    { label: 'User Management' },
    { label: 'Exercise Plans', href: '/exercise-plan' }
  ];
  const breadcrumbAction = [
    {
      iconPath: '/assets/icons/new-icon.svg',
      label: 'Add',
      type: 'button',
      size: 'extraSmall',
      color: '#fff',
      backgroundColor: Colors.Primary1,
      isLoading: addLoading,
      onClick: () => handleAddExercisePlan(),
    },
  ];

  const myTableHeaders = [
    { id: 'id', label: 'Id', sortable: false },
    { id: 'planName', label: 'Plan Name', sortable: false },
    { id: 'planAmount', label: 'Plan Amount', sortable: true },
    { id: 'deviceType', label: 'Device Type', sortable: true },
    { id: 'durationMonths', label: 'Duration in Months', sortable: false },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'action', label: 'Action', sortable: false },
  ];
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchExercisePlan(page + 1, rowsPerPage, { sortField, sortOrder });
  }, [sortField, sortOrder]);
  useEffect(() => {
    return () => {
      if (form.previewUrl) {
        URL.revokeObjectURL(form.previewUrl);
      }
    };
  }, [form.previewUrl]);
  const handleAddExercisePlan = () => {
    setAddLoading(true);
    router.push('/exercise-plan/add')
  }
  const handleEdit = (row) => {
    console.log('Parent received EDIT action:', row);
    router.push(`/exercise-plan/${row?.id}`);
  };
  const actionConfig = [
    { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
    // { iconName: 'view-icon', disabled: false, onClick: handleView },
    // { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
  ];
  const fetchExercisePlan = async (pageNum = 1, limit = 10, options = {}) => {
    setIsLoading(true);
    const payload = {
      params: {
        sortField: options.sortField || '',
        sortOrder: options.sortOrder || 'asc',
        pagination: 'true',
        page: pageNum,
        limit: limit,
        // searchKey: options.searchKey || '',
        // status: options.status || '',
      },
    };
    try {
      const data = await apiRequest(apiRoutes.getExerciseSubscriptionList, 'POST', payload, router);
      if (data.response) {
        setExerciseList(data?.data?.docs);
        setTotalDocs(data?.data?.totalDocs);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleTableChange = ({ newPage, newRowsPerPage }) => {
    const finalPage = newPage !== undefined ? newPage : page;
    const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;
    if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
    if (newPage !== undefined) setPage(newPage);
    fetchExercisePlan
      (finalPage + 1, finalRowsPerPage, { sortField, sortOrder });
  };
  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortOrder(direction);
    fetchExercisePlan(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
  };
  const handleToggleStatus = async (updatedRow) => {
    setIsLoading(true);
    const payload = { params: updatedRow }; try {
      const data = await apiRequest(apiRoutes.updateExerciseSubscription, 'POST', payload, router);
      fetchExercisePlan()
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
        data={exerciseList}
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
    </div>
  )
}



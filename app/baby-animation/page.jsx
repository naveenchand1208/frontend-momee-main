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
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
export default function Baby_Animation() {
    const router = useRouter();
    const fetchedRef = useRef(false);
    const [viewform, setViewform] = useState({});
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [id, setId] = useState(null)
    const [templateList, setTemplateList] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [totalDocs, setTotalDocs] = useState(0);
    const [form, setForm] = useState({
        name: '',
        file: '',
        status: 'Active',
    });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Baby Animation', href: '/baby-animation' }
    ];
    const breadcrumbAction = [
        {
            type: 'statusTabs',
            onChange: (val) => {
                if (val === 'All') val = '';

                // setStatusLabel(val);

                const updatedForm = { ...form, status: val };
                setForm(updatedForm);

                fetchBabyAnimation(1, rowsPerPage, updatedForm);
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
            onClick: () => handleAddBabyAnimation(),
        }
    ];
    const myTableHeaders = [
        { id: 'file', label: 'Thumbnail', sortable: false },
        { id: 'name', label: 'Title', sortable: true },
        { id: 'babySize', label: 'Baby Size', sortable: true },
        { id: 'babyWeight', label: 'Baby Weight', sortable: true },
        { id: 'status', label: 'Status', sortable: true },
        { id: 'action', label: 'Action', sortable: false },
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchBabyAnimation(page + 1, rowsPerPage, { sortField, sortOrder });
    }, [sortField, sortOrder]);
    useEffect(() => {
        return () => {
            if (form.previewUrl) {
                URL.revokeObjectURL(form.previewUrl);
            }
        };
    }, [form.previewUrl]);
    const handleAddBabyAnimation = () => {
        setAddLoading(true);
        router.push('/baby-animation/add')
    }
    const handleEdit = (row) => {
        console.log('Parent received EDIT action:', row);
        router.push(`/baby-animation/${row?.id}`);
    };

    const fetchBabyAnimation = async (pageNum = 1, limit = 10, options = {}) => {
        setIsLoading(true);
        const payload = {
            params: {
                sortField: options.sortField || '',
                sortOrder: options.sortOrder || 'asc',
                pagination: 'true',
                page: pageNum,
                limit: limit,
                // searchKey: options.searchKey || '',
                status: options.status || '',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getBabyAnimation, 'POST', payload, router);
            if (data.response) {
                setTemplateList(data?.data?.docs);
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
        fetchBabyAnimation
            (finalPage + 1, finalRowsPerPage, { sortField, sortOrder });
    };
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchBabyAnimation(page + 1, rowsPerPage, { sortField: field, sortOrder: direction });
    };
    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const formData = objectToFormData(updatedRow)
        try {
            const data = await apiRequest(apiRoutes.updateBabyAnimation, 'POST', formData, router);
            fetchBabyAnimation(page + 1, rowsPerPage, { ...form, sortField, sortOrder });
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (row) => {
        setSelectedRow(row);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);
        const payload = { params: { id: selectedRow.id } };
        const data = await apiRequest(apiRoutes.deleteBabyAnimation, 'POST', payload, router);
        if (data.response) {
            fetchBabyAnimation(page + 1, rowsPerPage);
        }
    }

    const handleDeleteCancel = () => setIsDeleteDialogOpen(false);
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        // { iconName: 'view-icon', disabled: false, onClick: handleView },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <MaterialTable
                headers={myTableHeaders}
                data={templateList}
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
                title="Delete"
                message="Are you sure you want to delete this baby animation entry?"
                cancelLabel="No"
                confirmLabel="Yes"
            />
        </div>


    )
}



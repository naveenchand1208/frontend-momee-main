'use client';
import './page.css';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { objectToFormData } from '@/common/utils/util';
import MaterialTable from '@/components/shared/material-table/page';
import Button from '../button/page';
import { Colors } from '@/common/constants/colorEnum';
import CustomDialog from '../dialog/dialog';
import AddFoodForm from './add-form/page';

export default function Custom_Exercise_Tab() {
    const { id } = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [exerciseList, setExerciseList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [totalDocs, setTotalDocs] = useState(0);
    const [editRowData, setEditRowData] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [userData, setUserData] = useState(null);

    const tableHeaders = [
        { id: 'date', label: 'Date', sortable: true },
        { id: 'time', label: 'Time', sortable: false },
        { id: 'name', label: 'Exercise Name', sortable: false },
        { id: 'sets', label: 'Sets', sortable: false },
        { id: 'reps', label: 'Reps', sortable: false },
    ];

    useEffect(() => {
        if (!id) return;

        fetchUserDetails(id);
        fetchExerciseList(page + 1, rowsPerPage); // Fetch data on mount
    }, [id]);

    const fetchUserDetails = async (userId) => {
        try {
            const res = await apiRequest(apiRoutes.userList, 'POST', { params: { id: userId } }, router);
            if (res?.response) {
                const firstUser = res.data?.docs?.[0];
                setUserData(firstUser);
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    const fetchExerciseList = async (pg = 1, limit = 10) => {
        setIsLoading(true);
        try {
            const payload = {
                params: {
                    pagination: 'true',
                    page: pg,
                    limit,
                    userId: id,
                },
            };

            const data = await apiRequest(apiRoutes.getCustomExerciseList, 'POST', payload, router);

            if (data?.response) {
                const exercises = data.data.docs || [];
                const rows = exercises.map((entry) => ({
                    date: entry.date,
                    name: (
                        <span
                            style={{ color: 'blue' }}
                            className="text-blue-600 underline cursor-pointer"
                            onClick={() => handleEdit({ id: entry.id })}
                        >
                            {entry.exercise?.name || 'Unnamed'}
                        </span>
                    ),
                    sets: entry.sets || '-',
                    reps: entry.reps || '-',
                    time: entry.time || '-',
                    id: entry.id,
                }));


                setExerciseList(rows);
                setTotalDocs(data.data.totalDocs || 0);
            }
        } catch (error) {
            console.error('Failed to fetch custom exercises:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchExerciseList(page + 1, rowsPerPage);
    };

    const viewDietFood = async (id) => {
        try {
            const payload = { params: { id } };
            const data = await apiRequest(apiRoutes.viewCustomExercise, 'POST', payload, router);
            if (data?.response) {
                return data.data;
            }
        } catch (error) {
            console.error('Error fetching custom exercise item:', error);
        }
        return null;
    };

    const handleEdit = async (row) => {
        const fullData = await viewDietFood(row.id);
        if (fullData) {
            setEditRowData(fullData);
            setDialogOpen(true);
        }
    };

    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage ?? page;
        const finalRowsPerPage = newRowsPerPage ?? rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchExerciseList(finalPage + 1, finalRowsPerPage);
    };

    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchExerciseList(page + 1, rowsPerPage);
    };

    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const payload = {
            id: updatedRow.id,
            status: updatedRow.status,
        };
        const formData = objectToFormData(payload);
        try {
            await apiRequest(apiRoutes.updateCustomExercise, 'POST', formData, router);
            fetchExerciseList(page + 1, rowsPerPage);
        } catch (error) {
            console.error('Failed to toggle status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
    ];

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="flex justify-end">
                <Button
                    iconPath={'/assets/icons/new-icon.svg'}
                    label="Add"
                    size="extraSmall"
                    color="#fff"
                    backgroundColor={Colors.Primary1}
                    onClick={() => {
                        setEditRowData(null);
                        setDialogOpen(true);
                    }}
                />
            </div>

            <div className="mt-3">
                <MaterialTable
                    headers={tableHeaders}
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

            <CustomDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setEditRowData(null);
                }}
                title={editRowData ? 'Edit Exercise' : 'Add Exercise'}
                titleColor="#000000"
                backgroundColor="#fafcfc"
                maxWidth="xs"
                content={
                    <AddFoodForm
                        isEdit={!!editRowData}
                        existingType={editRowData}
                        onClose={() => {
                            setDialogOpen(false);
                            setEditRowData(null);
                        }}
                        onSuccess={() => {
                            handleRefresh();
                            setDialogOpen(false);
                            setEditRowData(null);
                        }}
                    />
                }
            />
        </div>
    );
}

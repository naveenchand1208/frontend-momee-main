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

export default function Diet_Food_Avoid() {
    const { id } = useParams();
    const router = useRouter();
    const fetchedRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dietFoodEatList, setDietFoodEatList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [totalDocs, setTotalDocs] = useState(0);
    const [editRowData, setEditRowData] = useState(null);
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [myTableHeaders, setMyTableHeaders] = useState([{ id: 'date', label: 'Date', sortable: false }]);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (!id) return;
        fetchUserDetails(id);
    }, [id]);

    useEffect(() => {
        if (userData?.momType) {
            fetchCategories(userData.momType);
        }
    }, [userData?.momType]);

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

    const fetchCategories = async (momType) => {
        try {
            const payload = {
                params: {
                    status: 'Active',
                    momType,
                    pagination: 'true',
                    page: '1',
                    limit: '10',
                },
            };
            const res = await apiRequest(apiRoutes.getFoodAvoidCategoryList, 'POST', payload, router);
            if (res?.response) {
                const mapped = res.data.docs.map((item) => ({
                    ...item,
                    label: item.title,
                }));
                setCategories(mapped);
                const dynamicHeaders = mapped.map(cat => ({
                    id: cat.title,
                    label: cat.title,
                    sortable: false,
                }));
                setMyTableHeaders([{ id: 'date', label: 'Date', sortable: false }, ...dynamicHeaders]);

                fetchDietFoodEatList(page + 1, rowsPerPage, { sortField, sortOrder }, mapped);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchDietFoodEatList = async (pg = 1, limit = 10, sort = {}, catList = categories) => {
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
            const data = await apiRequest(apiRoutes.dateWiseDietAvoidFood, 'POST', payload, router);

            if (data?.response) {
                const rows = (data?.data?.data || []).map((entry) => {
                    const row = { date: entry.date };

                    catList.forEach(cat => {
                        row[cat.title] = '-';
                    });

                    entry.foods.forEach((food) => {
                        const category = food?.category?.title || '';
                        const templateName = food?.template?.name || '-';
                        if (catList.some(cat => cat.title === category)) {
                            const link = (
                                <span
                                    key={food.id}
                                    className="cursor-pointer"
                                    style={{ color: 'blue' }}
                                    onClick={() => handleEdit({ id: food.id })}
                                >
                                    {templateName}
                                </span>
                            );
                            if (row[category] === '-') {
                                row[category] = [link];
                            } else if (Array.isArray(row[category])) {
                                row[category].push(', ', link);
                            } else {
                                row[category] = [row[category], ', ', link];
                            }
                        }
                    });

                    return row;
                });

                setDietFoodEatList(rows);
                setTotalDocs(rows.length);
            }
        } catch (error) {
            console.error('Failed to fetch grouped food:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchDietFoodEatList(page + 1, rowsPerPage, { sortField, sortOrder }, categories);
    };

    const viewDietFood = async (id) => {
        try {
            const payload = { params: { id } };
            const data = await apiRequest(apiRoutes.viewDietAvoidFood, 'POST', payload, router);
            if (data?.response) {
                return data.data;
            }
        } catch (error) {
            console.error('Error fetching diet food item:', error);
        }
        return null;
    };

    const handleEdit = async (row) => {
        const fullData = await viewDietFood(row.id);
        if (fullData) {
            setEditRowData(fullData);
            setTypeDialogOpen(true);
        }
    };

    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage ?? page;
        const finalRowsPerPage = newRowsPerPage ?? rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);

        fetchDietFoodEatList(finalPage + 1, finalRowsPerPage, { sortField, sortOrder }, categories);
    };

    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        fetchDietFoodEatList(page + 1, rowsPerPage, { sortField: field, sortOrder: direction }, categories);
    };

    const handleToggleStatus = async (updatedRow) => {
        setIsLoading(true);
        const payload = {
            id: updatedRow.id,
            status: updatedRow.status
        };
        const formData = objectToFormData(payload);
        try {
            await apiRequest(apiRoutes.updateDietAvoidFood, 'POST', formData, router);
            fetchDietFoodEatList(page + 1, rowsPerPage, { sortField, sortOrder }, categories);
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
            <div className='flex justify-end'>
                <Button
                    iconPath={'/assets/icons/new-icon.svg'}
                    label='Add'
                    size='extraSmall'
                    color='#fff'
                    backgroundColor={Colors.Primary1}
                    onClick={() => {
                        setEditRowData(null);
                        setTypeDialogOpen(true);
                    }}
                />
            </div>
            <div className='mt-3'>
                <MaterialTable
                    headers={myTableHeaders}
                    data={dietFoodEatList}
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
                open={typeDialogOpen}
                onClose={() => {
                    setTypeDialogOpen(false);
                    setEditRowData(null);
                }}
                title={editRowData ? 'Edit Diet Food' : 'Add Diet Food'}
                titleColor="#000000"
                backgroundColor="#fafcfc"
                maxWidth="xs"
                content={
                    <AddFoodForm
                        isEdit={!!editRowData}
                        existingType={editRowData}
                        onClose={() => {
                            setTypeDialogOpen(false);
                            setEditRowData(null);
                        }}
                        onSuccess={() => {
                            handleRefresh();
                            setTypeDialogOpen(false);
                            setEditRowData(null);
                        }}
                    />
                }
            />
        </div>
    );
}

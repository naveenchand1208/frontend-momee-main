'use client';
import './page.css';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { Colors } from '@/common/constants/colorEnum';
import CustomDialog from '@/components/shared/dialog/dialog';
import Input from '@/components/shared/input/page';
import Textarea from '@/components/shared/textarea/page';
import Button from '@/components/shared/button/page';
import { showSuccess, showError } from '@/common/toast/toastService';
import FileUpload from '@/components/shared/file/page';
import { objectToFormData } from '@/common/utils/util';
export default function NotificationsAdd() {
    const router = useRouter();
    const formRef = useRef(null);
    const [formSubmitted, setFormSubmitted] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false);
    const [backLoading, setBackLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [totalDocs, setTotalDocs] = useState(0);
    const [userList, setUserList] = useState([]);
    const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
    const [selectedUserRows, setSelectedUserRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchKey, setSearchKey] = useState('');
     const [previewUrl, setPreviewUrl] = useState('');
    const [form, setForm] = useState({
        title: '',
        message: '',
        userIds: [],
        momType: '',
        file: '',
    });
    const breadcrumbItems = [
        { label: 'Notifications', href: '/notifications' },
        { label: 'Add Custom Notifications' },
    ];
    const breadcrumbAction = [
        // {
        //   iconPath: '/assets/icons/search-icon.svg',
        //   placeholder: 'Search',
        //   name: 'searchKey',
        //   label: '',
        //   value: form.searchKey,
        //   required: false,
        //   onChange: (e) => setForm({ ...form, searchKey: e.target.value }),
        // },

        {
            iconPath: '',
            label: 'Back',
            type: 'button',
            size: 'extraSmall',
            backgroundColor: Colors.Primary1,
            isLoading: backLoading,
            onClick: () => navigateToBackPage(),
        }
    ];
    const userTableHeaders = [
        { id: 'userName', label: 'Username' },
    ];
    useEffect(() => {
        fetchUsers(1, 5, { momType: form.momType, searchKey });
    }, [form.momType]);
    const navigateToBackPage = () => {
        setBackLoading(true);
        router.push('/notifications');
    }
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedRows([]);
        } else {
            setSelectedRows(userList.map((row) => row.id));
        }
    };
    const handleTableChange = ({ page: newPage, pageSize: newPageSize }) => {
        setPage(newPage);
        setRowsPerPage(newPageSize);
        fetchUsers(newPage, newPageSize, { momType: form.momType });
    };
    const handleSelectRows = (selectedRows) => {
        setSelectedUserRows(selectedRows);
    };
    const allSelected =
        userList.length > 0 && selectedRows.length === userList.length;
    const toggleSelectRow = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };
    const tableHeadersWithCheckbox = [
        {
            id: "__checkbox__",
            label: (
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                />
            ),
            align: "center",
            render: (row) => (
                <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => toggleSelectRow(row.id)}
                />
            ),
        },
        ...userTableHeaders,
    ];
    userList.length > 0 && selectedRows.length === userList.length;
    const fetchUsers = async (pageNum = 1, limit = 5, options = {}) => {
        setIsLoading(true);
        const payload = {
            params: {
                sortField: options.sortField || '',
                sortOrder: options.sortOrder || 'asc',
                pagination: 'false',
                page: pageNum,
                limit: limit,
                momType: options.momType ?? "",
                searchKey: options.searchKey ?? "",

            },
        };
        try {
            const data = await apiRequest(apiRoutes.userList, 'POST', payload, router);
            if (data?.response) {
                const userList = data?.data?.docs?.map((item) => ({ ...item }));
                setUserList(userList || []);
                setTotalDocs(data?.data?.totalDocs);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);

        // Validate form
        if (!form.title || !form.message || form.userIds.length === 0) {
            showError('Please fill all required fields');
            // console.error('Validation failed');
            setButtonLoading(false);
            return;
        }

        try {
            const payload = {
                // params: {
                    // title: form.title,
                    // message: form.message,
                    // userIds: form.userIds.map(String),
                // },
                ...form
            };
            const formData = objectToFormData(payload);
            const data = await apiRequest(apiRoutes.addCustomNotify, 'POST', formData, router);
            if (data?.response) {
                showSuccess('Notification sent successfully!');
                router.push('/notifications');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            741
        } finally {
            setFormSubmitted(false);
            setButtonLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            <div className="d-flex justify-content-between gap-3" style={{ height: 'calc(100vh - 120px)' }}>
                <form className="d-flex gap-3" ref={formRef} onSubmit={handleSubmit} style={{ width: '30%', flexShrink: 0, }}>
                    <div className="custom-form" style={{ width: '100%', marginLeft: '10px' }}>
                        <div className="mt-3">
                            <Input
                                placeholder=""
                                name="title"
                                label="Title"
                                value={form.title}
                                required={true}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>
                        <div className="mt-3">
                            <FileUpload
                                label="Thumbnail"
                                format="image"
                                parentFile={previewUrl}
                                required={true}
                                formSubmitted={formSubmitted}
                                // disabled={!form.momType}
                                onFileSelect={(file) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    setForm({ ...form, file });
                                    setPreviewUrl(previewUrl)
                                }}
                            />
                        </div>
                        <div className="mt-3">
                            <Textarea
                                placeholder=""
                                name="message"
                                label="Message"
                                value={form.message}
                                required={true}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                            />
                        </div>
                        <div className="mt-3">
                            <label className="form-label" style={{ fontSize: '0.875rem' }}>Select Users Type </label>
                            <div className="d-flex gap-2">
                                {['All', 'Preg-mom', 'New-mom'].map((type) => {
                                    const isSelected =
                                        (type === 'All' && form.momType === '') ||
                                        (type === 'Preg-mom' && form.momType === 'pregMom') ||
                                        (type === 'New-mom' && form.momType === 'newMom');

                                    const momTypeValue =
                                        type === 'All' ? '' : type === 'Preg-mom' ? 'pregMom' : 'newMom';

                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`btn btn-sm cursor ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => {
                                                const momTypeValue = type === 'All' ? '' : type === 'Preg-mom' ? 'pregMom' : 'newMom';
                                                setForm((prev) => ({ ...prev, momType: momTypeValue }));
                                                setIsNotifyDialogOpen(true);
                                            }}

                                            style={{ textTransform: 'capitalize', borderRadius: '8px', padding: '6px 12px' }}
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-4" style={{ gap: '5px' }}>
                            <Button
                                label="Send"
                                type="submit"
                                size="small"
                                color="#fff"
                                backgroundColor={Colors.Primary2}
                                isLoading={buttonLoading}
                                disabled={false}
                            />
                        </div>
                    </div>
                </form>
            </div>
            <CustomDialog
                open={isNotifyDialogOpen}
                onClose={() => setIsNotifyDialogOpen(false)}
                title={
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <span>Select Users</span>
                        <input
                            type="text"
                            placeholder="Search by username"
                            className="form-control"
                            style={{ width: '250px', fontSize: '0.85rem', marginLeft: '470px' }}
                            value={searchKey}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchKey(value);
                                fetchUsers(1, 5, { momType: form.momType, searchKey: value });
                            }}
                        />
                    </div>
                }
                titleColor="#000000"
                backgroundColor="#fafcfc"
                maxWidth="md"
                content={
                    <div>
                        <MaterialTable
                            headers={tableHeadersWithCheckbox}
                            data={userList}
                            selection={true}
                            selectedRows={selectedUserRows}
                            onRowSelectionChange={handleSelectRows}
                            isLoading={isLoading}
                            onTableChange={handleTableChange}
                            pagination={false}
                        />
                        <div className="d-flex justify-content-end mt-3">
                            <Button
                                label="Confirm"
                                size="small"
                                backgroundColor={Colors.Primary2}
                                onClick={() => {
                                    setForm((prev) => ({ ...prev, userIds: selectedRows }));
                                    setIsNotifyDialogOpen(false);
                                    console.log("Selected User IDs (userIds):", selectedRows);
                                    const selectedUserObjects = userList.filter(user => selectedRows.includes(user.id));
                                    console.log("Selected User Details:", selectedUserObjects);
                                }}

                            />
                        </div>
                    </div>
                }
            />

        </div>
    );
}

'use client';
import './page.css';
import React from 'react';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Button from '@/components/shared/button/page';
import Input from '@/components/shared/input/page';
import AutoCompleteInput from '@/components/shared/autocomplete/page';
import { Colors } from '@/common/constants/colorEnum';
export default function Manage_Type() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: '',
        status: '',
    });
    const myTableHeaders = [
        { id: 'No', label: 'No', sortable: false },
        { id: 'types', label: 'Food Types', sortable: true },
        { id: 'status', label: 'Status', sortable: true },
        { id: 'date', label: 'Created Date', sortable: true },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const myTableData = [
        {
            No: 1, types: 'Spinach', status: 'Active', date: '12-01-2025',
        },
    ];
    const options = [
        { id: 1, label: 'Active' },
        { id: 2, label: 'InActive' },
    ];
    const handleEdit = (row) => {
        console.log('Parent received EDIT action:', row);
    };
    const handleView = (row) => {
        console.log('Parent received VIEW action:', row);
    };
    const handleDelete = (row) => {
        console.log('Parent received DELETE action:', row);
    };
    const manageType = () => {
        router.push('/food-to-avoid')
    }
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        { iconName: 'view-icon', disabled: false, onClick: handleView },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const handleSelect = (item) => {
        console.log('Selected ID:', item.id);
        setForm((prevForm) => ({
            ...prevForm,
            status: item.label,
        }));
    };
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="px-4 shadow rounded bg-white mb-3"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    background: '#fff'
                }}
            >
                <div className='d-flex justify-content-between align-items-center p-4'>
                    <div className='d-flex gap-2 align-items-center'>
                        <span><a href='/manage-type'> User Management</a> / Food Type</span>
                    </div>

                    <div className='d-flex gap-1'>
                        <Button
                            label="Back"
                            type="button"
                            color="#fff"
                            size='small'
                            backgroundColor={Colors.Primary1}
                            onClick={manageType}
                        />

                    </div>
                </div>
            </div>
            <div className="row " style={{ marginRight: 1 }}>
                <div className="col-md-12 col-lg-8">
                    <MaterialTable headers={myTableHeaders} data={myTableData} actionConfig={actionConfig} />
                </div>

                <div
                    className="col-4 bg-white p-3 rounded">
                    <h5>Create Food Type</h5><hr />
                    <form>
                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <label htmlFor="food-category" className="form-label">
                                    Food types</label>
                                <Input
                                    placeholder=""
                                    name="title"
                                    label="title"
                                    value={form.title}
                                    required={false}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div className="col-md-12 mb-4">
                                <label htmlFor="categorystatus" className="form-label">Status</label>
                                <AutoCompleteInput options={options} onSelect={handleSelect} required={false} label='Status' />

                            </div>
                        </div>
                        <div className='' style={{ marginLeft: '75%' }}>
                            <Button
                                label="Save"
                                type="button"
                                color="#fff"
                                size='small'
                                backgroundColor={Colors.Primary1}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}



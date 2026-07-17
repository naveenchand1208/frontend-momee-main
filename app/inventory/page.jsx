'use client';
import React from 'react';
import './page.css';
import { useRouter } from 'next/navigation';
import MaterialTable from '@/components/shared/material-table/page';
import Button from '@/components/shared/button/page';
import { Colors } from '@/common/constants/colorEnum';

export default function Inventory() {
    const handleView = (row) => {
        console.log('Parent received VIEW action:', row);
    };
    const handleDelete = (row) => {
        console.log('Parent received DELETE action:', row);
    };
    const myTableHeaders = [
        { id: 'productCode', label: 'Product Code', sortable: false },
        { id: 'category', label: 'Category', sortable: true },
        { id: 'productName', label: 'Product Name', sortable: true },
        { id: 'purchaseDateAndQty', label: 'Purchased Date&Qty', sortable: true },
        { id: 'stockAvailability', label: 'Stock Availability', sortable: true },
        { id: 'action', label: 'Action', sortable: false },

    ];

    const myTableData = [
        {
            productCode: '5435341', category: 'Diaper', productName: 'Reusable Baby Diaper', purchaseDateAndQty: '01-03-2025 1500', stockAvailability: '500'
        },
        {
            productCode: '5435341', category: 'Diaper', productName: 'Reusable Baby Diaper', purchaseDateAndQty: '01-03-2025 1500', stockAvailability: '500'
        },
        {
            productCode: '5435341', category: 'Diaper', productName: 'Reusable Baby Diaper', purchaseDateAndQty: '01-03-2025 1500', stockAvailability: '500'
        },
        {
            productCode: '5435341', category: 'Diaper', productName: 'Reusable Baby Diaper', purchaseDateAndQty: '01-03-2025 1500', stockAvailability: '500'
        },
        {
            productCode: '5435341', category: 'Diaper', productName: 'Reusable Baby Diaper', purchaseDateAndQty: '01-03-2025 1500', stockAvailability: '500'
        },
        {
            productCode: '#5435341', category: 'Diaper', productName: 'Reusable Baby Diaper', purchaseDateAndQty: '01-03-2025 1500', stockAvailability: '500'
        },
    ];

    const actionConfig = [
        { iconName: 'view-icon', disabled: false, onClick: handleView },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];

    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: '#fff'
            }}
                className="px-4 shadow rounded bg-white mb-3">
                <div className='d-flex justify-content-between align-items-center p-4'>
                    <div className='d-flex gap-2 align-items-center'>
                        <span><a href='/inventory'> Products
                        </a> / Inventory</span>
                    </div>

                    <div className='d-flex gap-1'>
                        <Button
                            label="Add"
                            type="button"
                            color="#fff"
                            size='small'
                            backgroundColor={Colors.Primary1}
                        />
                        <Button
                            iconPath="/assets/icons/download-icon.svg"
                            type="button"
                            size='small'
                            backgroundColor={Colors.Primary2}
                        />
                    </div>
                </div>

            </div>
            <MaterialTable headers={myTableHeaders} data={myTableData} actionConfig={actionConfig} />
        </div>
    )

}
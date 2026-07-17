'use client';
import React from 'react';
import { Pagination } from '@mui/material';

export default function PaginationComponent({
    totalCount = 0,
    page = 1,
    limit = 10,
    onPageChange = () => { },
    className = '',
}) {
    const totalPages = Math.ceil(totalCount / limit);

    if (totalPages <= 1) return null; // don't show pagination if only one page

    return (
        <div className={`flex justify-center mt-6 ${className}`}>
            <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => onPageChange(value)}
                color="primary"
                shape="rounded"
                size="medium"
            />
        </div>
    );
}

'use client';
import './page.css';
import Image from 'next/image';
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { MOM_TYPES } from '@/common/constants/enum';
import { formattedDate } from '@/common/utils/util';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
import PaginationComponent from '@/components/shared/pagination/page';
export default function Book_Recommendations() {
    const router = useRouter();
    const [addLoading, setAddLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [viewform, setViewform] = useState({});
    const [books, setBooks] = useState([]);
    const fetchedRef = useRef(false);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusLabel, setStatusLabel] = useState('Active/Inactive');
    const [lastPageBeforeFilter, setLastPageBeforeFilter] = useState(1);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(15);
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        momType: '',
        dateRange: { fromDate: '', toDate: '' },
    });
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Book Recommendations', href: '/book-recommendations' },
    ];
    const breadcrumbAction = [
        // {
        //     iconPath: '/assets/icons/download-icon.svg',
        //     type: 'textIcon',
        //     label: 'Export',
        //     onClick: () => console.log('Download clicked'),
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
                if (val === 'All') {
                    setForm((prev) => ({ ...prev, status: '' }));
                    const filters = { ...form };
                    delete filters.status;
                    fetchBooks(filters);
                    setStatusLabel('Active/Inactive');
                } else {
                    setForm((prev) => ({ ...prev, status: val }));
                    fetchBooks({ ...form, status: val });
                    setStatusLabel(val);
                }
            },
        },
        ,
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
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search book name',
            inputType: 'text',
            value: form.searchKey,
        },
        // {
        //     name: 'status',
        //     label: '',
        //     placeholder: 'Choose Status',
        //     inputType: 'autocomplete',
        //     options: ACTIVE_STATUS,
        //     value: form.status,
        // },
        {
            name: 'momType',
            label: '',
            placeholder: 'Choose Mom type',
            inputType: 'autocomplete',
            options: MOM_TYPES,
            value: form.momType,
        },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        },
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchBooks();
    }, []);
    const fetchBooks = async (options = {}) => {
        setIsLoading(true);
        const formatDate = (date) =>
            date ? new Date(date).toISOString().split('T')[0] : '';
        const currentPage = options.page || page;
        const currentLimit = options.limit || limit;
        const payload = {
            params: {
                pagination: 'true',
                page: String(currentPage),
                limit: String(currentLimit),
                searchKey: options.searchKey || '',
                status: options.status || '',
                momType:
                    options.momType === 'Preg Mom'
                        ? 'pregMom'
                        : options.momType === 'New Mom'
                            ? 'newMom'
                            : options.momType === 'Both'
                                ? 'both'
                                : '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };

        try {
            const data = await apiRequest(apiRoutes.getBookList, 'POST', payload, router);
            if (data?.response) {
                const bookList = data?.data?.docs || [];
                console.log('fetchBooks params:', payload.params);
                setBooks(bookList);
                setTotalCount(data.data.totalDocs || 0);
                setPage(data.data.page || currentPage);
                setLimit(data.data.limit || currentLimit);
            }
        } catch (error) {
            console.error('Failed to fetch books:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleEdit = (row) => {
        router.push(`/book-recommendations/${row?.id}`)
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
        const data = await apiRequest(apiRoutes.deleteBook, 'POST', payload, router);
        if (data.response) {
            fetchBooks()
        }
    };
    const handleAdd = () => {
        setAddLoading(true);
        router.push('/book-recommendations/add');
    }
    const handleFilterSubmit = (filterValues) => {
        const isClearingFilter =
            !filterValues.searchKey && !filterValues.status && !filterValues.momType &&
            (!filterValues.dateRange?.fromDate && !filterValues.dateRange?.toDate);
        setFilterOpen(false)
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            status: filterValues.status || '',
            momType: filterValues.momType || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },

        }));
        if (isClearingFilter) {
            setPage(lastPageBeforeFilter);
            fetchBooks({ ...filterValues, page: lastPageBeforeFilter });
        } else {
            setLastPageBeforeFilter(page);
            setPage(1);
            fetchBooks({ ...filterValues, page: 1 });
        }
    }

    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        // { iconName: 'pdf-icon', disabled: false, onClick: handlePdf },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb
                items={breadcrumbItems}
                actionButton={breadcrumbAction}
            />
            {isLoading ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        width: '100%',
                    }}
                >
                    <CircularProgress />
                </div>
            ) : books.length === 0 ? (
                <div style={{ textAlign: 'center', width: '100%', marginTop: '280px', color: '#999' }}>
                    <p style={{ fontSize: '16px' }}>No books found</p>
                </div>
            ) : (
                <div className="book-grid">
                    {books.map((book) => (
                        <div key={book.id} className="book-card-wrapper">
                            <div className="book-card">
                                <div
                                    style={{
                                        fontSize: '11px',
                                        marginLeft: '130px',
                                        color: '#6b7280',
                                    }}
                                >
                                    {book.momType || 'Both'}
                                </div>
                                <div className="book-image-container">
                                    <Image
                                        src={book?.file || '/assets/books.png'}
                                        alt={book?.title || 'Book'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="book-footer">
                                    <div className="book-footer-text" style={{ flex: 1 }}>
                                        <p className="truncate w-[120px]" title={book.title || 'Unknown Title'}>
                                            {book.title || 'Unknown Title'}
                                        </p>
                                        <p className="truncate w-[120px]" title={formattedDate(book.createdAt) || ''}>
                                            Created At: {formattedDate(book.createdAt)}
                                        </p>
                                    </div>

                                    <div className="d-flex justify-content-center gap-2 mb-1 cursor">
                                        {actionConfig.length > 0 &&
                                            actionConfig.map((action) => (
                                                <Image
                                                    key={action.iconName}
                                                    src={`/assets/icons/${action.iconName}.svg`}
                                                    alt={action.iconName}
                                                    width={14}
                                                    height={14}
                                                    onClick={() => action.onClick(book)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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
            {totalCount > limit && (
                <div className="mt-5">
                    <PaginationComponent
                        totalCount={totalCount}
                        page={page}
                        limit={limit}
                        onPageChange={(newPage) => {
                            setPage(newPage);
                            fetchBooks({ ...form, page: newPage });
                        }}
                    />
                </div>
            )}
        </div>
    )
}



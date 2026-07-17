'use client';
import './page.css';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { ACTIVE_STATUS, MOM_TYPE } from '@/common/constants/enum';
import { getMonths, getWeeks ,formattedDate,formatDate} from '@/common/utils/util';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import CustomDialog from '@/components/shared/dialog/dialog';
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress, Divider } from '@mui/material';
import MaterialTable from '@/components/shared/material-table/page';
export default function Badges() {
    const router = useRouter();
    const fetchedRef = useRef(false);
    const [badges, setBadges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [viewform, setViewform] = useState({});
    const [months, setMonths] = useState(false);
    const [weeks, setWeeks] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogBadges, setDialogBadges] = useState([]);
    const [dialogTitle, setDialogTitle] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const paginatedBadges = dialogBadges.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
    const [statusLabel, setStatusLabel] = useState('Active/Inactive');
    const [expandedPregWeeks, setExpandedPregWeeks] = useState([]);
    const [expandedNewMonths, setExpandedNewMonths] = useState([]);
    const [form, setForm] = useState({
        searchKey: '',
        status: '',
        momType: '',
        dateRange: { fromDate: '', toDate: '' },
        month: '',
        week: '',
    });
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchBadges();
    }, []);
    useEffect(() => {
        const month = getMonths();
        setMonths(month);
        const week = getWeeks();
        setWeeks(week);
    }, []);
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Badges', href: '/badges' },
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
                    fetchBadges(filters);
                    setStatusLabel('Active/Inactive');
                } else {
                    setForm((prev) => ({ ...prev, status: val }));
                    fetchBadges({ ...form, status: val });
                    setStatusLabel(val);
                }
            },
        },
        {
            iconPath: '/assets/icons/new-icon.svg',
            label: 'Add',
            type: 'button',
            size: 'extraSmall',
            color: '#fff',
            backgroundColor: Colors.Primary1,
            isLoading: addLoading,
            onClick: () => handleAddBadges(),
        },

    ];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search title',
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
            options: MOM_TYPE,
            value: form.momType,
        },
        {
            name: 'dateRange',
            label: '',
            placeholder: 'Choose dateRange',
            inputType: 'dateRange',
            value: { fromDate: '', toDate: '' },
        },
        {
            name: 'month',
            label: '',
            placeholder: 'Choose month',
            inputType: 'autocomplete',
            options: months,
            value: form.month,
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
    const myTableHeaders = [
        { id: 'file', label: 'Thumbnail', sortable: false },
        { id: 'title', label: 'Title', sortable: true },
        { id: 'status', label: 'Status', sortable: false },
        { id: 'action', label: 'Action', sortable: false },
    ];
    const togglePregWeek = (week) => {
        setExpandedPregWeeks(prev =>
            prev.includes(week)
                ? prev.filter(w => w !== week)
                : [...prev, week]
        );
    };
    const toggleNewMonth = (month) => {
        setExpandedNewMonths(prev =>
            prev.includes(month)
                ? prev.filter(m => m !== month)
                : [...prev, month]
        );
    };
    const fetchBadges = async (options = {}) => {
        setIsLoading(true);
        const formatDate = (date) =>
            date ? new Date(date).toISOString().split('T')[0] : '';
        const payload = {
            params: {
                pagination: 'false',
                page: 1,
                limit: 10,
                searchKey: options.searchKey || '',
                status: options.status || '',
                week: options.week || '',
                month: options.month || '',
                momType:
                    options.momType === 'Preg Mom'
                        ? 'pregMom'
                        : options.momType === 'New Mom'
                            ? 'newMom'
                            : '',
                fromDate: formatDate(options.dateRange?.fromDate),
                toDate: formatDate(options.dateRange?.toDate),
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getBadgesList, 'POST', payload, router);
            if (data?.response) {
                setBadges(data.data.docs);
            }
        } catch (err) {
            console.error('Failed to fetch articles:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleAddBadges = () => {
        setAddLoading(true);
        router.push('/badges/add');
    }
    const handleEdit = (row) => {
        router.push(`/badges/${row?.id}`)
    };
    const handleDelete = (row) => {
        setViewform(row)
        setIsDeleteDialogOpen(true)
    };
    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false)
        // const selectedWeek = weeks.find(e => e.label === filterValues.week);
        // const weekId = selectedWeek?.value;
        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            status: filterValues.status || '',
            momType: filterValues.momType || '',
            dateRange: filterValues.dateRange || { fromDate: '', toDate: '' },
            month: filterValues.month || '',
            week: filterValues.week || '',
        }));
        fetchBadges({ sortField, sortOrder, ...filterValues });
    }
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        // { iconName: 'view-icon', disabled: false, onClick: handleView },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
    ];
    const handleDeleteCancel = () => {
        setIsDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);
        const payload = { params: { id: viewform.id } }
        const data = await apiRequest(apiRoutes.deleteBadges, 'POST', payload, router);
        if (data.response) {
            fetchBadges()
        }
    };
    const handleTableChange = ({ newPage, newRowsPerPage }) => {
        const finalPage = newPage !== undefined ? newPage : page;
        const finalRowsPerPage = newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage;

        if (newRowsPerPage !== undefined) setRowsPerPage(newRowsPerPage);
        if (newPage !== undefined) setPage(newPage);
    };
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
            ) : badges.length === 0 ? (
                <div style={{ textAlign: 'center', width: '100%', marginTop: '280px', color: '#999' }}>
                    <p style={{ fontSize: '16px' }}>No badges found</p>
                </div>
            ) : (
                <div className="d-flex justify-content-between gap-3">
                    {/* Preg-mom section */}
                    <div style={{ width: '50%' }}>
                        <h6 className="text-center mb-4" style={{ fontSize: '13px' }}>Preg-mom</h6>
                        {Object.entries(
                            badges
                                .filter(b => b.momType === 'pregMom')
                                .reduce((acc, badge) => {
                                    acc[badge.week] = acc[badge.week] || [];
                                    acc[badge.week].push(badge);
                                    return acc;
                                }, {})
                        )
                            // .sort(([a], [b]) => Number(a) - Number(b))
                            .sort(([a], [b]) => {
                                const numA = parseInt(a.replace(/\D/g, ''), 10);
                                const numB = parseInt(b.replace(/\D/g, ''), 10);
                                return numA - numB;
                            })
                            .map(([week, badgesInWeek]) => {
                                const isExpanded = expandedPregWeeks.includes(week);
                                return (
                                    <div key={week} className="mb-5">
                                        <div className="d-flex justify-content-between align-items-center mb-2 px-2">
                                            <h6 className="fw-bold" style={{ fontSize: '10px' }}>{week}</h6>
                                        </div>

                                        <div className="d-flex flex-wrap gap-4 align-items-start px-2">
                                            {(isExpanded ? badgesInWeek : badgesInWeek.slice(0, 3)).map((badge) => (
                                                <div key={badge.id} className="text-center d-flex flex-column align-items-center" style={{ flex: '1 0 18%', maxWidth: '18%' }}>
                                                    <Image
                                                        className="rounded-circle border"
                                                        src={badge.file}
                                                        alt="badge"
                                                        width={64}
                                                        height={64}
                                                    />
                                                    <div className="text-danger mt-2 fw-medium" style={{ fontSize: '8px' }}>{badge.title}</div>
                                                    <div className="text-danger mt-2 fw-medium" style={{ fontSize: '8px' }}>Created At: {formattedDate(badge.createdAt)}</div>

                                                    <div className="d-flex justify-content-center gap-2 mt-1 cursor">
                                                        {actionConfig.map((action) => (
                                                            <Image
                                                                key={action.iconName}
                                                                src={`/assets/icons/${action.iconName}.svg`}
                                                                alt={action.iconName}
                                                                width={14}
                                                                height={14}
                                                                onClick={() => action.onClick(badge)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {badgesInWeek.length > 3 && (
                                                <div className="d-flex align-items-center">
                                                    <a
                                                        href="#"
                                                        className="text-primary fw-medium text-decoration-none cursor"
                                                        style={{ marginTop: '25px', fontSize: '12px' }}
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            setDialogBadges(badgesInWeek);
                                                            setDialogTitle(<span style={{ fontSize: '13px' }}>{`Badges - ${week}`}</span>);
                                                            setDialogOpen(true);
                                                        }}
                                                    >
                                                        {isExpanded ? 'Show less' : 'See all'}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    {/* New-mom section */}
                    <div style={{ width: '50%' }}>
                        <h6 className="text-center mb-4" style={{ fontSize: '13px' }}>New-mom</h6>
                        {Object.entries(
                            badges
                                .filter(b => b.momType === 'newMom')
                                .reduce((acc, badge) => {
                                    acc[badge.month] = acc[badge.month] || [];
                                    acc[badge.month].push(badge);
                                    return acc;
                                }, {})
                        )
                            // .sort(([a], [b]) => Number(a) - Number(b))
                            .sort(([a], [b]) => {
                                const numA = parseInt(a.replace(/\D/g, ''), 10);
                                const numB = parseInt(b.replace(/\D/g, ''), 10);
                                return numA - numB;
                            })
                            .map(([month, badgesInMonth]) => {
                                const isExpanded = expandedNewMonths.includes(month);
                                return (
                                    <div key={month} className="mb-5">
                                        <div className="d-flex justify-content-between align-items-center mb-2 px-2">
                                            <h6 className="fw-bold" style={{ fontSize: '10px' }}>Month {month}</h6>
                                        </div>

                                        <div className="d-flex flex-wrap gap-4 align-items-start px-2">
                                            {(isExpanded ? badgesInMonth : badgesInMonth.slice(0, 3)).map((badge) => (
                                                <div key={badge.id} className="text-center d-flex flex-column align-items-center" style={{ flex: '1 0 18%', maxWidth: '18%' }}>
                                                    <Image
                                                        className="rounded-circle border"
                                                        src={badge.file}
                                                        alt="badge"
                                                        width={64}
                                                        height={64}
                                                    />
                                                    <div className="text-danger mt-2 fw-medium" style={{ fontSize: '8px' }}>{badge.title}</div>
                                                    <div className="text-danger mt-2 fw-medium" style={{ fontSize: '8px' }}>Created At: {formatDate(badge.createdAt)}</div>

                                                    <div className="d-flex justify-content-center gap-2 mt-1 cursor">
                                                        {actionConfig.map((action) => (
                                                            <Image
                                                                key={action.iconName}
                                                                src={`/assets/icons/${action.iconName}.svg`}
                                                                alt={action.iconName}
                                                                width={14}
                                                                height={14}
                                                                onClick={() => action.onClick(badge)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {badgesInMonth.length > 3 && (
                                                <div className="d-flex justify-content-center mt-2">
                                                    <a
                                                        href="#"
                                                        className="text-primary fw-medium text-decoration-none"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleNewMonth(month);
                                                        }}
                                                    >
                                                        {isExpanded ? 'Show less' : 'See all'}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
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
            <CustomDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={dialogTitle}
                titleColor="#000000"
                backgroundColor="#fafcfc"
                content={
                    <MaterialTable
                        headers={myTableHeaders}
                        data={paginatedBadges}
                        actionConfig={actionConfig}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalCount={dialogBadges.length}
                        isLoading={false}
                        sortConfig={{}}
                        onSortChange={() => { }}
                        onToggleStatus={() => { }}
                        onTableChange={handleTableChange}
                    />
                }
                actions={<button onClick={() => setDialogOpen(false)}>Close</button>}
                maxWidth="md"
                position="top-left"
            />
        </div>
    );
}

'use client';
import '../material-table/page.css';
import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    TablePagination,
    CircularProgress,
    Select,
    MenuItem
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import Image from 'next/image';
import Tooltip from '@mui/material/Tooltip';
import ToggleSwitch from '../toggle-switch/page';
import AutoCompleteInput from '../autocomplete/page';
import CustomDialog from '../dialog/dialog';
import { DropdownSelect } from '../select-dropdown/page';
export default function MaterialTable({
    headers,
    data: initialData,
    onSort,
    actionConfig = [],
    sortConfig = {},
    onSortChange,
    isLoading = false,
    disableLoading = false,
    onToggleStatus,
    page,
    rowsPerPage,
    totalCount,
    onTableChange,
    dropdownStatusOptions = [],
    pagination = true,
    onDropdownChange
}) {
    const [rows, setRows] = useState(initialData);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loadingAction, setLoadingAction] = useState({ rowId: null, icon: null });
    useEffect(() => setRows(initialData), [initialData]);
    console.log('totalCount', totalCount)
    const handleSortIconClick = (property) => {
        console.log('property', property)
        let newSort;
        if (sortConfig[property] === 'asc') {
            newSort = 'desc';
        } else if (sortConfig[property] === 'desc') {
            newSort = 'asc';
        } else {
            newSort = 'asc';
        }

        if (onSortChange && newSort) {
            onSortChange(property, newSort);
        }
    };
    const handleChangePage = (event, newPage) => {
        onTableChange({ newPage });
    };
    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        onTableChange({ newRowsPerPage, newPage: 0 });
    };
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    // const visibleRows = rows.slice(
    //     page * rowsPerPage,
    //     page * rowsPerPage + rowsPerPage,
    // );
    const visibleRows = rows;
    const handleToggle = (id, newChecked) => {
        const updatedStatus = newChecked ? 'Active' : 'Inactive';
        const updatedRows = rows.map(r =>
            r.id === id ? { ...r, status: updatedStatus } : r
        );
        setRows(updatedRows);
        if (onToggleStatus) {
            const updatedRow = updatedRows.find(r => r.id === id);
            onToggleStatus(updatedRow);
        }
    };
    const getMimeType = (url) => {
        if (!url) return '';
        const ext = url.split('.').pop().toLowerCase();
        switch (ext) {
            case 'mp3':
                return 'audio/mpeg';
            case 'wav':
                return 'audio/wav';
            case 'ogg':
                return 'audio/ogg';
            case 'aac':
                return 'audio/aac';
            case 'flac':
                return 'audio/flac';
            default:
                return 'audio/mpeg'; // Fallback
        }
    };
    const handleDropdownStatusSelect = (id, selectedOption) => {
        const updatedRow = {
            id,
            dropdownStatus: selectedOption || '',
            status: selectedOption || '',
        };
        onDropdownChange(updatedRow);
    };
    const handleOpenDialog = (imageUrl) => {
        setSelectedImage(imageUrl);
        setDialogOpen(true);
    };
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedImage(null);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'auto' }}>
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="dynamic table with pagination and sorting">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f4f5f9' }}>
                            {headers.map((header) => (
                                <TableCell
                                    key={header.id}
                                    sortDirection={sortConfig[header.id]}
                                    sx={{ fontWeight: '500', fontSize: '13px' }}
                                >
                                    {header.sortable !== false ? (
                                        <TableSortLabel
                                            active={!!sortConfig[header.id]}
                                            direction={sortConfig[header.id] === 'desc' ? 'desc' : 'asc'}
                                            onClick={() => handleSortIconClick(header.id)}
                                            className='cursor'
                                        >
                                            {header.label}
                                            {sortConfig[header.id] ? (
                                                <span style={visuallyHidden}>
                                                    {sortConfig[header.id] === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                </span>
                                            ) : null}
                                        </TableSortLabel>
                                    ) : (
                                        header.label
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={headers.length}>
                                    <div className="d-flex justify-center items-center" style={{ height: '200px' }}>
                                        <CircularProgress />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (visibleRows.length > 0 ? (
                            visibleRows.map((row) => (
                                <TableRow
                                    key={row.id || Math.random()}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    {headers.map((header) => (
                                        <TableCell key={header.id} sx={{ fontSize: '12px' }}>
                                            {header.id === 'action' ? (
                                                <div className='d-flex gap-2'>
                                                    {/* {actionConfig.map((action, i) => (
                                                        <Tooltip
                                                            key={i}
                                                            title={
                                                                action.tooltip
                                                                    ? action.tooltip
                                                                    : action.iconName === 'view-icon' ? 'View' :
                                                                        action.iconName === 'edit-icon' ? 'Edit' :
                                                                            action.iconName === 'delete-icon' ? 'Delete' :
                                                                                ''
                                                            }
                                                            arrow
                                                        >
                                                            <Image
                                                                key={i}
                                                                src={`/assets/icons/${action.iconName}.svg`}
                                                                alt="Icon"
                                                                width={15}
                                                                height={15}
                                                                className={`
                                                                ${action.disabled ? 'cursor-not-allowed opacity-50' : 'cursor'}
                                                                `}
                                                                onClick={() => {
                                                                    if (!action.disabled) {
                                                                        console.log(`${action.iconName} clicked`, row);
                                                                        action.onClick(row);
                                                                    }
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    ))} */}
                                                    {actionConfig.map((action, i) => {
                                                        const isViewOrEdit = action.iconName === 'view-icon' || action.iconName === 'edit-icon';
                                                        const isLoading =
                                                            isViewOrEdit &&
                                                            loadingAction?.rowId === row?.id &&
                                                            loadingAction?.icon === action.iconName;

                                                        return (
                                                            <Tooltip
                                                                key={i}
                                                                title={
                                                                    action.tooltip ||
                                                                    (action.iconName === 'view-icon'
                                                                        ? 'View'
                                                                        : action.iconName === 'edit-icon'
                                                                            ? 'Edit'
                                                                            : action.iconName === 'delete-icon'
                                                                                ? 'Delete'
                                                                                : '')
                                                                }
                                                                arrow
                                                            >
                                                                <div
                                                                    className="relative flex items-center justify-center p-1"
                                                                    onClick={async () => {
                                                                        if (!action.disabled) {
                                                                            if (isViewOrEdit) {
                                                                                requestAnimationFrame(() => {
                                                                                    setLoadingAction({ rowId: row.id, icon: action.iconName });
                                                                                });
                                                                            }

                                                                            try {
                                                                                await action.onClick(row);
                                                                            } catch (error) {
                                                                                console.error(error);
                                                                            } finally {
                                                                                if (isViewOrEdit) {
                                                                                    setLoadingAction({ rowId: null, icon: null });
                                                                                }
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    {!disableLoading && isLoading ? (
                                                                        <CircularProgress size={16} />
                                                                    ) : (
                                                                        <Image
                                                                            src={`/assets/icons/${action.iconName}.svg`}
                                                                            alt="Icon"
                                                                            width={15}
                                                                            height={15}
                                                                            className={`transition-opacity duration-200 ${action.disabled
                                                                                ? 'cursor-not-allowed opacity-50'
                                                                                : 'cursor-pointer'
                                                                                }`}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </Tooltip>
                                                        );
                                                    })}

                                                </div>
                                            ) : header.id === 'file' ? (
                                                <Image
                                                    className='cursor'
                                                    src={row[header.id] || null}
                                                    alt="Image"
                                                    width={40}
                                                    height={40}
                                                    style={{
                                                        // objectFit: 'contain',
                                                        borderRadius: '50%',
                                                    }}
                                                    onClick={() => handleOpenDialog(row[header.id])}
                                                />
                                            ) : header.id === 'dropdownStatus' ? (
                                                //   <DropdownSelect 
                                                //   key={`${row.id}-${header.id}`}
                                                //   options={dropdownStatusOptions} 
                                                //   onSelect={(selectedOption) => handleDropdownStatusSelect(row, selectedOption)} 
                                                //   />

                                                // <AutoCompleteInput
                                                //     key={`${row.id}-${header.id}`}
                                                //     label=""
                                                //     options={dropdownStatusOptions}
                                                //     value={row[header.id] || null}
                                                //     required={false}
                                                //     commonFilter="true"
                                                //     onSelect={(selectedOption) => handleDropdownStatusSelect(row, selectedOption)}
                                                // />

                                                <Select
                                                    key={`${row.id}-${header.id}`}
                                                    value={row.status}
                                                    onChange={(e) => handleDropdownStatusSelect(row.id, e.target.value)}
                                                    fullWidth
                                                    sx={{
                                                        height: 30,
                                                        minHeight: 30,
                                                        '.MuiSelect-select': {
                                                            paddingTop: '4px',
                                                            paddingBottom: '4px',
                                                        },
                                                    }}
                                                    MenuProps={{
                                                        disablePortal: false,
                                                        container: document.body,
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 200,
                                                                zIndex: 9999,
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {dropdownStatusOptions.map((option, idx) => (
                                                        <MenuItem key={idx} value={option.label}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>

                                            ) : header.id === 'music' ? (
                                                <audio controls style={{ width: 210 }}>
                                                    <source src={row[header.id]} type={getMimeType(row[header.id])} />
                                                    Your browser does not support audio playback.
                                                </audio>
                                            ) : header.id === 'status' ? (
                                                <div style={{ textAlign: 'start' }}>
                                                    <ToggleSwitch isChecked={row.status === 'Active'} onToggle={(newChecked) => handleToggle(row.id, newChecked)} />
                                                    {/* {row[header.id]} */}
                                                </div>
                                            ) : header.renderCell ? (
                                                header.renderCell(row)
                                            ) : header.render ? (
                                                header.render(row)
                                            ) : (
                                                row[header.id]
                                            )
                                            }

                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow sx={{ minWidth: 650 }}>
                                <TableCell colSpan={headers.length} align="center">
                                    <div style={{
                                        height: '230px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: '#888',
                                        fontSize: '12px'
                                    }}>
                                        No Data
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                        )}

                        {/* {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={headers.length} />
                            </TableRow>
                        )} */}
                    </TableBody>
                </Table>
            </TableContainer>

            {pagination && !isLoading && visibleRows.length > 0 && (
                <TablePagination
                    sx={{
                        '& .MuiToolbar-root': {
                            alignItems: 'baseline',
                        },

                        '& .MuiTablePagination-actions button, \
     & .MuiSelect-select, \
     & .MuiTablePagination-selectIcon,': {
                            cursor: 'pointer',
                        },
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
            <CustomDialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                title="Preview Image"
                content={
                    <div style={{ textAlign: 'center' }}>
                        <Image
                            src={selectedImage || '/placeholder.jpg'}
                            alt="Full Image"
                            className='cursor'
                            width={400}
                            height={400}
                            style={{ borderRadius: '1rem', objectFit: 'contain' }}
                        />
                    </div>
                }
            />
        </Paper>

    );
}

'use client';
import './page.css';
import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { formatDate } from '@/common/utils/util';
import { CircularProgress } from '@mui/material';
import CustomDialog from '@/components/shared/dialog/dialog';
import CommonFilter from '@/components/shared/common-filter/page';
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
export default function Community() {
    const fetchedRef = useRef(false);
    const router = useRouter();
    const hasFetchedUsers = useRef(false);
    const hasFetchedCategories = useRef(false);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [selectedComments, setSelectedComments] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [isDeleteCommunity, setIsDeleteCommunity] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [cummunities, setcummunities] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [communityId, setCommunityId] = useState(null);
    const [form, setForm] = useState({
        searchKey: '',
        user: '',
        category: '',
    });
    const breadcrumbItems = [
        { label: 'Content Management', },
        { label: 'Community', href: '/community' },
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
            iconPath: '/assets/icons/category-icon.svg',
            label: 'Category',
            type: 'textIcon',
            isLoading: categoryLoading,
            onClick: () => manageCategory(),
        }];
    const inputFields = [
        {
            name: 'searchKey',
            placeholder: 'search community',
            inputType: 'text',
            value: form.searchKey,
        },
        {
            name: 'user',
            label: '',
            placeholder: 'Choose user',
            inputType: 'autocomplete',
            options: userOptions,
            value: form.user,
        },
        {
            name: 'category',
            label: '',
            placeholder: 'Choose category',
            inputType: 'autocomplete',
            options: categoryOptions,
            value: form.category,
        },
    ];
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchCommunities();
    }, []);
    useEffect(() => {
        if (!hasFetchedUsers.current) {
            hasFetchedUsers.current = true;
            const fetchUserOptions = async () => {
                try {
                    const payload = { params: { pagination: 'false' } };
                    const data = await apiRequest(apiRoutes.userList, 'POST', payload, router);
                    if (data?.response) {
                        const users = data.data.docs.map((user) => ({
                            label: user.userName,
                            value: user.id,
                        }));
                        setUserOptions(users);
                        console.log(users);
                    }
                } catch (error) {
                    console.error('Failed to fetch user options:', error);
                }
            };
            fetchUserOptions();
        }
    }, []);
    useEffect(() => {
        if (!hasFetchedCategories.current) {
            hasFetchedCategories.current = true;

            const fetchCategoryOptions = async () => {
                try {
                    const payload = {
                        params: {
                            pagination: 'false',
                        },
                    };

                    const data = await apiRequest(apiRoutes.getCommunityCategoryList, 'POST', payload, router);
                    console.log('Category API response:', data);

                    if (data?.response) {
                        const categoryList = data.data.docs.map((category) => ({
                            label: category.title,
                            value: category.id,
                        }));
                        setCategoryOptions(categoryList);
                        console.log('Mapped category options:', categoryList);
                    } else {
                        console.warn('No categories found in API response.');
                    }
                } catch (error) {
                    console.error('Failed to fetch category options:', error);
                }
            };

            fetchCategoryOptions();
        }
    }, []);
    const fetchCommunities = async (options = {}) => {
        setIsLoading(true);
        const payload = {
            params: {
                pagination: 'false',
                page: 1,
                limit: 5,
                userId: options.user?.toString() || '',
                categoryId: options.category || '',
                searchKey: options.searchKey || '',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getCommunityList, 'POST', payload, router);
            if (data?.response) {
                setcummunities(data.data.docs);
            }
        } catch (err) {
            console.error('Failed to fetch articles:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleFilterSubmit = (filterValues) => {
        setFilterOpen(false);
        const selectedUser = userOptions.find(user =>
            user.value === filterValues.user || user.label === filterValues.user
        );
        const id = selectedUser?.value?.toString() || '';

        const selectedCategory = categoryOptions.find(cat =>
            cat.value === filterValues.category || cat.label === filterValues.category
        );
        const categoryId = selectedCategory?.value || '';

        setForm(prev => ({
            ...prev,
            searchKey: filterValues.searchKey || '',
            user: filterValues.user || '',
            category: filterValues.category || ''
        }));
        fetchCommunities({
            user: id,
            category: categoryId,
            searchKey: filterValues.searchKey || '',
        });
    };
    const manageCategory = () => {
        setCategoryLoading(true);
        router.push('/community/manage-category')
    }
    const handleCommunity = async (comm) => {
        setIsLoading(true);
        // console.log('setSelectedCommunity', comm)
        setSelectedCommunity(comm);
        const payload = {
            params: {
                id: comm.id,
                pagination: 'false',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.getCommentList, 'POST', payload, router);
            if (data?.response) {
                setSelectedComments(data.data.comments)
                console.log('setSelectedComments', data.data.comments)
            }
        } catch (err) {
            console.error('Failed to fetch articles:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseClick = (item) => {
        console.log('item', item)
        setCommunityId(item.id)
        setIsDeleteDialogOpen(true)
        setIsDeleteCommunity(true)
    }
    const handleDeleteCancel = () => {
        setIsDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);
        const payload = isDeleteCommunity
            ? { params: { id: communityId } }
            : { params: { communityId: communityId, commentId: deleteId } };

        const apiRoute = isDeleteCommunity
            ? apiRoutes.deleteCommunity
            : apiRoutes.deleteComment;

        const data = await apiRequest(apiRoute, 'POST', payload, router);
        if (data.response) {
            fetchCommunities()
            setDeleteId(null)
            setSelectedCommunity(null)
            setIsDeleteCommunity(false)
        }
    };
    const handleDeleteComments = (community, comment) => {
        // console.log('item', item)
        setCommunityId(community.id)
        setDeleteId(comment.commentId)
        setIsDeleteDialogOpen(true)
    }
    // const handleDeleteCancel = () => {
    //     setIsDeleteDialogOpen(false);
    // };
    // const handleDeleteConfirm = async () => {
    //     setIsDeleteDialogOpen(false);
    //     const payload = { params: { id: deleteId } }
    //     const data = await apiRequest(apiRoutes.deleteCommunity, 'POST', payload, router);
    //     if (data.response) {
    //         fetchCommunities()
    //         setDeleteId(null)
    //         setSelectedCommunity(null)
    //     }
    // };
    const approvePost = async (id) => {
        // setIsDeleteDialogOpen(false);
        const payload = { params: { id: id } }
        const data = await apiRequest(apiRoutes.approveCommunity, 'POST', payload, router);
        if (data.response) {
            fetchCommunities()
            // setDeleteId(null)
            setSelectedCommunity(null)
        }
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
            ) : cummunities.length === 0 ? (
                <div style={{ textAlign: 'center', width: '100%', marginTop: '280px', color: '#999' }}>
                    <p style={{ fontSize: '16px' }}>No Data found</p>
                </div>
            ) : (
                <div className="row">
                    <div className="col-lg-5">
                        {cummunities.map((community) => (
                            <div key={community.id} className="mb-3 position-relative">
                                <div

                                    onClick={() => handleCommunity(community)}
                                    className="rounded-3 h-100 mb-3 cursor"
                                    style={{
                                        backgroundColor:
                                            selectedCommunity && community.id === selectedCommunity.id
                                                ? '#d8e61c'          // Selected (first priority)
                                                : community.approved
                                                    ? '#d4edda'        // Approved (second priority)
                                                    : '#ffffff'       // Default
                                    }}
                                >
                                    <div className="w-p100 d-flex align-items-center m-1 p-2">
                                        <Image
                                            src={community?.category?.file || '/assets/profile.jpg'}
                                            alt="icon"
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                        <div className="w-p100 overflow-hidden px-4">
                                            {/* <div className='d-flex justify-content-between'> */}
                                            <h6 className="mt-0 mb-0 fs-14 fw-200">

                                                {community.title}

                                            </h6>
                                            {/* </div> */}
                                            <div className="d-flex align-items-center ">
                                                <div className="pt-4 me-5 d-flex align-items-center gap-3">
                                                    {/* Date */}
                                                    <div className="d-flex align-items-center gap-1">
                                                        <Image
                                                            src="/assets/icons/calendar-icon.svg"
                                                            alt="calendar"
                                                            width={13}
                                                            height={13}
                                                        />
                                                        <span style={{ fontSize: "12px" }}>{formatDate(community.createdAt, 'DD-MMM-YYYY')}</span>
                                                    </div>

                                                    {/* Time */}
                                                    <div className="d-flex align-items-center gap-1">
                                                        <Image
                                                            src="/assets/icons/clock-icon.svg"
                                                            alt="clock"
                                                            width={13}
                                                            height={13}
                                                        />
                                                        <span style={{ fontSize: "12px" }}>{formatDate(community.createdAt, 'HH:mm')}</span>
                                                    </div>
                                                </div>

                                                <Image
                                                    src={`/assets/icons/likes-icon.svg`}
                                                    alt="icon"
                                                    width={20}
                                                    height={20}
                                                />
                                                <div className="pt-4 me-4" style={{ fontSize: "12px" }}>{community.totalLikes}</div>

                                                <Image
                                                    src={`/assets/icons/comments-icon.svg`}
                                                    alt="icon"
                                                    width={20}
                                                    height={20}
                                                />

                                                <div className="pt-4 me-4" style={{ fontSize: "12px" }}>{community.totalComments}</div>

                                                <Image
                                                    src={`/assets/icons/community-report.svg`}
                                                    alt="icon"
                                                    width={20}
                                                    height={20}
                                                />

                                                <div className="pt-4" style={{ fontSize: "12px" }}>{community.reportsLength}</div>
                                            </div>

                                        </div>
                                        <div className='' style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '8px',
                                        }}
                                            onClick={() => handleCloseClick(community)}
                                        >
                                            {/* <Image
                                                src={'/assets/icons/wrong-icon.svg'}
                                                alt="icon"
                                                width={15}
                                                height={15}
                                                className="rounded-full"
                                            /> */}
                                            <div className="position-relative d-inline-block">
                                                <Image
                                                    src="/assets/icons/wrong-icon.svg"
                                                    alt="icon"
                                                    width={15}
                                                    height={15}
                                                    className="rounded-full cursor-pointer"
                                                />
                                                <span className="tooltip-text">Delete Community</span>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectedCommunity && (
                        <div className="col-lg-7 mt-1">
                            <div className="rounded p-3" style={{ backgroundColor: 'white' }}>
                                <div className="d-flex align-items-center justify-content-end gap-1 cursor-pointer">
                                    {!selectedCommunity.approved && (
                                        <button className='btn btn-success'
                                            onClick={() => approvePost(selectedCommunity.id)}
                                        >Approve</button>
                                    )}

                                    <div
                                        // className='' style={{
                                        //     position: 'absolute',
                                        //     top: '2px',
                                        //     right: '8px',
                                        // }}
                                        onClick={() => handleCloseClick(selectedCommunity)}
                                    >
                                        {/* <Image
                                            src={'/assets/icons/wrong-icon.svg'}
                                            alt="icon"
                                            width={15}
                                            height={15}
                                            className="rounded-full"
                                        /> */}
                                        <div className="position-relative d-inline-block">
                                            <Image
                                                src="/assets/icons/wrong-icon.svg"
                                                alt="icon"
                                                width={15}
                                                height={15}
                                                className="rounded-full cursor-pointer"
                                            />
                                            <span className="tooltip-text">Delete Community</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="row align-items-center" style={{ borderBottom: '1px solid gray' }}>
                                    <div className='col-10 p-2'>
                                        <div className="d-flex align-items-center">
                                            <Image
                                                src={selectedCommunity?.user?.profile || `/assets/pregmom-profile.png`}
                                                alt="icon"
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                            <h6 className="fs-14 fw-200 mx-2">
                                                <p id="demo">{selectedCommunity?.title}</p>
                                            </h6>
                                        </div>
                                        <div className='col-12 d-flex mx-5 gap-2 align-items-center'>
                                            <ins><i>{selectedCommunity?.user?.userName}</i></ins>

                                            {/* Date Icon + Date */}
                                            <div className="d-flex align-items-center gap-1">
                                                <Image
                                                    src={`/assets/icons/calendar-icon.svg`}
                                                    alt="calendar"
                                                    width={13}
                                                    height={13}
                                                />
                                                <span style={{ fontSize: "12px" }}>{formatDate(selectedCommunity.createdAt, 'DD-MMM-YYYY')}</span>
                                            </div>

                                            {/* Time Icon + Time */}
                                            <div className="d-flex align-items-center gap-1">
                                                <Image
                                                    src={`/assets/icons/clock-icon.svg`}
                                                    alt="clock"
                                                    width={13}
                                                    height={13}
                                                />
                                                <span style={{ fontSize: "12px" }}>{formatDate(selectedCommunity.createdAt, 'HH:mm')}</span>
                                            </div>
                                        </div>

                                    </div>

                                    <div className='col-2 p-2'>
                                        <div className="d-flex align-items-end ">

                                            <Image
                                                src={`/assets/icons/likes-icon.svg`}
                                                alt="icon"
                                                width={20}
                                                height={20}
                                            />
                                            <div className="ms-1 me-2" style={{ fontSize: "12px" }}>{selectedCommunity?.totalLikes}</div>
                                            <Image
                                                src={`/assets/icons/comments-icon.svg`}
                                                alt="icon"
                                                width={20}
                                                height={20}
                                            />
                                            <div className="ms-1 me-2" style={{ fontSize: "12px" }}>{selectedCommunity?.totalComments}</div>

                                            <Image
                                                src={`/assets/icons/community-report.svg`}
                                                alt="icon"
                                                width={20}
                                                height={20}
                                                // onClick={handleReportClick(selectedCommunity)}
                                            />

                                            <div className="pt-4" style={{ fontSize: "12px" }}>{selectedCommunity.reportsLength}</div>
                                        </div>
                                    </div>
                                    {/* <div className='12'>
                                    <div className='d-flex mx-5 '>
                                        <ins><i>{selectedCommunity.user?.userName}</i> | </ins>
                                        <div className='mx-1'>
                                            <Image
                                                src={`/assets/icons/calender-icon.svg`}
                                                alt="icon"
                                                width={13}
                                                height={13}
                                            />
                                        </div>
                                        {selectedCommunity.user?.date}
                                    </div>
                                </div> */}
                                    <div className="col-11 ms-5 pt-2">
                                        <small>
                                            <p>{selectedCommunity?.description}</p>
                                        </small>
                                    </div>

                                </div>

                                <div className="mt-0 mb-0 fs-14 fw-200 comment-scroll">
                                    <p className='pt-2'><ins>Comments</ins></p>

                                    {selectedComments?.map((comment, index) => (
                                        <div
                                            key={index}
                                            className="comment-item p-2"
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderBottom: '1px solid #eee',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            <div
                                                className="d-flex justify-content-between align-items-start"
                                                style={{ gap: '10px' }}
                                            >
                                                {/* Left: User profile and metadata */}
                                                <div className="d-flex" style={{ flex: 1 }}>
                                                    <Image
                                                        src={comment?.profile || `/assets/pregmom-profile.png`}
                                                        alt="icon"
                                                        width={30}
                                                        height={30}
                                                        className="rounded-full me-2"
                                                    />
                                                    <div>
                                                        <div className="d-flex align-items-center flex-wrap gap-2">
                                                            <p className="mb-0 me-1">
                                                                <i>{comment?.userName}</i> |
                                                            </p>

                                                            {/* Date */}
                                                            <div className="d-flex align-items-center gap-1">
                                                                <Image
                                                                    src="/assets/icons/calendar-icon.svg"
                                                                    alt="calendar"
                                                                    width={13}
                                                                    height={13}
                                                                />
                                                                <span>{formatDate(comment?.date, 'DD-MMM-YYYY')}</span>
                                                            </div>

                                                            {/* Time */}
                                                            <div className="d-flex align-items-center gap-1">
                                                                <Image
                                                                    src="/assets/icons/clock-icon.svg"
                                                                    alt="clock"
                                                                    width={13}
                                                                    height={13}
                                                                />
                                                                <span>{formatDate(comment?.date, 'HH:mm')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Likes */}
                                                <div className="d-flex align-items-center gap-2" style={{ minWidth: '50px' }}>
                                                    <Image
                                                        src={`/assets/icons/likes-icon.svg`}
                                                        alt="like"
                                                        width={20}
                                                        height={20}
                                                    />
                                                    {/* <div className="ms-2">{comment?.totalLikes}</div> */}

                                                    <div className="pt-4" style={{ fontSize: "12px" }}>{comment.totalLikes}</div>

                                                    <Image
                                                        src={`/assets/icons/community-report.svg`}
                                                        alt="icon"
                                                        width={20}
                                                        height={20}
                                                    />
                                                    {/* <div className="ms-1">{comment?.reportsLength}</div> */}

                                                    <div className="pt-4" style={{ fontSize: "12px" }}>{comment.reportsLength}</div>


                                                    <div
                                                        className='cursor-pointer'
                                                        //  style={{
                                                        //     position: 'absolute',
                                                        //     top: '2px',
                                                        //     right: '8px',
                                                        // }}
                                                        onClick={() => handleDeleteComments(selectedCommunity, comment)}
                                                    >
                                                        {/* <Image
                                                            src={'/assets/icons/wrong-icon.svg'}
                                                            alt="icon"
                                                            width={15}
                                                            height={15}
                                                            className="rounded-full"
                                                        /> */}
                                                        <div className="position-relative d-inline-block">
                                                            <Image
                                                                src="/assets/icons/wrong-icon.svg"
                                                                alt="icon"
                                                                width={15}
                                                                height={15}
                                                                className="rounded-full cursor-pointer"
                                                            />
                                                            <span className="tooltip-text">Delete Comment</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="mt-2 ps-5">
                                                <small>{comment?.description}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            )}
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
            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title='Delete'
                message="Are you sure you want to delete?"
                cancelLabel="No"
                confirmLabel="Yes"
            />
        </div>

    )
}



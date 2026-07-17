'use client';
import './page.css';
import Image from "next/image";
import { React, useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { showError, showSuccess } from "@/common/toast/toastService";
import Button from "@/components/shared/button/page";
import Input from "@/components/shared/input/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import FileUpload from "@/components/shared/file/page";
import RadioGroup from "@/components/shared/radio/page";
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { objectToFormData } from "@/common/utils/util";
import { Colors } from '@/common/constants/colorEnum';
export default function AddMusicPlaylists() {
    const [form, setForm] = useState({
        name: '',
        file: '',
        status: 'Active',
        momType: '',
        playlists: [],
    })
    const [playLisForm, setPlayLisForm] = useState({
        name: '',
        file: '',
        duration: '',
    })
    const { id } = useParams();
    const router = useRouter();
    const viewApiRef = useRef();
    const [collectionPreviewUrl, setCollectionPreviewUrl] = useState('');
    const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [playlistFormSubmitted, setPlaylistFormSubmitted] = useState(false);
    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [playlistButtonLoading, setPlaylistButtonLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [playListId, setPlayListId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [viewform, setViewform] = useState({});
    // const [weeks, setWeeks] = useState('');
    // const [months, setMonths] = useState('');
    const [musicId, setMusicId] = useState(null);
    const [viewMusics, setViewMusics] = useState({});
    const [viewPlayList, setViewPlayList] = useState({});
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Music Playlists', href: '/music-playlists' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/music-playlists/${id}` : '/music-playlists/add'
        },
    ];
    const breadcrumbAction = {
        label: 'Back',
        type: 'button',
        size: 'extraSmall',
        backgroundColor: Colors.Primary1,
        isLoading: backLoading,
        onClick: () => handleBack(),
    };
    const momTypeOptions = [
        { label: 'Preg Mom', value: 'pregMom' },
        { label: 'New Mom', value: 'newMom' },
        { label: 'Both', value: 'Both' },
    ];
    useEffect(() => {
        if (id) {
            setMusicId(id);
            checkEdit(id);
        }
    }, [id]);
    // useEffect(() => {
    //     const month = getMonths();
    //     setMonths(month);
    //     const week = getWeeks();
    //     setWeeks(week);
    // }, []);
    useEffect(() => {
        if (isEdit) {
            setIsLoading(true);
            if (viewApiRef.current) return;
            viewApiRef.current = true;
            viewMusic(musicId);
        }
    }, [musicId]);
    const checkEdit = (value) => {
        const isEdit = value !== 'add';
        setIsEdit(isEdit);
    };
    const handleBack = () => {
        setBackLoading(true);
        router.push('/music-playlists')
    }
    const handleWeekSelect = (item) => {
        // setForm((prev) => ({
        //     ...prev,
        //     week: item.label,
        // }));
    };
    const handleMonthSelect = (item) => {
        // setForm((prev) => ({
        //     ...prev,
        //     month: item.label,
        // }));
    };
    const handleMomTypeChange = async (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            momType: value,
            // month: '',
            // week: '',
        }));
        setViewMusics(prev => ({
            ...prev,
            momType: value,
            // month: '',
            // week: '',
        }));
    };

    const handleDelete = (localId, playListId) => {
        setViewform({
            localId,
            musicId,
            playListId
        });
        setIsDeleteDialogOpen(true);
    };
    const handleDeleteCancel = () => {
        setIsDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);

        const payload = {
            params: {
                id: viewform.musicId,
                playListId: viewform.playListId
            }
        };

        const data = await apiRequest(apiRoutes.deletePlaylist, 'POST', payload, router);

        if (data.response) {
            const updatedPlaylists = form.playlists
                .filter((playlist) => playlist.id !== viewform.localId)
                .map((ex, i) => ({ ...ex, id: i + 1 }));

            setForm(prev => ({ ...prev, playlists: updatedPlaylists }));
        }
    };
    const handleEditPlaylist = async (playListId) => {
        try {
            const response = await apiRequest(
                apiRoutes.viewPlaylist,
                'POST',
                {
                    params: {
                        id: musicId || id,
                        playListId,
                    },
                }
            );
            console.log('response', response)
            const playList = response?.data;
            setViewPlayList(response.data)
            setPlayLisForm({
                name: playList.name,
                duration: playList.duration,
                file: playList.file,
            })
            setAudioPreviewUrl(playList.file);
            setIsEditing(true);
            setPlayListId(playList.playListId);
        } catch (error) {
            showError('Failed to load playlist details.');
        }
    };
    const viewMusic = async (musicId) => {
        try {
            const data = await apiRequest(apiRoutes.viewMusic, 'POST', { params: { id: musicId } }, router);
            if (data?.response) {
                const ex = data.data;
                setForm({
                    name: ex?.name || '',
                    momType: ex?.momType || '',
                    // week: ex?.week || '',
                    // month: ex?.month || '',
                    file: ex?.file || '',
                    playlists: ex?.playLists || [],
                    status: ex?.status || '',
                });
                setCollectionPreviewUrl(ex?.file || '');
                setIsLoading(false);
                setViewMusics(ex)
            }
        } catch (error) {
            console.log('error', error);
            setIsLoading(false)
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        console.log('form', form)

        if (!form.name || !form.file) {
            // showError('Invalid Form');
            setButtonLoading(false);
            return;
        }
        // if (form.momType === 'pregMom' && !form.week) {
        //     showError('Please Select Week');
        //     setFormSubmitted(false);
        //     return;
        // }
        // if (form.momType === 'newMom' && !form.month) {
        //     showError('Please Select Month');
        //     setFormSubmitted(false);
        //     return;
        // }
        let updateForm = {
            ...viewMusics,
            ...form,
        };

        const isFileChanged = typeof form.file !== 'string';

        if (isFileChanged) {
            updateForm.fileChanged = true;
        }

        const formData = objectToFormData(!isEdit ? form : updateForm)
        manageMusic(formData)
    };
    const manageMusic = async (formData) => {
        const action = !isEdit ? apiRoutes.addMusic : apiRoutes.updateMusic
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                setFormSubmitted(false);
                setButtonLoading(false);
                setMusicId(data.data.id)
                checkEdit()
                viewMusic(data.data.id)
                const message = isEdit ? 'Music updated successfully!' : 'Music added successfully!';
                showSuccess(message);
            }
        } catch (error) {
            setFormSubmitted(false);
            setButtonLoading(false);
        }
    }
    // const manageMusic = async (formData) => {
    //     const action = !isEdit ? apiRoutes.addMusic : apiRoutes.updateMusic;
    //     try {
    //         const data = await apiRequest(action, 'POST', formData, router);

    //         if (data?.response) {
    //             setFormSubmitted(false);
    //             setButtonLoading(false);
    //             setMusicId(data.data.id);
    //             checkEdit();
    //             viewMusic(data.data.id);
    //             const message = isEdit ? 'Music updated successfully!' : 'Music added successfully!';
    //             showSuccess(message);
    //         } else {
    //             // Handle unsuccessful response
    //             // showError(data?.message || 'Something went wrong while updating the music.');
    //             setFormSubmitted(false);
    //             setButtonLoading(false);
    //         }
    //     } catch (error) {
    //         console.error('API Error:', error);
    //         showError('Something went wrong. Please try again.');
    //         setFormSubmitted(false);
    //         setButtonLoading(false);
    //     }
    // };

    const handleExerciseSubmit = async (e) => {
        e.preventDefault();
        setPlaylistFormSubmitted(true);
        setPlaylistButtonLoading(true);
        const { name, file, duration } = playLisForm;
        if (!name || !file || !duration) {
            // showError('Invalid Form');
            setPlaylistButtonLoading(false);
            return;
        }
        let updateForm;
        if (isEditing) {
            const isMusicChanged = playLisForm.file !== viewPlayList.file;
            updateForm = {
                ...viewPlayList,
                ...playLisForm,
                musicId,
                musicChanged: isMusicChanged,
            };
        } else {
            updateForm = {
                ...playLisForm,
                musicId,
            }
        }
        const formData = objectToFormData(updateForm)
        managePlayList(formData)
    };
    const managePlayList = async (formData) => {
        const action = !isEditing ? apiRoutes.addPlaylist : apiRoutes.updatePlaylist;
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                viewMusic(musicId)
                setPlaylistFormSubmitted(false);
                setPlaylistButtonLoading(false);
                setPlayLisForm({
                    name: "",
                    duration: "",
                    file: "",
                })
                setAudioPreviewUrl('')
                const message = isEdit ? 'Playlist updated successfully!' : 'Playlist added successfully!';
                showSuccess(message);
            } else {
                setPlaylistFormSubmitted(false);
            }
        } catch (error) {
            setPlaylistFormSubmitted(false);
            setPlaylistButtonLoading(false);
        }
    }
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
            ) : (
                <div className="d-flex gap-2">
                    <form className="custom-form gap-2" onSubmit={handleSubmit} style={{ width: '30%' }}>
                        <div className="mt-1">
                            <label className="" style={{ fontSize: '13px', fontWeight: '500' }}>Mom Type</label>
                            <RadioGroup
                                name="momType"
                                options={momTypeOptions}
                                selectedValue={form.momType}
                                onChange={handleMomTypeChange}
                                required
                            />
                        </div>
                        <div className="mt-3">
                            <Input
                                placeholder=""
                                name="name"
                                label="Name"
                                value={form.name}
                                required={true}
                                disabled={!form.momType}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="mt-1">
                            <FileUpload
                                label="Thumbnail"
                                format="image"
                                parentFile={collectionPreviewUrl}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                                onFileSelect={(file) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    setForm({ ...form, file: file });
                                    setCollectionPreviewUrl(previewUrl);
                                }}
                            />
                        </div>
                        {/* <div className="">
                            {form.momType === 'newMom' ? (
                                <div className="mt-2" >
                                    <AutoCompleteInput
                                        label="Month"
                                        options={months}
                                        required={true}
                                        formSubmitted={formSubmitted}
                                        onSelect={handleMonthSelect}
                                        value={form.month}
                                        disabled={!form.momType}
                                    />
                                </div>
                            ) : (
                                <div className="mt-2">
                                    <AutoCompleteInput
                                        label="Week"
                                        options={weeks}
                                        required={true}
                                        formSubmitted={formSubmitted}
                                        onSelect={handleWeekSelect}
                                        value={form.week}
                                        disabled={!form.momType}
                                    />
                                </div>
                            )}
                        </div> */}
                        <div className="d-flex justify-content-end align-items-center mt-2">
                            <Button
                                label={isEdit ? "Update" : "Save"}
                                type="submit"
                                color="#fff"
                                size='small'
                                backgroundColor={Colors.Primary2}
                                isLoading={buttonLoading}
                            />
                        </div>
                    </form>
                    {isEdit ? (<form className="custom-form" style={{ width: '70%' }} onSubmit={handleExerciseSubmit}>
                        <div>
                            <label htmlFor="Exercises" className="form-label mb-3" style={{ minWidth: '100px' }}>
                                {isEditing ? "Edit Playlists " : "Add Playlists"}
                            </label>
                            <div className="d-flex gap-4 mb-4" style={{ width: '100%' }}>
                                <div style={{ width: '30%' }}>
                                    <Input
                                        name="name"
                                        label="Name"
                                        value={playLisForm.name}
                                        formSubmitted={playlistFormSubmitted}
                                        required={true}
                                        disabled={!form.momType}
                                        onChange={(e) => setPlayLisForm({ ...playLisForm, name: e.target.value })}
                                    />
                                </div>
                                <div style={{ width: '40%' }}>
                                    <FileUpload
                                        label="Music(audio)"
                                        format="audio"
                                        parentFile={audioPreviewUrl}
                                        required={true}
                                        formSubmitted={playlistFormSubmitted}
                                        disabled={!form.momType}
                                        onFileSelect={(file) => {
                                            if (file) {
                                                const previewUrl = URL.createObjectURL(file);
                                                setPlayLisForm((prev) => ({ ...prev, file }));
                                                setAudioPreviewUrl(previewUrl);
                                            } else {
                                                setPlayLisForm((prev) => ({ ...prev, file: null }));
                                                setAudioPreviewUrl(null);
                                            }
                                        }}
                                    />
                                </div>
                                <div style={{ width: '30%' }}>
                                    <Input
                                        placeholder=""
                                        name="Duration"
                                        label="Duration In Minutes"
                                        type="number"
                                        value={playLisForm.duration}
                                        required={true}
                                        disabled={!form.momType}
                                        formSubmitted={playlistFormSubmitted}
                                        onChange={(e) => setPlayLisForm({ ...playLisForm, duration: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end align-items-center me-2" style={{ marginTop: '-10px' }}>
                            <Button
                                label={isEditing ? "Update" : "Add"}
                                type="submit"
                                color="#fff"
                                size='small'
                                backgroundColor={Colors.Primary1}
                                isLoading={playlistButtonLoading}
                            />
                        </div>
                        {form.playlists.length > 0 && (
                            <div className="mb-3">
                                <label
                                    htmlFor="Exercises"
                                    className="form-label mb-0 pt-1"
                                    style={{ minWidth: '100px' }}
                                >
                                    Playlists List
                                </label>
                                <div className="mt-2 ms-3" style={{ maxHeight: '180px', overflow: 'auto' }}>
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Playlist Name</th>
                                                <th>Duration</th>
                                                <th>Thumbnail</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.playlists.map((playlist) => (
                                                <tr key={playlist.id}>
                                                    <td>{playlist.name}</td>
                                                    <td>{playlist.duration}</td>
                                                    <td>
                                                        {playlist.file && (
                                                            <audio controls style={{ width: '150px' }}>
                                                                <source
                                                                    src={
                                                                        typeof playlist.file === 'string'
                                                                            ? playlist.file
                                                                            : URL.createObjectURL(playlist.file)
                                                                    }
                                                                />
                                                            </audio>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-light btn-sm ms-2 cursor"
                                                            onClick={() => handleEditPlaylist(playlist.playListId)}
                                                            style={{ border: 'none', background: 'transparent' }}
                                                        >
                                                            <Image
                                                                src="/assets/icons/edit-icon.svg"
                                                                alt="Edit"
                                                                width={15}
                                                                height={15}
                                                            />
                                                        </button>
                                                        <button
                                                            className="btn btn-light btn-sm ms-2 cursor"
                                                            onClick={() => handleDelete(playlist.id, playlist.playListId)}
                                                            style={{ border: 'none', background: 'transparent' }}
                                                        >
                                                            <Image
                                                                src="/assets/icons/delete-icon.svg"
                                                                alt="Delete"
                                                                width={15}
                                                                height={15}
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </form>
                    ) : (<></>)}
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
        </div>
    )
}

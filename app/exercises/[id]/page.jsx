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
import AutoCompleteInput from "@/components/shared/autocomplete/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import FileUpload from "@/components/shared/file/page";
import RadioGroup from "@/components/shared/radio/page";
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { getMonths, getWeeks, objectToFormData } from "@/common/utils/util";
import { Colors } from '@/common/constants/colorEnum';
export default function AddExercises() {
    const [form, setForm] = useState({
        collectionName: '',
        collectionNameTa: '',
        file: '',
        burnCalories: '',
        duration: '',
        status: 'Active',
        momType: '',
        exercises: [],
    })
    const [exerciseForm, setExerciseForm] = useState({
        exerciseName: '',
        exerciseNameTa: '',
        file: '',
        sets: '',
        seconds: '',
    })
    const { id } = useParams();
    const router = useRouter();
    const viewApiRef = useRef();
    const [collectionPreviewUrl, setCollectionPreviewUrl] = useState('');
    const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [exerciseFormSubmitted, setExerciseFormSubmitted] = useState(false);
    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [exerciseButtonLoading, setExerciseButtonLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [exerciseId, setExerciseId] = useState(null);
    const [weeks, setWeeks] = useState('');
    const [months, setMonths] = useState('');
    const [collectionId, setCollectionId] = useState(null);
    const [viewCollections, setViewCollections] = useState({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [viewform, setViewform] = useState({});
    const [viewExercise, setViewExercise] = useState({});
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Exercises', href: '/exercises' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/exercises/${id}` : '/exercises/add'
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
    ];
    useEffect(() => {
        if (id) {
            setCollectionId(id);
            checkEdit(id);
        }
    }, [id]);
    useEffect(() => {
        const month = getMonths();
        setMonths(month);
        const week = getWeeks();
        setWeeks(week);
    }, []);
    useEffect(() => {
        if (isEdit) {
            setIsLoading(true);
            if (viewApiRef.current) return;
            viewApiRef.current = true;
            viewCollection(collectionId);
        }
    }, [collectionId]);
    const checkEdit = (value) => {
        const isEdit = value !== 'add';
        setIsEdit(isEdit);
    };
    const handleBack = () => {
        setBackLoading(true);
        router.push('/exercises')
    }
    const handleWeekSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            week: item.label,
        }));
    };
    const handleMonthSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            month: item.label,
        }));
    };
    const handleMomTypeChange = async (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            momType: value,
            month: '',
            week: '',
        }));
        setViewCollections(prev => ({
            ...prev,
            momType: value,
            month: '',
            week: '',
        }));
    };
    const handleDelete = (localId, exerciseId) => {
        setViewform({
            localId,
            exerciseId,
            collectionId
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
                id: viewform.collectionId,
                exerciseId: viewform.exerciseId
            }
        };
        const data = await apiRequest(apiRoutes.deleteExercises, 'POST', payload, router);

        if (data.response) {
            const updatedExercises = form.exercises
                .filter((exercise) => exercise.id !== viewform.localId)
                .map((ex, i) => ({ ...ex, id: i + 1 }));

            setForm(prev => ({ ...prev, exercises: updatedExercises }));
        }
    };
    const handleEditExercise = async (id, exerciseId) => {
    try {

        const payload = {
            params: {
                id: id,
                exerciseId: exerciseId
            }
        };

        const response = await apiRequest(
            apiRoutes.viewExercise,
            'POST',
            payload,
            router
        );

        console.log("VIEW EXERCISE RESPONSE:", response);

        if (response?.response) {

            const exercise = response.data;

            console.log("ENGLISH:", exercise?.exerciseName);
            console.log("TAMIL:", exercise?.exerciseNameTa);
            console.log(
                "TAMIL TRANSLATION:",
                exercise?.translations?.ta?.exerciseName
            );

            setExerciseForm({
                exerciseName:
                    exercise?.exerciseName || '',

                exerciseNameTa:
                    exercise?.exerciseNameTa ||
                    exercise?.translations?.ta?.exerciseName ||
                    '',

                sets:
                    exercise?.sets || '',

                seconds:
                    exercise?.seconds || '',

                file:
                    exercise?.file || '',
            });

            // your existing edit state code here
        }

    } catch (error) {
        console.error("View exercise error:", error);
    }
};
    // const handleEditExercises = async (exerciseId) => {
    //     try {
    //         const response = await apiRequest(
    //             apiRoutes.viewExercises,
    //             'POST',
    //             {
    //                 params: {
    //                     id: collectionId || id,
    //                     exerciseId,
    //                 },
    //             }
    //         );
    //         console.log('response', response)
    //         const exercise = response?.data;
    //         setViewExercise(response.data)
    //         // setExerciseForm({
    //         //     exerciseName: exercise.exerciseName,
    //         //     sets: exercise.sets,
    //         //     seconds: exercise.seconds,
    //         //     file: exercise.file,
    //         // })
    //         // setExerciseForm({
    //         //     exerciseName: exercise.exerciseName || '',
    //         //     exerciseNameTa: exercise?.translations?.ta?.exerciseName || '',
    //         //     sets: exercise.sets || '',
    //         //     seconds: exercise.seconds || '',
    //         //     file: exercise.file || '',
    //         // })
    //             setExerciseForm({
    //                 exerciseName: exercise?.exerciseName || '',

    //                 exerciseNameTa:
    //                     exercise?.exerciseNameTa ||
    //                     exercise?.translations?.ta?.exerciseName ||
    //                     '',

    //                 sets: exercise?.sets || '',
    //                 seconds: exercise?.seconds || '',
    //                 file: exercise?.file || '',
    //             });
    //         setAudioPreviewUrl(exercise.file);
    //         setIsEditing(true);
    //         setExerciseId(exercise.exerciseId);
    //     } catch (error) {
    //         showError('Failed to load exercise details.');
    //     }
    // };
    const viewCollection = async (collectionId) => {
        try {
            const data = await apiRequest(apiRoutes.viewCollection, 'POST', { params: { id: collectionId } }, router);
            if (data?.response) {
                const ex = data.data;
                setForm({
                    collectionName: ex?.collectionName || '',
                    //collectionNameTa: ex?.translations?.ta?.collectionName || '',
                    collectionNameTa:
                        ex?.collectionNameTa ||
                        ex?.translations?.ta?.collectionName ||
                        '',
                    duration: ex?.duration || '',
                    burnCalories: ex?.burnCalories || '',
                    file: ex?.file || '',
                    momType: ex?.momType || '',
                    week: ex?.week || '',
                    month: ex?.month || '',
                    exercises: ex?.exercises || [],
                    status: ex?.status || '',
                });
                setViewCollections(ex)
                setCollectionPreviewUrl(ex?.file || '');
                setIsLoading(false);
                console.log('viewCollection',)
            }
        } catch (error) {
            console.log('error', error);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        console.log('form', form)
        if (!form.collectionName || !form.collectionNameTa || !form.file || !form.burnCalories || !form.duration) {
            // showError('Invalid Form');
            setButtonLoading(false);
            return;
        }
        if (form.momType === 'pregMom' && !form.week) {
            showError('Please Select Week');
            setFormSubmitted(false);
            return;
        }
        if (form.momType === 'newMom' && !form.month) {
            showError('Please Select Month');
            setFormSubmitted(false);
            return;
        }

        let updateForm;
        if (isEdit) {
            const isFileChanged = form.file !== viewCollections.file;
            updateForm = {
                ...viewCollections,
                ...form,
                fileChanged: isFileChanged,
            };
        }
        const formData = objectToFormData(!isEdit ? form : updateForm)
        formData.set('collectionNameTa', form.collectionNameTa);
        console.log('updateForm', updateForm);
        manageCollection(formData)
    };
    const manageCollection = async (formData) => {
        const action = !isEdit ? apiRoutes.addCollection : apiRoutes.updateCollection
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                setFormSubmitted(false);
                setButtonLoading(false);
                setCollectionId(data.data.id)
                checkEdit()
                viewCollection(data.data.id)
                const message = isEdit ? 'Collection updated successfully!' : 'Collection added successfully!';
                showSuccess(message);
            }
        } catch (error) {
            setFormSubmitted(false);
            setButtonLoading(false);
        }
    }
    const handleExerciseSubmit = async (e) => {
        e.preventDefault();
        setExerciseFormSubmitted(true);
        setExerciseButtonLoading(true);
        console.log('handleExerciseSubmit called', exerciseForm);

        const { exerciseName, file, sets, seconds } = exerciseForm;
        if (!exerciseName || !exerciseForm.exerciseNameTa || !file && !isEditing || !sets || !seconds) {
            // showError('Invalid Form');
            setExerciseButtonLoading(false);
            return;
        }
        let updateForm;
        if (isEditing) {
            const isFileChanged = exerciseForm.file !== viewExercise.file;
            updateForm = {
                ...viewExercise,
                ...exerciseForm,
                collectionId,
                fileChanged: isFileChanged,
            };
        } else {
            updateForm = {
                ...exerciseForm,
                collectionId,
            }
        }
        const formData = objectToFormData(updateForm)
        formData.set('exerciseNameTa', exerciseForm.exerciseNameTa);
        manageExercises(formData)
    };
    const manageExercises = async (formData) => {
        const action = !isEditing ? apiRoutes.addExercises : apiRoutes.updateExercises;
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                viewCollection(collectionId)
                setExerciseFormSubmitted(false);
                setExerciseButtonLoading(false);
                setExerciseForm({
                    exerciseName: "",
                    sets: "",
                    file: "",
                    seconds: "",
                })
                setAudioPreviewUrl('')
                const message = isEdit ? 'Exercise updated successfully!' : 'Exercise added successfully!';
                showSuccess(message);
            } else {
                setExerciseFormSubmitted(false);
            }
        } catch (error) {
            setExerciseFormSubmitted(false);
            setExerciseButtonLoading(false);
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
                                name="collectionName"
                                label="Collection Name"
                                value={form.collectionName}
                                required={true}
                                disabled={!form.momType}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, collectionName: e.target.value })}
                            />
                        </div>
                        <div className="mt-3">
                            <Input
                                placeholder=""
                                name="collectionNameTa"
                                label="Tamil Collection Name"
                                value={form.collectionNameTa}
                                required={true}
                                disabled={!form.momType}
                                formSubmitted={formSubmitted}
                                tamilKeyboard={true}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        collectionNameTa: e.target.value
                                    })
                                }
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
                        <div className="mt-3">
                            <Input
                                placeholder=""
                                name="duration"
                                label="Duration In Mins"
                                type="number"
                                value={form.duration}
                                required={true}
                                disabled={!form.momType}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                            />
                        </div>
                        <div className="mt-3">
                            <Input
                                placeholder=""
                                name="burnCalories"
                                label="Burn Calories (kcal)"
                                type="number"
                                value={form.burnCalories}
                                required={true}
                                disabled={!form.momType}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, burnCalories: e.target.value })}
                            />
                        </div>
                        <div className="">
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
                        </div>
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
                                {isEditing ? "Edit Exercises" : "Add Exercises"}
                            </label>
                            <div className="d-flex gap-2 mb-4" style={{ width: '100%' }}>
                                <div style={{ width: '30%' }}>
                                    <Input
                                        name="name"
                                        label="Name"
                                        value={exerciseForm.exerciseName}
                                        formSubmitted={exerciseFormSubmitted}
                                        required={true}
                                        disabled={!form.momType}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, exerciseName: e.target.value })}
                                    />
                                </div>
                                <Input
                                    name="exerciseNameTa"
                                    label="Tamil Name"
                                    value={exerciseForm.exerciseNameTa}
                                    formSubmitted={exerciseFormSubmitted}
                                    required={true}
                                    disabled={!form.momType}
                                    tamilKeyboard={true}
                                    onChange={(e) =>
                                        setExerciseForm({
                                            ...exerciseForm,
                                            exerciseNameTa: e.target.value
                                        })
                                    }
                                />
                                <div style={{ width: '46%' }}>
                                    <FileUpload
                                        label="Thumbnail(gif)"
                                        format="gif"
                                        parentFile={audioPreviewUrl}
                                        formSubmitted={exerciseFormSubmitted}
                                        required={true}
                                        disabled={!form.momType}
                                        onFileSelect={(file) => {
                                            if (file) {
                                                const previewUrl = URL.createObjectURL(file);
                                                setExerciseForm({ ...exerciseForm, file: file });
                                                setAudioPreviewUrl(previewUrl);
                                            } else {
                                                setExerciseForm({ ...exerciseForm, file: null });
                                                setAudioPreviewUrl(null);
                                            }
                                        }}
                                    />
                                </div>
                                <div style={{ width: '12%' }}>
                                    <Input
                                        placeholder=""
                                        name="Sets"
                                        label="Sets"
                                        type="number"
                                        value={exerciseForm.sets}
                                        required={true}
                                        disabled={!form.momType}
                                        formSubmitted={exerciseFormSubmitted}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })}
                                    />
                                </div>
                                <div style={{ width: '12%' }}>
                                    <Input
                                        placeholder=""
                                        name="Seconds"
                                        label="Seconds"
                                        type="number"
                                        value={exerciseForm.seconds}
                                        required={true}
                                        disabled={!form.momType}
                                        formSubmitted={exerciseFormSubmitted}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, seconds: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end align-items-center me-2 mt-5">
                            <Button
                                label={isEditing ? 'Update' : 'Add'}
                                type="submit"
                                color="#fff"
                                size='small'
                                backgroundColor={Colors.Primary1}
                                isLoading={exerciseButtonLoading}
                            />
                        </div>
                        {form.exercises.length > 0 && (
                            <div className="mb-3">
                                <label
                                    htmlFor="Exercises"
                                    className="form-label mb-0 pt-1"
                                    style={{ minWidth: '100px' }}
                                >
                                    Exercises List
                                </label>
                                <div className="mt-2 ms-3" style={{ maxHeight: '180px', overflow: 'auto' }}>
                                    <table className="table table-bordered">
                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                                            <tr>
                                                <th>Thumbnail</th>
                                                <th>Exercise Name</th>
                                                <th>Sets</th>
                                                <th>Seconds</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.exercises.map((exercise) => (
                                                <tr key={exercise.id}>
                                                    <td>
                                                        {exercise.file && (
                                                            <img
                                                                src={typeof exercise.file === 'string' ? exercise.file : URL.createObjectURL(exercise.file)}
                                                                alt="Thumbnail"
                                                                width={50}
                                                                height={50}
                                                            />
                                                        )}
                                                    </td>
                                                    <td>{exercise.exerciseName}</td>
                                                    <td>{exercise.sets}</td>
                                                    <td>{exercise.seconds}</td>

                                                    <td>
                                                        <button
                                                            className="btn btn-light btn-sm ms-2 cursor"
                                                            onClick={() => handleEditExercises(exercise.exerciseId)}
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
                                                            onClick={() => handleDelete(exercise.id, exercise.exerciseId)}
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

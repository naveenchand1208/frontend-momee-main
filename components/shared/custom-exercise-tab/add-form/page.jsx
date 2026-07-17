'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import Button from '../../button/page';
import DatePicker from '../../date/page';
import TimePicker from '@/components/shared/time/page';
import Input from '../../input/page';
import AutoCompleteInput from '../../autocomplete/page';
import { showError, showSuccess } from '@/common/toast/toastService';
import ConfirmationDialog from '../../confirmation-dialog/confirmation-dialog';
import { Colors } from '@/common/constants/colorEnum';
import CustomDialog from '../../dialog/dialog';
import RadioGroup from '../../radio/page';
import FileUpload from '../../file/page';
import { objectToFormData } from '@/common/utils/util';
export default function AddFoodForm({ onClose, onSuccess, isEdit = false, existingType = null }) {
    const { id } = useParams();
    const router = useRouter();
    const formRef = useRef(null);
    const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [form, setForm] = useState({
        date: '',
        time: '',
        sets: '',
        reps: '',
        userId: '',
        exerciseId: '',
    });

    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
    ];
    useEffect(() => {
        if (id && id !== 'add') {
            setForm((prev) => ({ ...prev, userId: id }));
            fetchUserDetails(id);
        }
    }, [id]);

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        if (isEdit && existingType) {
            setForm({
                date: existingType.date || '',
                time: existingType.time || '',
                userId: existingType.userId || id || '',
                exerciseId: existingType.exerciseId || '',
                sets: existingType?.sets || '',
                reps: existingType?.reps || '',
            });
        }
    }, [isEdit, existingType]);

    const fetchUserDetails = async (userId) => {
        try {
            const res = await apiRequest(apiRoutes.userList, 'POST', { params: { id: userId } }, router);
            if (res?.response) {
                setUserData(res.data?.docs?.[0]);
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    const fetchExercises = async () => {
        try {
            const payload = {
                params: {
                    status: 'Active',
                    pagination: 'true',
                    page: '1',
                    limit: '50',
                },
            };
            const res = await apiRequest(apiRoutes.getMasterExercise, 'POST', payload, router);
            if (res?.response) {
                const mapped = res.data.docs.map((item) => ({
                    ...item,
                    label: item.name,
                }));
                setExercises(mapped);
            }
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
    };

    const handleExerciseSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            exerciseId: item.id,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);

        const requiredFields = ['date', 'time', 'userId', 'exerciseId'];
        const hasEmptyFields = requiredFields.some((key) => !form[key]);
        if (hasEmptyFields) {
            setButtonLoading(false);
            return;
        }

        let payload;

        if (isEdit) {
            payload = {
                params: {
                    id: existingType?.id,
                    userId: form.userId,
                    date: form.date,
                    time: form.time,
                    sets: form.sets,
                    reps: form.reps,
                    exerciseId: form.exerciseId,
                },
            };
        } else {
            payload = {
                params: {
                    userId: form.userId,
                    date: form.date,
                    time: form.time,
                    exerciseId: form.exerciseId,
                    sets: form.sets,
                    reps: form.reps,
                },
            };
        }

        const action = isEdit ? apiRoutes.updateCustomExercise : apiRoutes.addCustomExercise;

        try {
            const res = await apiRequest(action, 'POST', payload, router);
            if (res?.response) {
                showSuccess(isEdit ? 'Exercise updated successfully!' : 'Exercise added successfully!');
                setForm({
                    date: '',
                    time: '',
                    exerciseId: '',
                    sets: '',
                    reps: '',
                });
                onClose?.();
                onSuccess?.();
            }
        } catch (error) {
            showError('Failed to submit');
            console.error('API error:', error);
        } finally {
            setButtonLoading(false);
        }
    };

    const handleDelete = () => setIsDeleteDialogOpen(true);
    const handleDeleteCancel = () => setIsDeleteDialogOpen(false);

    const handleDeleteConfirm = async () => {
        setIsDeleteDialogOpen(false);
        if (!existingType?.id) return;

        const payload = { params: { id: existingType.id } };
        try {
            const res = await apiRequest(apiRoutes.deleteCustomExercise, 'POST', payload, router);
            if (res?.response) {
                showSuccess('Exercise deleted successfully');
                onClose?.();
                onSuccess?.();
            }
        } catch (err) {
            showError('Failed to delete');
            console.error('Delete error:', err);
        }
    };
    const handleAddExercise = async (newExercise) => {
        try {
            const formData = objectToFormData(newExercise);

            const res = await apiRequest(apiRoutes.addMasterExercise, 'POST', formData, router);

            if (res?.response) {
                showSuccess('Workout added successfully!');
                await fetchExercises();

                // Optional: Auto-select the new exercise
                const newId = res.data?.id;
                if (newId) {
                    setForm((prev) => ({
                        ...prev,
                        exerciseId: newId,
                    }));
                }
            } else {
                showError('Failed to add exercise.');
            }
        } catch (err) {
            console.error('Add exercise error:', err);
            showError('Error adding exercise');
        }
    };
    const AddExerciseForm = ({ onSubmit, onClose }) => {
        const [form, setForm] = useState({
            name: '',
            file: null,
            status: 'Active',
        });
        const [formSubmitted, setFormSubmitted] = useState(false);
        const [buttonLoading, setButtonLoading] = useState(false);
        const [previewUrl, setPreviewUrl] = useState('');

        const handleSubmit = async () => {
            setFormSubmitted(true);
            if (!form.name.trim() || !form.file || !form.status) return;

            setButtonLoading(true);
            await onSubmit(form);
            setButtonLoading(false);
            onClose();
        };

        return (
            <div className="custom-form" style={{ width: '100%' }}>
                <div className="mb-3">
                    <Input
                        name="name"
                        label="Workout Name"
                        value={form.name}
                        required
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <FileUpload
                        label="Thumbnail"
                        format="image"
                        required
                        parentFile={previewUrl}
                        formSubmitted={formSubmitted}
                        onFileSelect={(file) => {
                            setForm((prev) => ({ ...prev, file }));
                            setPreviewUrl(URL.createObjectURL(file));
                        }}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '0.875rem' }}>Status</label>
                    <RadioGroup
                        name="status"
                        options={statusOptions}
                        selectedValue={form.status}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, status: e.target.value }))
                        }
                        required
                    />
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Save"
                        type="button"
                        size="small"
                        backgroundColor={Colors.Primary2}
                        color="#fff"
                        isLoading={buttonLoading}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        );
    };
    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-2">
            <div className="flex flex-row gap-4 mt-3">
                <div className="w-[300px]">
                    <DatePicker
                        label="Select Date"
                        name="date"
                        value={form.date}
                        onChange={(val) => setForm((prev) => ({ ...prev, date: val }))}
                        required
                    />
                </div>
                <div className="w-[300px]">
                    <TimePicker
                        label="Select Time"
                        name="time"
                        value={form.time}
                        onChange={(val) => setForm((prev) => ({ ...prev, time: val }))}
                        required
                        size="medium"
                    />
                </div>
            </div>
            <div className="flex items-end gap-2 w-full mt-3">
                <div className="flex-1">
                    <AutoCompleteInput
                        label="Exercises"
                        options={exercises}
                        value={exercises.find((e) => e.id === form.exerciseId)?.label || ''}
                        required
                        formSubmitted={formSubmitted}
                        onSelect={handleExerciseSelect}
                    />
                </div>
                <span
                    className="cursor-pointer mb-[6px]"
                    onClick={() => setWorkoutDialogOpen(true)}
                >
                    <img
                        src="/assets/icons/blue-plus-icon.svg"
                        style={{ width: '24px' }}
                        alt="Add"
                    />
                </span>

            </div>
            <div className="mt-3">
                <Input
                    placeholder=""
                    name="sets"
                    label="Sets"
                    type="number"
                    value={form.sets}
                    required={true}
                    formSubmitted={formSubmitted}
                    onChange={(e) => setForm({ ...form, sets: e.target.value })}
                />
            </div>
            <div className="mt-3">
                <Input
                    placeholder=""
                    name="reps"
                    label="Reps"
                    type="number"
                    value={form.reps}
                    required={true}
                    formSubmitted={formSubmitted}
                    onChange={(e) => setForm({ ...form, reps: e.target.value })}
                />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                {isEdit && (
                    <Button
                        label="Delete"
                        type="button"
                        size="small"
                        backgroundColor={Colors.Primary1}
                        color="#fff"
                        isLoading={buttonLoading}
                        onClick={handleDelete}
                    />
                )}
                <Button
                    label={isEdit ? 'Update' : 'Add'}
                    type="submit"
                    size="small"
                    isLoading={buttonLoading}
                />
            </div>

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete"
                message="Are you sure you want to delete?"
                cancelLabel="No"
                confirmLabel="Yes"
            />
            <CustomDialog
                open={workoutDialogOpen}
                onClose={() => setWorkoutDialogOpen(false)}
                title="Add Workouts"
                titleColor="#000000"
                backgroundColor="#fafcfc"
                maxWidth="xs"
                content={
                    <AddExerciseForm
                        onSubmit={handleAddExercise}
                        onClose={() => setWorkoutDialogOpen(false)}
                    />
                }
            />

        </form>
    );
}

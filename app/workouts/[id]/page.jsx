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
import { objectToFormData } from "@/common/utils/util";
import { Colors } from '@/common/constants/colorEnum';
import RadioGroup from '@/components/shared/radio/page';
export default function AddWorkouts() {
    // const initialFormState = {
    //     name: '',
    //     file: '',
    //     status: 'Active',
    // }
    const initialFormState = {
        name: '',
        nameTa: '',
        file: '',
        status: 'Active',
    }
    const { id } = useParams();
    const router = useRouter();
    const viewApiRef = useRef();
    const [form, setForm] = useState(initialFormState);
    const [workoutPreviewUrl, setWorkoutPreviewUrl] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [collectionId, setCollectionId] = useState(null);
    const [viewCollections, setViewCollections] = useState({});
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Workouts', href: '/workouts' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/workouts/${id}` : '/workouts/add'
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
    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
    ];
    useEffect(() => {
        if (id) {
            setCollectionId(id);
            checkEdit(id);
        }
    }, [id]);
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
        router.push('/workouts')
    }
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setForm((prevForm) => ({
            ...prevForm,
            status: value,
        }));
    };
    const viewCollection = async (collectionId) => {
        try {
            const data = await apiRequest(apiRoutes.viewMasterExercise, 'POST', { params: { id: collectionId } }, router);
            if (data?.response) {
                const work = data.data;
                // setForm({
                //     name: work?.name || '',
                //     file: work?.file || '',
                //     status: work?.status || '',
                // });
                setForm({
                    name: work?.name || '',
                    nameTa: work?.translations?.ta?.name || '',
                    file: work?.file || '',
                    status: work?.status || '',
                });
                setViewCollections(work)
                setWorkoutPreviewUrl(work?.file || '');
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


    console.log(
        'WORKOUT FORM:',
        form
    );


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!form.name) {

        showError(
            'Please enter English Name'
        );

        setButtonLoading(false);

        return;
    }


    if (!form.nameTa) {

        showError(
            'Please enter Tamil Name'
        );

        setButtonLoading(false);

        return;
    }


    if (!form.file) {

        showError(
            'Please select Thumbnail'
        );

        setButtonLoading(false);

        return;
    }


    let updateForm;


    // ==========================================
    // UPDATE
    // ==========================================

    if (isEdit) {

        const isFileChanged =
            form.file !== viewCollections.file;


        updateForm = {

            ...viewCollections,

            ...form,

            fileChanged:
                isFileChanged

        };

    }

    // ==========================================
    // ADD
    // ==========================================

    else {

        updateForm = {
            ...form
        };

    }


    const formData = objectToFormData(
        !isEdit
            ? form
            : updateForm
    );

    formData.set(
        'name',
        form.name
    );

    formData.set(
        'nameTa',
        form.nameTa
    );
    formData.set(
        'status',
        form.status
    );
    if (isEdit) {
        formData.set(
            'id',
            id
        );
    }
    for (
        const [key, value]
        of formData.entries()
    ){
        console.log(
            key,
            value
        );

    }


    manageCollection(formData);
};

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setFormSubmitted(true);
    //     setButtonLoading(true);
    //     console.log('form', form)
    //     if (!form.name || !form.nameTa || !form.file) {
    //         // showError('Invalid Form');
    //         setButtonLoading(false);
    //         return;
    //     }
    //     let updateForm;
    //     if (isEdit) {
    //         const isFileChanged = form.file !== viewCollections.file;
    //         updateForm = {
    //             ...viewCollections,
    //             ...form,
    //             fileChanged: isFileChanged,
    //         };
    //     }
    //     // const formData = objectToFormData(!isEdit ? form : updateForm)
    //     // console.log('updateForm', updateForm);
    //     // manageCollection(formData)
    //     const formData = objectToFormData(
    //         !isEdit ? form : updateForm
    //     );

    //     formData.set(
    //         'name',
    //         form.name
    //     );

    //     formData.set(
    //         'nameTa',
    //         form.nameTa
    //     );

    //     formData.set(
    //         'status',
    //         form.status
    //     );

    //     console.log(
    //         '========== WORKOUT FORM DATA =========='
    //     );

    //     for (
    //         const [key, value]
    //         of formData.entries()
    //     ) {
    //         console.log(key, value);
    //     }


    //     manageCollection(formData);
    // };

    const manageCollection = async (formData) => {
        const action = !isEdit ? apiRoutes.addMasterExercise : apiRoutes.updateMasterExercise
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                const message = isEdit ? 'Workout updated successfully!' : 'Workout added successfully!';
                showSuccess(message);
                if (!isEdit) {
                    setForm(initialFormState);
                    setWorkoutPreviewUrl('');
                }
                setFormSubmitted(false);
                setButtonLoading(false);
                router.push('/workouts');
            }

        } catch (error) {
            setFormSubmitted(false);
            setButtonLoading(false);
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

                        <div className="mt-3">
                            <Input
                                placeholder=""
                                name="name"
                                label="Name"
                                value={form.name}
                                required={true}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="mt-3">
                            <Input
                                placeholder=""
                                name="nameTa"
                                label="Name (Tamil)"
                                value={form.nameTa}
                                required={true}
                                formSubmitted={formSubmitted}
                                tamilKeyboard={true}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        nameTa: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="mt-1">
                            <FileUpload
                                label="Thumbnail"
                                format="image"
                                parentFile={workoutPreviewUrl}
                                required={true}
                                formSubmitted={formSubmitted}
                                onFileSelect={(file) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    setForm({ ...form, file: file });
                                    setWorkoutPreviewUrl(previewUrl);
                                }}
                            />
                        </div>
                        <div className="col-md-12 mb-2">
                            <label className="form-label" style={{ fontSize: '0.875rem' }}>Status</label>
                            <RadioGroup
                                name="status"
                                options={statusOptions}
                                selectedValue={form.status}
                                onChange={handleStatusChange}
                                required
                            />
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
                </div>
            )}
        </div>
    )
}

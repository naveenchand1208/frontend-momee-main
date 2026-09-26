'use client';
import './page.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from "react";
import Input from "@/components/shared/input/page";
import Button from "@/components/shared/button/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import FileUpload from "@/components/shared/file/page";
import { useRouter, useParams } from "next/navigation";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { showError, showSuccess } from "@/common/toast/toastService";
import { objectToFormData } from "@/common/utils/util";
import { Colors } from '@/common/constants/colorEnum';
import GoogleMapPicker from '@/components/shared/google-location/page';
import MultiSelectDropdown from '@/components/shared/multi-select/page';
import CustomDialog from '@/components/shared/dialog/dialog';
import { CircularProgress } from '@mui/material';
import Textarea from '@/components/shared/textarea/page';
export default function AddHospital() {
    const [form, setForm] = useState({
        // English fields
        name: '',
        address: '',

        // Tamil fields
        nameTa: '',
        addressTa: '',

        // Existing fields
        status: 'Active',
        file: '',
        mobile: '',
        email: '',
        latitude: '',
        longitude: '',
        typeIds: [],
        departmentIds: [],
        facilities: [],
        Doctors: [],
        Types: [],
        Departments: [],
    });
    const { id } = useParams();
    const router = useRouter();
    const viewApiRef = useRef();
    const isEdit = id !== 'add';
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [departmentPreviewUrl, setDepartmentPreviewUrl] = useState('');
    const [viewHospital, setViewHospital] = useState({});
    const [backLoading, setBackLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [typeOptions, setTypeOptions] = useState([]);
    const [deptOptions, setDeptOptions] = useState([]);
    const [facilityInput, setFacilityInput] = useState('');
    const [facilityInputTa, setFacilityInputTa] = useState('');
    const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
    const [editingDoctorIndex, setEditingDoctorIndex] = useState(null);
    const [editingTypeIndex, setEditingTypeIndex] = useState(null);
    const [editingDepartmentIndex, setEditingDepartmentIndex] = useState(null);
    const breadcrumbItems = [
        { label: 'Hospitals', href: '/hospitals' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/hospitals/${id}` : '/hospitals/add'
        },
    ];
    const breadcrumbAction = {
        label: 'Back',
        type: 'button',
        size: 'extraSmall',
        backgroundColor: Colors.Primary1,
        isLoading: backLoading,
        onClick: () => handleBackButton(),
    };
    useEffect(() => {
        if (isEdit && !viewApiRef.current) {
            viewApiRef.current = true;
            viewHospitals(id);
        }
    }, [id]);
    useEffect(() => {
        const fetchTypeOptions = async () => {
            try {
                const payload = { params: { pagination: 'false', status: "Active" } };
                const data = await apiRequest(apiRoutes.getHospitalTypeList, 'POST', payload, router);
                if (data?.response) {
                    const types = data.data.docs.map((item) => ({
                        label: item.name,
                        value: item.id,
                    }));
                    setTypeOptions(types);
                    console.log('Types:', types);
                }
            } catch (error) {
                console.error('Failed to fetch type options:', error);
            }
        };

        const fetchDeptOptions = async () => {
            try {
                const payload = { params: { pagination: 'false', staus: "Active" } };
                const data = await apiRequest(apiRoutes.getHospitalDeptList, 'POST', payload, router);
                if (data?.response) {
                    const depts = data.data.docs.map((item) => ({
                        label: item.title,
                        value: item.id,
                    }));
                    setDeptOptions(depts);
                    console.log('Departments:', depts);
                }
            } catch (error) {
                console.error('Failed to fetch department options:', error);
            }
        };

        fetchTypeOptions();
        fetchDeptOptions();
    }, []);
    const handleAddFacility = () => {
        if (!facilityInput.trim() || !facilityInputTa.trim()) {
            showError('Please enter both English and Tamil facility descriptions');
            return;
        }

        const newFacility = {
            id: form.facilities.length > 0 ? form.facilities[form.facilities.length - 1].id + 1 : 1,
            decription: facilityInput.trim(),
            decriptionTa: facilityInputTa.trim(),
        };

        setForm((prev) => ({
            ...prev,
            facilities: [...prev.facilities, newFacility],
        }));

        setFacilityInput('');
        setFacilityInputTa('');
    }
    const handleDeleteFacility = (idToDelete) => {
        const updatedFacilities = form.facilities
            .filter((facility) => facility.id !== idToDelete)
            .map((f, i) => ({
                ...f,
                id: i + 1,
            }));
        setForm((prev) => ({
            ...prev,
            facilities: updatedFacilities,
        }));
    };
    const AddDoctorForm = ({ deptOptions, onSubmit, onClose, existingDoctor = null }) => {
        const [form, setForm] = useState(existingDoctor || {
            name: '',
            nameTa: '',
            departmentIds: [],
            bio: '',
            bioTa: '',
        });
        const [formSubmitted, setFormSubmitted] = useState(false);
        useEffect(() => {
            if (existingDoctor) setForm(existingDoctor);
        }, [existingDoctor]);
        const handleAddOrEdit = () => {
            setFormSubmitted(true);
            if (!form.name.trim()) return;
            if (!form.nameTa.trim()) return;
            if (form.departmentIds.length === 0) return;
            if (!form.bio.trim()) return;
            if (!form.bioTa.trim()) return;
            onSubmit(form);
            onClose();
        };
        return (
            <div className="custom-form" style={{ width: '100%' }}>
                <div className="mb-2">
                    <Input
                        label="Doctor Name"
                        name="name"
                        value={form.name}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                </div>
                <div className="mb-2">
                    <Input
                        label="Tamil Doctor Name"
                        placeholder="தமிழில் உள்ளிடவும்"
                        name="nameTa"
                        tamilKeyboard={true}
                        value={form.nameTa}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, nameTa: e.target.value }))}
                    />
                </div>
                <div className="mb-2">
                    <MultiSelectDropdown
                        label="Departments"
                        options={deptOptions}
                        value={form.departmentIds}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(vals) =>
                            setForm((prev) => ({ ...prev, departmentIds: vals.map(v => v.value) }))
                        }
                    />
                </div>
                <div className="mb-2">
                    <Textarea
                        label="Bio"
                        name="bio"
                        value={form.bio}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                    />
                </div>
                <div className="mb-2">
                    <Textarea
                        label="Tamil Bio"
                        placeholder="தமிழில் உள்ளிடவும்"
                        name="bioTa"
                        value={form.bioTa}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, bioTa: e.target.value }))}
                    />
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Cancel"
                        type="button"
                        size="small"
                        backgroundColor={Colors.Secondary2}
                        onClick={onClose}
                    />
                    <Button
                        label={existingDoctor ? "Update" : "Add"}
                        type="button"
                        size="small"
                        backgroundColor={Colors.Primary1}
                        onClick={handleAddOrEdit}
                    />
                </div>
            </div>
        );
    };
    const AddTypeForm = ({ onSubmit, onClose, existingType = null }) => {
        const [form, setForm] = useState(existingType || {
            name: '',
            nameTa: '',
        });
        const [formSubmitted, setFormSubmitted] = useState(false);
        useEffect(() => {
            if (existingType) setForm(existingType);
        }, [existingType]);
        const handleAddOrEdit = () => {
            setFormSubmitted(true);
            if (!form.name.trim()) return;
            if (!form.nameTa.trim()) return;
            onSubmit(form);
            onClose();
        };
        return (
            <div className="custom-form" style={{ width: '100%' }}>
                <div className="mb-2">
                    <Input
                        label="Type Name"
                        name="name"
                        value={form.name}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                </div>
                <div className="mb-2">
                    <Input
                        label="Tamil Type Name"
                        placeholder="தமிழில் உள்ளிடவும்"
                        name="nameTa"
                        value={form.nameTa}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, nameTa: e.target.value }))}
                    />
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Cancel"
                        type="button"
                        size="small"
                        backgroundColor={Colors.Secondary2}
                        onClick={onClose}
                    />
                    <Button
                        label={existingType ? "Update" : "Add"}
                        type="button"
                        size="small"
                        backgroundColor={Colors.Primary1}
                        onClick={handleAddOrEdit}
                    />
                </div>
            </div>
        );
    };
    const AddDepartmentForm = ({ onSubmit, onClose, existingDepartment = null }) => {
        const [form, setForm] = useState({
            title: '',
            titleTa: '',
            file: '',
            subTitle: '',
            subTitleTa: '',
        });
        const [previewUrl, setPreviewUrl] = useState(null);
        const [formSubmitted, setFormSubmitted] = useState(false);
        useEffect(() => {
            if (existingDepartment) {
                setForm(existingDepartment);
                setPreviewUrl(null);
            } else {
                resetForm();
            }
        }, [existingDepartment]);
        const resetForm = () => {
            setForm({ title: '', titleTa: '', file: '', subTitle: '', subTitleTa: '' });
            setPreviewUrl(null);
            setFormSubmitted(false);
        };
        const handleAddOrEdit = () => {
            setFormSubmitted(true);
            if (!form.title.trim()) return;
            if (!form.titleTa.trim()) return;
            if (!form.subTitle.trim()) return;
            if (!form.subTitleTa.trim()) return;
            onSubmit(form);
            resetForm();
            onClose();
        };
        return (
            <div className="custom-form" style={{ width: '100%' }}>
                <div className="mb-2">
                    <Input
                        label="Department Name"
                        name="title"
                        value={form.title}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                </div>
                <div className="mb-2">
                    <Input
                        label="Tamil Department Name"
                        placeholder="தமிழில் உள்ளிடவும்"
                        name="titleTa"
                        value={form.titleTa}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, titleTa: e.target.value }))}
                    />
                </div>
                <div className="mb-2">
                    <FileUpload
                        label="Thumbnail"
                        format="image"
                        parentFile={previewUrl}
                        required={true}
                        formSubmitted={formSubmitted}
                        onFileSelect={(file) => {
                            const url = URL.createObjectURL(file);
                            setForm({ ...form, file });
                            setPreviewUrl(url);
                        }}
                    />
                </div>
                <div className="mb-2">
                    <Textarea
                        label="Subtitle"
                        name="subTitle"
                        value={form.subTitle}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, subTitle: e.target.value }))}
                    />
                </div>
                <div className="mb-2">
                    <Textarea
                        label="Tamil Subtitle"
                        placeholder="தமிழில் உள்ளிடவும்"
                        name="subTitleTa"
                        value={form.subTitleTa}
                        required={true}
                        formSubmitted={formSubmitted}
                        onChange={(e) => setForm((prev) => ({ ...prev, subTitleTa: e.target.value }))}
                    />
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Cancel"
                        type="button"
                        size="small"
                        backgroundColor={Colors.Secondary2}
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                    />
                    <Button
                        label={existingDepartment ? "Update" : "Add"}
                        type="button"
                        size="small"
                        backgroundColor={Colors.Primary1}
                        onClick={handleAddOrEdit}
                    />
                </div>
            </div>
        );
    };
    const viewHospitals = async (id) => {
        try {
            setIsLoading(true)
            const payload = { params: { id } }
            const data = await apiRequest(apiRoutes.viewHospitals, 'POST', payload, router);
            if (data?.response) {
                const hospital = data?.data;
                setForm({
                    ...form,
                    name: hospital?.name || '',
                    //nameTa: hospital?.translations?.ta?.name || '',
                    nameTa:
                        hospital?.nameTa ||
                        hospital?.translations?.ta?.name ||
                        '',
                    status: hospital?.status || '',
                    file: hospital?.file || '',
                    address: hospital?.address || '',
                    //addressTa: hospital?.translations?.ta?.address || '',
                    addressTa:
                        hospital?.addressTa ||
                        hospital?.translations?.ta?.address ||
                        '',
                    mobile: hospital?.mobile || '',
                    email: hospital?.email || '',
                    latitude: hospital?.latitude || '',
                    longitude: hospital?.longitude,
                    typeIds: hospital?.typeIds || [],
                    departmentIds: hospital?.departmentIds || [],
                    facilities: hospital?.facilities || [],
                    Doctors: hospital?.Doctors || [],
                });
                setViewHospital(hospital)
                setPreviewUrl(hospital.file)
                setIsLoading(false)
            }
        } catch (error) {
            console.log('error', error)
        }
    }
    const handleBackButton = () => {
        setBackLoading(true);
        router.push('/hospitals');
    }

    const handleSubmit = (e) => {
    e.preventDefault();

    console.log("========== SAVE CLICKED ==========");
    console.log("Form:", form);

    setFormSubmitted(true);
    setIsButtonLoading(true);

    // English Name
    if (!form.name || !form.name.trim()) {
        showError('Please enter Hospital Name');
        setIsButtonLoading(false);
        return;
    }

    // Tamil Name
    if (!form.nameTa || !form.nameTa.trim()) {
        showError('Please enter Tamil Hospital Name');
        setIsButtonLoading(false);
        return;
    }

    // Thumbnail
    if (!form.file) {
        showError('Please select Thumbnail');
        setIsButtonLoading(false);
        return;
    }

    // Address
    if (!form.address || !form.address.trim()) {
        showError('Please select Hospital Address');
        setIsButtonLoading(false);
        return;
    }

    // Tamil Address
    if (!form.addressTa || !form.addressTa.trim()) {
        showError('Please enter Tamil Address');
        setIsButtonLoading(false);
        return;
    }

    // Mobile
    if (!form.mobile || !form.mobile.trim()) {
        showError('Please enter Mobile Number');
        setIsButtonLoading(false);
        return;
    }

    // Email
    if (!form.email || !form.email.trim()) {
        showError('Please enter Email');
        setIsButtonLoading(false);
        return;
    }

    // Facility
    if (!form.facilities || form.facilities.length === 0) {
        showError('Please add at least one facility');
        setIsButtonLoading(false);
        return;
    }

    let updateForm;

    if (isEdit) {

        const isFileChanged =
            form.file !== viewHospital.file;

        updateForm = {
            ...viewHospital,
            ...form,
            id: id,
            fileChanged: isFileChanged,
            typeIds: form.typeIds,
            departmentIds: form.departmentIds
        };

    } else {

        updateForm = {
            ...form
        };
    }

    const submitForm = {
        ...updateForm,

        translations: {
            en: {
                name: form.name,
                address: form.address
            },

            ta: {
                name: form.nameTa,
                address: form.addressTa
            }
        }
    };

    console.log("========== SUBMIT FORM ==========");
    console.log(submitForm);

    const formData = objectToFormData(submitForm);

    console.log("========== FORMDATA ==========");

    for (const [key, value] of formData.entries()) {
        console.log(key, value);
    }

    manageArticles(formData);
};

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     console.log("========== SAVE ==========");
    //     console.log("English:", form.name);
    //     console.log("Tamil:", form.nameTa);
    //     console.log("Full form:", form);
    //     setFormSubmitted(true);
    //     setIsButtonLoading(true);
    //     if (!form.name || !form.file || !form.address || !form.mobile) {
    //         // showError('Invalid Form');
    //         setIsButtonLoading(false);
    //         return;
    //     }
    //     if (form.facilities.length === 0) {
    //         showError('Please add at least one facility');
    //         setFormSubmitted(false);
    //         setIsButtonLoading(false);
    //         return;
    //     }
    //     // if (form.Doctors.length === 0) {
    //     //     showError('Please add at least one doctor');
    //     //     setFormSubmitted(false);
    //     //     setIsButtonLoading(false);
    //     //     return;
    //     // }
    //     let updateForm;
    //     if (isEdit) {
    //         const isFileChanged = form.file !== viewHospital.file;
    //         updateForm = {
    //             ...viewHospital,
    //             ...form,
    //             id,
    //             fileChanged: isFileChanged,
    //             typeIds: form.typeIds,
    //             departmentIds: form.departmentIds,
    //         };
    //     }
    //     //const formData = objectToFormData(!isEdit ? form : updateForm)
    //     const submitForm = !isEdit
    //     ? {
    //         ...form,
    //         translations: {
    //             en: {
    //                 name: form.name,
    //                 address: form.address,
    //             },
    //             ta: {
    //                 name: form.nameTa,
    //                 address: form.addressTa,
    //             }
    //         }
    //     }
    //     : {
    //         ...updateForm,
    //         translations: {
    //             en: {
    //                 name: form.name,
    //                 address: form.address,
    //             },
    //             ta: {
    //                 name: form.nameTa,
    //                 address: form.addressTa,
    //             }
    //         }
    //     };

    // const formData = objectToFormData(submitForm);
    //         manageArticles(formData)
    // };

    // const manageArticles = async (formData) => {
    //     const action = !isEdit ? apiRoutes.addHospital : apiRoutes.updateHospital
    //     try {
    //         const data = await apiRequest(action, 'POST', formData, router);
    //         if (data?.response) {
    //             const message = isEdit ? 'Hospital updated successfully!' : 'Hospital added successfully!';
    //             showSuccess(message);
    //             router.push('/hospitals')
    //         }
    //         setFormSubmitted(false);
    //         setIsButtonLoading(false);
    //     } catch (error) {
    //         setFormSubmitted(false);
    //         setIsButtonLoading(false);
    //     }
    // }
    const manageArticles = async (formData) => {

    const action = !isEdit
        ? apiRoutes.addHospital
        : apiRoutes.updateHospital;

    console.log("========== HOSPITAL API CALL ==========");
    console.log("Action:", action);

    try {

        const data = await apiRequest(
            action,
            'POST',
            formData,
            router
        );

        console.log("========== HOSPITAL API RESPONSE ==========");
        console.log(data);

        if (data?.response === true) {

            const message = isEdit
                ? 'Hospital updated successfully!'
                : 'Hospital added successfully!';

            showSuccess(message);

            setFormSubmitted(false);
            setIsButtonLoading(false);

            router.push('/hospitals');

            return;
        }

        // API returned false
        console.error(
            'Hospital API Error:',
            data
        );

        showError(
            data?.message ||
            data?.msg ||
            'Hospital save failed'
        );

        setFormSubmitted(false);
        setIsButtonLoading(false);

    } catch (error) {

        console.error(
            '========== HOSPITAL SAVE ERROR ==========',
            error
        );

        showError(
            error?.message ||
            'Something went wrong while saving hospital'
        );

        setFormSubmitted(false);
        setIsButtonLoading(false);
    }
};


    const handleLocationSelect = (lat, lng, address) => {
        setForm(prev => ({
            ...prev,
            address: address || '',
            latitude: lat || '',
            longitude: lng || '',
        }));
    };
    const handleAddType = async (newType) => {
        try {
            const payload = {
                params: {
                    ...newType,
                    status: newType.status || "Active",
                    translations: {
                        en: { name: newType.name },
                        ta: { name: newType.nameTa },
                    }
                }
            };
            console.log('Sending payload:', payload);
            const response = await apiRequest(apiRoutes.addHospitalType, 'POST', payload, router);
            if (response?.data) {
                const newOption = {
                    label: response.data.name,
                    value: response.data.id,
                };
                setTypeOptions((prev) => [...prev, newOption]);
                setForm((prevForm) => ({
                    ...prevForm,
                    typeIds: [...(prevForm.typeIds || []), newOption.value],
                    Types: [...(prevForm.Types || []), response.data],
                }));
            }
        } catch (error) {
            console.error('Failed to add type:', error);
        }
    };
    const handleAddDepartment = async (newDepartment) => {
        try {
            const formData = new FormData();
            formData.append('title', newDepartment.title);
            formData.append('titleTa', newDepartment.titleTa || '');
            formData.append('subTitle', newDepartment.subTitle);
            formData.append('subTitleTa', newDepartment.subTitleTa || '');
            formData.append(
                'translations',
                JSON.stringify({
                    en: {
                        title: newDepartment.title,
                        subTitle: newDepartment.subTitle,
                    },
                    ta: {
                        title: newDepartment.titleTa,
                        subTitle: newDepartment.subTitleTa,
                    },
                })
            );
            if (newDepartment.file) {
                formData.append('file', newDepartment.file);
            }

            const response = await apiRequest(apiRoutes.addHospitalDept, 'POST', formData, router);

            if (response?.response === true && response.data) {
                const newDept = response.data;

                const newOption = {
                    label: newDept.title,
                    value: newDept.id,
                };

                setDeptOptions((prev) => [...prev, newOption]);

                setForm((prevForm) => ({
                    ...prevForm,
                    departmentIds: [...(prevForm.departmentIds || []), newOption.value],
                    Departments: [...(prevForm.Departments || []), newDept],
                }));
            } else {
                throw new Error(response?.message || 'Unknown error from backend');
            }
        } catch (error) {
            console.error('Failed to add department:', error);
            showError('Something went wrong while adding the department.');
        }
    };
    return (
        <div className="max-w-6xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />
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
                <div className='d-flex gap-2'>
                    <form onSubmit={handleSubmit} className="custom-form gap-2" style={{ width: '50%' }}>
                        <div>
                            <div className="mt-2">
                                <Input
                                    label="Name"
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                />
                            </div>
                            <div className="mt-2">
                                <Input
                                    label="Tamil Name"
                                    placeholder="தமிழில் உள்ளிடவும்"
                                    name="nameTa"
                                    value={form.nameTa}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            nameTa: e.target.value,
                                        }))
                                    }
                                    required={true}
                                    formSubmitted={formSubmitted}
                                />
                            </div>
                            <div className="mt-2">
                                <FileUpload
                                    label="Thumbnail"
                                    format="image"
                                    parentFile={previewUrl}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                    onFileSelect={(file) => {
                                        const previewUrl = URL.createObjectURL(file);
                                        setForm({ ...form, file });
                                        setPreviewUrl(previewUrl)
                                    }}
                                />
                            </div>
                            <div className="mt-2">
                                <Input
                                    label="Email"
                                    name="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                />
                            </div>
                            <div className="mt-2">
                                <Input
                                    label="Mobile"
                                    name="mobile"
                                    type="number"
                                    value={form.mobile}
                                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                    required={true}
                                    formSubmitted={formSubmitted}
                                />
                            </div>
                            <div className="mt-2" >
                                <GoogleMapPicker
                                    label='Address'
                                    required="true"
                                    initalAddress={form.address}
                                    initialLat={form.latitude}
                                    initialLng={form.longitude}
                                    onLocationSelect={handleLocationSelect}
                                    formSubmitted={formSubmitted}
                                />
                            </div>
                            <div className="mt-2">
                                <Input
                                    label="Tamil Address"
                                    placeholder="தமிழில் முகவரியை உள்ளிடவும்"
                                    name="addressTa"
                                    value={form.addressTa}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            addressTa: e.target.value,
                                        }))
                                    }
                                    required={true}
                                    formSubmitted={formSubmitted}
                                />
                            </div>
                            {/* <div className="mt-2">
                            <MultiSelectDropdown
                                label="Type"
                                required={true}
                                options={typeOptions}
                                value={form.typeIds}
                                onChange={(vals) =>
                                    setForm(prev => ({ ...prev, typeIds: vals.map(v => v.value) }))
                                }
                            />
                            <div className="mt-3">
                                <span
                                    style={{ color: Colors.Primary2, cursor: 'pointer', fontWeight: 300, fontSize: '14px' }}
                                    onClick={() => setTypeDialogOpen(true)}
                                >
                                    <img src="/assets/icons/blue-plus-icon.svg" style={{ width: '25px', marginLeft: '540px', marginTop: '-25px' }} />
                                </span>
                            </div>
                        </div> */}
                            <div className="mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <MultiSelectDropdown
                                            label="Type"
                                            //required={true}
                                            formSubmitted={formSubmitted}
                                            options={typeOptions}
                                            value={form.typeIds}
                                            onChange={(vals) =>
                                                setForm(prev => ({ ...prev, typeIds: vals.map(v => v.value) }))
                                            }
                                        />
                                    </div>
                                    <span
                                        className='cursor'
                                        onClick={() => setTypeDialogOpen(true)}
                                    >
                                        <img
                                            src="/assets/icons/blue-plus-icon.svg"
                                            style={{ width: '24px', marginTop: '15px' }}
                                            alt="Add"
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <MultiSelectDropdown
                                            label="Department"
                                            //required={true}
                                            formSubmitted={formSubmitted}
                                            options={deptOptions}
                                            value={form.departmentIds}
                                            onChange={(vals) =>
                                                setForm(prev => ({ ...prev, departmentIds: vals.map(v => v.value) }))
                                            }
                                        />
                                    </div>
                                    <span
                                        className='cursor'
                                        onClick={() => setDepartmentDialogOpen(true)}
                                    >
                                        <img
                                            src="/assets/icons/blue-plus-icon.svg"
                                            style={{ width: '24px', marginTop: '30px' }}
                                            alt="Add Department"
                                        />
                                    </span>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-4">
                                <Button
                                    label={isEdit ? "Update" : "Save"}
                                    type="submit"
                                    size="small"
                                    color="#fff"
                                    backgroundColor={Colors.Primary2}
                                    isLoading={isButtonLoading}
                                />
                            </div>
                        </div>
                    </form>
                    <div className="custom-form" style={{ width: '50%' }}>
                        <Input
                            placeholder=""
                            name="Facility"
                            label="Facility Description"
                            value={facilityInput}
                            required={true}
                            onChange={(e) => setFacilityInput(e.target.value)}
                        />
                        <div className="mt-2">
                            <Input
                               // placeholder=""
                                name="FacilityTamil"
                                label="Tamil Facility Description"
                                placeholder="தமிழில் உள்ளிடவும்"
                                value={facilityInputTa}
                                required={true}
                                onChange={(e) => setFacilityInputTa(e.target.value)}
                            />
                        </div>
                        <div className="d-flex justify-content-end align-items-center mt-2">
                            <Button
                                label="Add"
                                type="button"
                                color="#fff"
                                size="small"
                                backgroundColor={Colors.Primary1}
                                onClick={handleAddFacility}
                            />
                        </div>
                        {form.facilities.length > 0 && (
                            <div className="mb-3" style={{ border: 'none' }}>
                                <label
                                    htmlFor="Facilities"
                                    className="form-label mb-0 pt-1"
                                    style={{ minWidth: '100px' }}
                                >
                                    Facilities
                                </label>

                                <div
                                    className="mt-2 ms-3"
                                    style={{ maxHeight: '180px', overflow: 'auto' }}
                                >
                                    <ul
                                        className="cursor"
                                        style={{
                                            listStyleType: 'circle',
                                            paddingLeft: '20px',
                                            marginBottom: 0,
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {form.facilities.map((facility, index) => (
                                            <li
                                                className='cursor'
                                                key={facility.id ?? index}
                                                style={{
                                                    listStyleType: 'circle',
                                                }}
                                            >
                                                <div
                                                    className="d-flex justify-content-between align-items-center"
                                                    style={{
                                                        borderBottom: index !== form.facilities.length - 1 ? '1px solid #ccc' : 'none',
                                                        paddingBottom: '6px',
                                                        paddingTop: '6px',
                                                    }}
                                                >
                                                    <span>
                                                        {facility.decription}
                                                        {facility.decriptionTa && (
                                                            <>
                                                                <br />
                                                                <span style={{ fontSize: '12px' }}>
                                                                    {facility.decriptionTa}
                                                                </span>
                                                            </>
                                                        )}
                                                    </span>
                                                    <Image
                                                        src="/assets/icons/delete-icon.svg"
                                                        alt="delete icon"
                                                        width={18}
                                                        height={18}
                                                        className="ms-2"
                                                        onClick={() => handleDeleteFacility(facility.id)}
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {/* <div className="mt-3">
                            <span
                                className='cursor'
                                style={{ color: Colors.Primary2, fontWeight: 300, fontSize: '14px' }}
                                onClick={() => setDoctorDialogOpen(true)}
                            >
                                + Add Doctor <span style={{ color: 'red' }}>*</span>
                            </span>
                        </div> */}
                        <div className="mt-3">
                            <span
                                className="cursor"
                                style={{
                                    color: Colors.Primary2,
                                    fontWeight: 300,
                                    fontSize: "14px"
                                }}
                                onClick={() => setDoctorDialogOpen(true)}
                            >
                                + Add Doctor <span style={{ color: "red" }}>*</span>
                            </span>
                        </div>
                        {form.Doctors.length > 0 && (
                            <div className="mt-4">
                                <label className="form-label" style={{ fontWeight: '500' }}>
                                    Doctors
                                </label>
                                <ul className="mt-2" style={{ paddingLeft: '20px' }}>
                                    {form.Doctors.map((doc, index) => (
                                        <li key={doc.id ?? doc.name ?? index} style={{ listStyleType: 'circle' }}>
                                            <div className="d-flex justify-content-between align-items-center"
                                                style={{
                                                    borderBottom: index !== form.Doctors.length - 1 ? '1px solid #ccc' : 'none',
                                                    paddingBottom: '6px',
                                                    paddingTop: '6px',
                                                }}>
                                                <span>
                                                    {doc.name}
                                                    {doc.nameTa && (
                                                        <>
                                                            <br />
                                                            <span style={{ fontSize: '12px' }}>{doc.nameTa}</span>
                                                        </>
                                                    )}
                                                </span>
                                                <div className="d-flex gap-2 cursor">
                                                    <Image
                                                        src="/assets/icons/edit-icon.svg"
                                                        alt="edit icon"
                                                        width={18}
                                                        height={18}
                                                        onClick={() => {
                                                            setEditingDoctorIndex(index);
                                                            setDoctorDialogOpen(true);
                                                        }}
                                                    />
                                                    <Image
                                                        src="/assets/icons/delete-icon.svg"
                                                        alt="delete icon"
                                                        width={18}
                                                        height={18}
                                                        onClick={() => {
                                                            const updatedDoctors = form.Doctors.filter((_, i) => i !== index);
                                                            setForm((prev) => ({ ...prev, Doctors: updatedDoctors }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {form.Types.length > 0 && (
                            <div className="mt-4">
                                <label className="form-label" style={{ fontWeight: '500' }}>
                                    Types
                                </label>
                                <ul className="mt-2" style={{ paddingLeft: '20px' }}>
                                    {form.Types.map((type, index) => (
                                        <li key={type.id ?? type.name ?? index} style={{ listStyleType: 'circle' }}>
                                            <div className="d-flex justify-content-between align-items-center"
                                                style={{
                                                    borderBottom: index !== form.Types.length - 1 ? '1px solid #ccc' : 'none',
                                                    paddingBottom: '6px',
                                                    paddingTop: '6px',
                                                }}>
                                                <span>
                                                        {type.name}
                                                        {type.nameTa && (
                                                            <>
                                                                <br />
                                                                <span style={{ fontSize: '12px' }}>{type.nameTa}</span>
                                                            </>
                                                        )}
                                                    </span>
                                                <div className="d-flex gap-2 cursor">
                                                    <Image
                                                        src="/assets/icons/edit-icon.svg"
                                                        alt="edit icon"
                                                        width={18}
                                                        height={18}
                                                        onClick={() => {
                                                            setEditingTypeIndex(index);
                                                            setTypeDialogOpen(true);
                                                        }}
                                                    />
                                                    <Image
                                                        src="/assets/icons/delete-icon.svg"
                                                        alt="delete icon"
                                                        width={18}
                                                        height={18}
                                                        onClick={() => {
                                                            const updatedTypes = form.Types.filter((_, i) => i !== index);
                                                            setForm((prev) => ({ ...prev, Types: updatedTypes }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {form.Departments.length > 0 && (
                            <div className="mt-4">
                                <label className="form-label" style={{ fontWeight: '500' }}>
                                    Departments
                                </label>
                                <ul className="mt-2" style={{ paddingLeft: '20px' }}>
                                    {form.Departments.map((department, index) => (
                                        <li key={department.id ?? department.title ?? index} style={{ listStyleType: 'circle' }}>
                                            <div className="d-flex justify-content-between align-items-center"
                                                style={{
                                                    borderBottom: index !== form.Departments.length - 1 ? '1px solid #ccc' : 'none',
                                                    paddingBottom: '6px',
                                                    paddingTop: '6px',
                                                }}>
                                                <span>
                                                        {department.title}
                                                        {department.titleTa && (
                                                            <>
                                                                <br />
                                                                <span style={{ fontSize: '12px' }}>{department.titleTa}</span>
                                                            </>
                                                        )}
                                                    </span>
                                                <div className="d-flex gap-2 cursor">
                                                    <Image
                                                        src="/assets/icons/edit-icon.svg"
                                                        alt="edit icon"
                                                        width={18}
                                                        height={18}
                                                        onClick={() => {
                                                            setEditingDepartmentIndex(index);
                                                            setDepartmentDialogOpen(true);
                                                        }}
                                                    />
                                                    <Image
                                                        src="/assets/icons/delete-icon.svg"
                                                        alt="delete icon"
                                                        width={18}
                                                        height={18}
                                                        onClick={() => {
                                                            const updatedDepartments = form.Departments.filter((_, i) => i !== index);
                                                            setForm((prev) => ({ ...prev, Departments: updatedDepartments }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <CustomDialog
                open={doctorDialogOpen}
                onClose={() => {
                    setDoctorDialogOpen(false);
                    setEditingDoctorIndex(null);
                }}
                title={editingDoctorIndex !== null ? 'Edit Doctor' : 'Add Doctor'}
                titleColor="#000000"
                backgroundColor="#fafcfc"
                maxWidth='xs'
                content={
                    <AddDoctorForm
                        deptOptions={deptOptions}
                        existingDoctor={editingDoctorIndex !== null ? form.Doctors[editingDoctorIndex] : null}
                        onSubmit={(newDoctor) => {
                            if (editingDoctorIndex !== null) {
                                const updatedDoctors = [...form.Doctors];
                                updatedDoctors[editingDoctorIndex] = newDoctor;
                                setForm((prev) => ({ ...prev, Doctors: updatedDoctors }));
                            } else {
                                setForm((prev) => ({
                                    ...prev,
                                    Doctors: [...prev.Doctors, newDoctor],
                                }));
                            }
                            setDoctorDialogOpen(false);
                            setEditingDoctorIndex(null);
                        }}
                        onClose={() => {
                            setDoctorDialogOpen(false);
                            setEditingDoctorIndex(null);
                        }}
                    />
                }
            />
            <CustomDialog
                open={typeDialogOpen}
                onClose={() => {
                    setTypeDialogOpen(false);
                    setEditingTypeIndex(null);
                }}
                title={editingTypeIndex !== null ? 'Edit Type' : 'Add Type'}
                titleColor="#000000"
                backgroundColor="#fafcfc"
                maxWidth="xs"
                content={
                    <AddTypeForm
                        existingType={editingTypeIndex !== null ? form.Types[editingTypeIndex] : null}
                        onSubmit={async (newType) => {
                            if (editingTypeIndex !== null) {
                                // EDIT flow: just update local state here
                                const updatedTypes = [...form.Types];
                                updatedTypes[editingTypeIndex] = newType;
                                setForm((prev) => ({ ...prev, Types: updatedTypes }));
                            } else {
                                await handleAddType(newType);
                            }

                            setTypeDialogOpen(false);
                            setEditingTypeIndex(null);
                        }}
                        onClose={() => {
                            setTypeDialogOpen(false);
                            setEditingTypeIndex(null);
                        }}
                    />
                }
            />
            <CustomDialog
                open={departmentDialogOpen}
                onClose={() => {
                    setDepartmentDialogOpen(false);
                    setEditingDepartmentIndex(null);
                }}
                title={editingDepartmentIndex !== null ? 'Edit Department' : 'Add Department'}
                titleColor="#000000"
                backgroundColor="#fafcfc"
                maxWidth="xs"
                content={
                    <AddDepartmentForm
                        existingDepartment={editingDepartmentIndex !== null ? form.Departments[editingDepartmentIndex] : null}
                        onSubmit={async (newDepartment) => {
                            if (editingDepartmentIndex !== null) {
                                const updatedDepartments = [...form.Departments];
                                updatedDepartments[editingDepartmentIndex] = newDepartment;
                                setForm((prev) => ({ ...prev, Departments: updatedDepartments }));
                            } else {
                                await handleAddDepartment(newDepartment);
                            }
                            setDepartmentDialogOpen(false);
                            setEditingDepartmentIndex(null);
                        }}
                        onClose={() => {
                            setDepartmentDialogOpen(false);
                            setEditingDepartmentIndex(null);
                        }}
                    />
                }
            />
        </div >
    )
}
'use client';
import { React, useEffect, useState, useRef } from "react";
import './page.css';
import Button from "@/components/shared/button/page";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/shared/input/page";
import ColorInput from "@/components/shared/color-input/page";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { showError, showSuccess } from "@/common/toast/toastService";
import Image from "next/image";
import { CircularProgress } from "@mui/material";
import AutoCompleteInput from "@/components/shared/autocomplete/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import { getMonths } from "@/common/utils/util";
import Checkbox from "@/components/shared/checkbox/page";
import { Colors } from "@/common/constants/colorEnum";

export default function ManageSubscription() {

    const [form, setForm] = useState({
        planName: '',
        planNameTa: '',
        planAmount: '',
        color: '#5A03FC',
        durationMonths: '',
        features: [],
        pregMom: false,
        newMom: false,
    });

    const { id } = useParams();
    const router = useRouter();
    const viewApiRef = useRef();
    const isEdit = id !== 'add';

    const [months, setMonths] = useState('');
    const [featureInput, setFeatureInput] = useState('');
    const [featureInputTa, setFeatureInputTa] = useState('');

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [backLoading, setBackLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewform, setViewform] = useState({});

    const breadcrumbItems = [
        { label: 'User Management' },
        { label: 'Subscription', href: '/subscription' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/subscription/${id}` : '/subscription/add'
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

    useEffect(() => {
        const month = getMonths();
        setMonths(month);
    }, []);

    useEffect(() => {
        if (isEdit) {
            setIsLoading(true);

            if (viewApiRef.current) return;

            viewApiRef.current = true;
            viewSubscription(id);
        }
    }, [id]);

    const handleBack = () => {
        setBackLoading(true);
        router.push('/subscription');
    };

    const handleCheckboxChange = (key) => (e) => {
        setForm((prev) => ({
            ...prev,
            [key]: e.target.checked,
        }));
    };

    const handleSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            durationMonths: item.label,
        }));
    };

    // ADD FEATURE
    const handleAddFeature = () => {

        if (!featureInput.trim()) {
            showError('Please enter English feature');
            return;
        }

        if (!featureInputTa.trim()) {
            showError('Please enter Tamil feature');
            return;
        }

        const newFeature = {
            id: form.features.length > 0
                ? form.features[form.features.length - 1].id + 1
                : 1,

            description: featureInput,

            descriptionTa: featureInputTa,

            translations: {
                en: {
                    description: featureInput
                },
                ta: {
                    description: featureInputTa
                }
            }
        };

        setForm((prev) => ({
            ...prev,
            features: [...prev.features, newFeature],
        }));

        setFeatureInput('');
        setFeatureInputTa('');
    };

    const handleDeleteFeature = (idToDelete) => {

        const updatedFeatures = form.features
            .filter((feature) => feature.id !== idToDelete)
            .map((f, i) => ({
                ...f,
                id: i + 1,
            }));

        setForm({
            ...form,
            features: updatedFeatures
        });
    };

    // VIEW
    const viewSubscription = async (id) => {
        try {
            const payload = {
                params: {
                    id,
                    admin: true
                }
            };
            const data = await apiRequest(
                apiRoutes.ViewSubscription,
                'POST',
                payload,
                router
            );
            if (data?.response) {
                const plan = data?.data;
                setForm({
                    planName: plan?.planName || '',
                    //planNameTa: plan?.translations?.ta?.name || '',
                    planNameTa:plan?.translations?.ta?.name ||
                            plan?.planNameTa ||
                            plan?.translations?.ta?.planName ||
                            '',
                    planAmount: plan?.planAmount || '',
                    color: plan?.color || '',
                    durationMonths:plan?.durationMonths || '',
                    features: plan?.features || [],
                    pregMom: false,
                    newMom: false,
                });
                setViewform(plan);
                setIsLoading(false);
            }
        } catch (error) {
            console.log('error', error);
            setIsLoading(false);
        }
    };

    // SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setButtonLoading(true);
        if (
            !form.planName ||
            !form.planAmount ||
            !form.durationMonths
        ) {
            setButtonLoading(false);
            return;
        }
        if (!form.planNameTa) {
            showError('Please enter Tamil Plan Name');
            setButtonLoading(false);
            return;
        }
        if (form.features.length === 0) {
            showError('Please add at least one feature');
            setFormSubmitted(false);
            setButtonLoading(false);
            return;
        }
        const updateForm = {
            ...(isEdit ? viewform : {}),
            ...form,
            translations: {
                en: {
                    name: form.planName
                },
                ta: {
                    name: form.planNameTa
                }
            },
            features: form.features.map((feature, index) => ({
                id: feature.id || index + 1,
                description: feature.description,
                descriptionTa:
                    feature.descriptionTa ||
                    feature.translations?.ta?.description ||
                    '',
                translations: {
                    en: {
                        description:
                            feature.description ||
                            feature.translations?.en?.description ||
                            ''
                    },
                    ta: {
                        description:
                            feature.descriptionTa ||
                            feature.translations?.ta?.description ||
                            ''
                    }
                }
            }))
        };
        manageSubscription(updateForm);
    }
    const manageSubscription = async (formData) => {
        try {
            const payload = {
                params: !isEdit
                    ? { ...formData }
                    : {
                        ...formData,
                        id: id
                    }
            };
            const action = !isEdit
                ? apiRoutes.AddSubscription
                : apiRoutes.UpdateSubscription;

            const data = await apiRequest(
                action,
                'POST',
                payload,
                router
            );
            if (data?.response) {
                const message = isEdit
                    ? 'Plan updated successfully!'
                    : 'Plan added successfully!';
                showSuccess(message);
                router.push('/subscription');
                setFormSubmitted(false);
                setButtonLoading(false);
            }
        } catch (error) {
            console.log('error', error);
            setFormSubmitted(false);
            setButtonLoading(false);
        }
    };
    const DEFAULT_COLOR = '#5a03fc';
    const isDarkBlackColor = (hex) => {
        const color = hex.replace('#', '');
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 60;
    };

    return (

        <div
            className="max-w-4xl mx-auto mt-10"
            onSubmit={handleSubmit}
        >

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

                    {/* LEFT SIDE */}

                    <form
                        className="custom-form gap-2"
                        style={{ width: '30%' }}
                    >

                        {/* ENGLISH PLAN NAME */}

                        <div className="mb-2 mt-2">
                            <Input
                                placeholder=""
                                name="PlanName"
                                label="Plan Name"
                                value={form.planName}
                                required={true}
                                formSubmitted={formSubmitted}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        planName: e.target.value
                                    })
                                }
                            />
                        </div>

                        {/* TAMIL PLAN NAME */}

                        <div className="mb-2 mt-2">
                            <Input
                                placeholder=""
                                name="PlanNameTa"
                                label="Plan Name (Tamil)"
                                value={form.planNameTa}
                                required={true}
                                formSubmitted={formSubmitted}
                                tamilKeyboard={true}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        planNameTa: e.target.value
                                    })
                                }
                            />
                        </div>

                        {/* PLAN AMOUNT */}

                        <div className="mb-2 mt-2">

                            <Input
                                placeholder=""
                                name="PlanAmount"
                                label="Plan Amount"
                                type="number"
                                value={form.planAmount}
                                required={true}
                                formSubmitted={formSubmitted}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        planAmount: e.target.value
                                    })
                                }
                            />

                        </div>

                        {/* COLOR */}
                        <div className="mb-2 mt-2">
                            <ColorInput
                                label="Color"
                                required={true}
                                onChange={(color) => {
                                    if (isDarkBlackColor(color)) {
                                        alert('Black color not allowed');
                                        setForm({
                                            ...form,
                                            color: DEFAULT_COLOR
                                        });
                                        return;
                                    }
                                    setForm({
                                        ...form,
                                        color
                                    });
                                }}
                                defaultColor={
                                    form.color || DEFAULT_COLOR
                                }
                            />
                        </div>

                        {/* DURATION */}

                        <div className="mb-2 mt-2">
                            <AutoCompleteInput
                                label="Duration In Months"
                                options={months}
                                required={true}
                                formSubmitted={formSubmitted}
                                onSelect={handleSelect}
                                value={form.durationMonths}
                            />
                        </div>

                        {/* SAVE */}
                        <div className="d-flex justify-content-end align-items-center">
                            <Button
                                label={isEdit ? "Update" : "Save"}
                                type="submit"
                                color="#fff"
                                size="small"
                                backgroundColor={Colors.Primary2}
                                isLoading={buttonLoading}
                            />
                        </div>
                    </form>

                    {/* RIGHT SIDE */}

                    <div
                        className="custom-form"
                        style={{ width: '70%' }}
                    >

                        <div style={{ border: 'none' }}>

                            <label
                                className="form-label mb-3"
                                style={{
                                    minWidth: '100px'
                                }}
                            >
                                Add Features
                            </label>

                            {/* ENGLISH FEATURE */}

                            <div className="mb-2">

                                <Input
                                    placeholder=""
                                    name="Feature"
                                    label="Feature"
                                    value={featureInput}
                                    required={false}
                                    onChange={(e) =>
                                        setFeatureInput(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* TAMIL FEATURE */}

                            <div className="mb-2">
                                <Input
                                    placeholder=""
                                    name="FeatureTa"
                                    label="Feature (Tamil)"
                                    value={featureInputTa}
                                    required={false}
                                    tamilKeyboard={true}
                                    onChange={(e) =>
                                        setFeatureInputTa(
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {/* ADD BUTTON */}

                        <div className="d-flex justify-content-end align-items-center mt-2">

                            <Button
                                label="Add"
                                type="button"
                                color="#fff"
                                size="small"
                                backgroundColor={Colors.Primary1}
                                onClick={handleAddFeature}
                            />

                        </div>

                        {/* FEATURE LIST */}

                        {form.features.length > 0 && (

                            <div
                                className="mb-3"
                                style={{ border: 'none' }}
                            >

                                <label
                                    className="form-label mb-0 pt-1"
                                    style={{
                                        minWidth: '100px'
                                    }}
                                >
                                    Features
                                </label>

                                <div
                                    className="mt-2 ms-3"
                                    style={{
                                        maxHeight: '180px',
                                        overflow: 'auto'
                                    }}
                                >

                                    <ul
                                        className="cursor"
                                        style={{
                                            listStyleType: 'circle',
                                            paddingLeft: '20px',
                                            marginBottom: 0,
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                            maxWidth: '100%'
                                        }}
                                    >

                                        {form.features.map(
                                            (feature, index) => (

                                                <li
                                                    className="cursor"
                                                    key={feature.id}
                                                >

                                                    <div
                                                        className="d-flex justify-content-between align-items-center"
                                                        style={{
                                                            borderBottom:
                                                                index !==
                                                                form.features.length - 1
                                                                    ? '1px solid #ccc'
                                                                    : 'none',

                                                            paddingBottom: '6px',
                                                            paddingTop: '6px'
                                                        }}
                                                    >

                                                        <div>

                                                            <div>
                                                                {feature.description}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    marginTop: '3px'
                                                                }}
                                                            >
                                                                {feature.descriptionTa ||
                                                                    feature.translations?.ta?.description}
                                                            </div>

                                                        </div>

                                                        <Image
                                                            src="/assets/icons/delete-icon.svg"
                                                            alt="delete"
                                                            width={18}
                                                            height={18}
                                                            className="ms-2"
                                                            onClick={() =>
                                                                handleDeleteFeature(
                                                                    feature.id
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                </li>

                                            )
                                        )}

                                    </ul>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}


// 'use client';
// import { React, useEffect, useState, useRef } from "react";
// import './page.css';
// import Button from "@/components/shared/button/page";
// import { useRouter, useParams } from "next/navigation";
// import Input from "@/components/shared/input/page";
// import ColorInput from "@/components/shared/color-input/page";
// import apiRoutes from "@/common/constants/apiRoutes";
// import { apiRequest } from "@/common/api/apiService";
// import { showError, showSuccess } from "@/common/toast/toastService";
// import Image from "next/image";
// import { CircularProgress } from "@mui/material";
// import AutoCompleteInput from "@/components/shared/autocomplete/page";
// import Breadcrumb from "@/components/shared/breadcrumb/page";
// import { getMonths } from "@/common/utils/util";
// import Checkbox from "@/components/shared/checkbox/page";
// import { Colors } from "@/common/constants/colorEnum";
// export default function ManageSubscription() {
//     const [form, setForm] = useState({
//         planName: '',
//         planAmount: '',
//         color: '#5A03FC',
//         durationMonths: '',
//         features: [],
//         // momTypes: [],
//         pregMom: false,
//         newMom: false,
//         // id: '',
//     });
//     const { id } = useParams();
//     const router = useRouter();
//     const viewApiRef = useRef();
//     const isEdit = id !== 'add';
//     const [months, setMonths] = useState('');
//     const [featureInput, setFeatureInput] = useState('');
//     const [formSubmitted, setFormSubmitted] = useState(false);
//     const [backLoading, setBackLoading] = useState(false);
//     const [buttonLoading, setButtonLoading] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [viewform, setViewform] = useState({});
//     const breadcrumbItems = [
//         { label: 'User Management' },
//         { label: 'Subscription', href: '/subscription' },
//         {
//             label: isEdit ? 'Edit' : 'Add',
//             href: isEdit ? `/subscription/${id}` : '/subscription/add'
//         },
//     ];
//     const breadcrumbAction = {
//         label: 'Back',
//         type: 'button',
//         size: 'extraSmall',
//         backgroundColor: Colors.Primary1,
//         isLoading: backLoading,
//         onClick: () => handleBack(),
//     };
//     useEffect(() => {
//         const month = getMonths();
//         setMonths(month);
//     }, []);
//     useEffect(() => {
//         if (isEdit) {
//             setIsLoading(true)
//             if (viewApiRef.current) return;
//             viewApiRef.current = true;
//             viewSubscription(id)
//         }
//     }, [id]);
//     const handleBack = () => {
//         setBackLoading(true);
//         router.push('/subscription')
//     }
//     const handleCheckboxChange = (key) => (e) => {
//         setForm((prev) => ({
//             ...prev,
//             [key]: e.target.checked,
//         }));
//     };
//     // const generateMomTypes = (form) => {
//     //     return [].concat(
//     //         form.pregMom ? ['pregMom'] : [],
//     //         form.newMom ? ['newMom'] : []
//     //     );
//     // };
//     const handleSelect = (item) => {
//         console.log(item)
//         setForm((prev) => ({
//             ...prev,
//             durationMonths: item.label,
//         }));
//         console.log('form', form.durationMonths)
//     };
//     const handleAddFeature = () => {
//         if (!featureInput.trim()) return;
//         const newFeature = {
//             id: form.features.length > 0
//                 ? form.features[form.features.length - 1].id + 1
//                 : 1,
//             description: featureInput,
//         };
//         setForm((prev) => ({
//             ...prev,
//             features: [...prev.features, newFeature],
//         }));
//         setFeatureInput('');
//     };
//     const handleDeleteFeature = (idToDelete) => {
//         const updatedFeatures = form.features
//             .filter((feature) => feature.id !== idToDelete)
//             .map((f, i) => ({
//                 ...f,
//                 id: i + 1,
//             }));
//         setForm({ ...form, features: updatedFeatures });
//     };
//     const viewSubscription = async (id) => {
//         try {
//             const payload = { params: { id } }
//             const data = await apiRequest(apiRoutes.ViewSubscription, 'POST', payload, router);
//             if (data?.response) {
//                 const plan = data?.data;
//                 setForm({
//                     planName: plan?.planName || '',
//                     planAmount: plan?.planAmount || '',
//                     color: plan?.color || '',
//                     durationMonths: plan?.durationMonths || '',
//                     features: plan?.features || [],
//                     // pregMom: plan?.momTypes[0] === 'pregMom' || false,
//                     // newMom: plan?.momTypes[0] === 'newMom' || false,
//                     // momTypes: plan.momTypes
//                 });
//                 setViewform(plan)
//                 setIsLoading(false)
//             }
//         } catch (error) {
//             console.log('error', error)
//         }
//     }
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setFormSubmitted(true);
//         setButtonLoading(true);
//         if (!form.planName || !form.planAmount || !form.durationMonths) {
//             // showError('Invalid Form');
//             setButtonLoading(false);
//             return;
//         }
//         if (form.features.length === 0) {
//             showError('Please add at least one feature');
//             setFormSubmitted(false);
//             setButtonLoading(false);
//             return;
//         }
//         let updateForm;
//         if (isEdit) {
//             updateForm = {
//                 ...viewform,
//                 ...form,
//                 // momTypes: generateMomTypes(form)
//             };
//         } else {
//             updateForm = {
//                 ...form,
//                 // momTypes: generateMomTypes(form),
//             };
//         }
//         console.log('updateForm', updateForm)
//         manageSubscription(updateForm);
//     }
//     const manageSubscription = async (form) => {
//         console.log('updatedForm', form)
//         const payload = { params: !isEdit ? { ...form } : { ...form, id: id } }
//         const action = !isEdit ? apiRoutes.AddSubscription : apiRoutes.UpdateSubscription
//         try {
//             const data = await apiRequest(action, 'POST', payload, router);
//             if (data?.response) {
//                 console.log('subscription', data)
//                 const message = isEdit ? 'Plan updated successfully!' : 'Plan added successfully!';
//                 showSuccess(message);
//                 router.push('/subscription')
//                 setFormSubmitted(false);
//                 setButtonLoading(false);
//             }
//         } catch (error) {
//             console.log('error', error);
//             setFormSubmitted(false);
//             setButtonLoading(false);
//         }
//     }
//     const DEFAULT_COLOR = '#5a03fc';

//     const isDarkBlackColor = (hex) => {
//         const color = hex.replace('#', '');

//         const r = parseInt(color.substring(0, 2), 16);
//         const g = parseInt(color.substring(2, 4), 16);
//         const b = parseInt(color.substring(4, 6), 16);

//         // brightness check
//         const brightness = (r * 299 + g * 587 + b * 114) / 1000;

//         return brightness < 60; // only black / near black colors
//     };
//     return (
//         <div className="max-w-4xl mx-auto mt-10" onSubmit={handleSubmit}>
//             <Breadcrumb
//                 items={breadcrumbItems}
//                 actionButton={breadcrumbAction}
//             />
//             {isLoading ? (
//                 <div
//                     style={{
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         height: '400px',
//                         width: '100%',
//                     }}
//                 >
//                     <CircularProgress />
//                 </div>
//             ) : (
//                 <div className="d-flex gap-2">
//                     <form className="custom-form gap-2" style={{ width: '30%' }}>
//                         <div className="mb-2 mt-2">
//                             <Input
//                                 placeholder=""
//                                 name="PlanName"
//                                 label="Plan Name"
//                                 value={form.planName}
//                                 required={true}
//                                 formSubmitted={formSubmitted}
//                                 onChange={(e) => setForm({ ...form, planName: e.target.value })}
//                             />
//                         </div>
//                         <div className="mb-2 mt-2">
//                             <Input
//                                 placeholder=""
//                                 name="PlanAmount"
//                                 label="Plan Amount"
//                                 type="number"
//                                 value={form.planAmount}
//                                 required={true}
//                                 formSubmitted={formSubmitted}
//                                 onChange={(e) => setForm({ ...form, planAmount: e.target.value })}
//                             />
//                         </div>
//                         <div className="mb-2 mt-2">
//                             {/* <ColorInput
//                                 label="Color"
//                                 required="true"
//                                 onChange={(color) => setForm({ ...form, color })}
//                                 defaultColor={form.color || '#5a03fc'}
//                             /> */}
//                             <ColorInput
//                                 label="Color"
//                                 required={true}
//                                 onChange={(color) => {
//                                     if (isDarkBlackColor(color)) {
//                                         alert('Black color not allowed');

//                                         setForm({
//                                             ...form,
//                                             color: DEFAULT_COLOR,
//                                         });

//                                         return;
//                                     }

//                                     setForm({
//                                         ...form,
//                                         color,
//                                     });
//                                 }}
//                                 defaultColor={form.color || DEFAULT_COLOR}
//                             />
//                         </div>
//                         <div className="mb-2 mt-2">
//                             <AutoCompleteInput
//                                 label="Duration In Months"
//                                 options={months}
//                                 required={true}
//                                 formSubmitted={formSubmitted}
//                                 onSelect={handleSelect}
//                                 value={form.durationMonths}
//                             />
//                         </div>
//                         {/* <div className="mb-2 mt-2">
//                             <label className="" style={{ fontSize: '13px', fontWeight: '500' }}>Mom Type</label>
//                             <div className="d-flex justify-content-start gap-3">
//                                 <Checkbox
//                                     name="pregMom"
//                                     label="Preg Mom"
//                                     checked={form.pregMom}
//                                     onChange={handleCheckboxChange('pregMom')}
//                                 />
//                                 <Checkbox
//                                     name="newMom"
//                                     label="New Mom"
//                                     checked={form.newMom}
//                                     onChange={handleCheckboxChange('newMom')}
//                                 />
//                             </div>
//                         </div> */}
//                         <div className="d-flex justify-content-end align-items-center">
//                             <Button
//                                 label={isEdit ? "Update" : "Save"}
//                                 type="submit"
//                                 color="#fff"
//                                 size='small'
//                                 backgroundColor={Colors.Primary2}
//                                 isLoading={buttonLoading}
//                             />
//                         </div>
//                     </form>
//                     <div className="custom-form" style={{ width: '70%' }}>
//                         <div style={{ border: 'none' }}>
//                             <label htmlFor="Feature" className="form-label mb-3" style={{ minWidth: '100px' }}>
//                                 Add Features
//                             </label>
//                             <div>
//                                 <Input
//                                     placeholder=""
//                                     name="Feature"
//                                     label="Feature"
//                                     value={featureInput}
//                                     required={false}
//                                     onChange={(e) => setFeatureInput(e.target.value)}
//                                 />
//                             </div>
//                         </div>
//                         <div className="d-flex justify-content-end align-items-center mt-2">
//                             <Button
//                                 label="Add"
//                                 type="button"
//                                 color="#fff"
//                                 size='small'
//                                 backgroundColor={Colors.Primary1}
//                                 onClick={handleAddFeature}
//                             />
//                         </div>
//                         {form.features.length > 0 && (
//                             <div className="mb-3" style={{ border: 'none' }}>
//                                 <label
//                                     htmlFor="Features"
//                                     className="form-label mb-0 pt-1"
//                                     style={{ minWidth: '100px' }}
//                                 >
//                                     Features
//                                 </label>

//                                 <div className="mt-2 ms-3"
//                                     style={{
//                                         maxHeight: '180px', overflow: 'auto'
//                                     }}
//                                 >
//                                     <ul className="cursor"
//                                         style={{
//                                             listStyleType: 'circle',
//                                             paddingLeft: '20px',
//                                             marginBottom: 0,
//                                             wordWrap: 'break-word',
//                                             overflowWrap: 'break-word',
//                                             maxWidth: '100%',
//                                         }}
//                                     >
//                                         {form.features.map((feature, index) => (
//                                             <li
//                                                 className='cursor'
//                                                 key={feature.id}
//                                                 style={{
//                                                     listStyleType: 'circle',
//                                                 }}
//                                             >
//                                                 <div
//                                                     className="d-flex justify-content-between align-items-center"
//                                                     style={{
//                                                         borderBottom: index !== form.features.length - 1 ? '1px solid #ccc' : 'none',
//                                                         paddingBottom: '6px',
//                                                         paddingTop: '6px',
//                                                     }}
//                                                 >
//                                                     <span>{feature.description}</span>
//                                                     <Image
//                                                         src="/assets/icons/delete-icon.svg"
//                                                         alt="icon"
//                                                         width={18}
//                                                         height={18}
//                                                         className="ms-2"
//                                                         onClick={() => handleDeleteFeature(feature.id)}
//                                                     />
//                                                 </div>
//                                             </li>
//                                         ))}
//                                     </ul>

//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//             {/* <div className="position-sticky bottom-0 bg-white p-2 rounded-2 d-flex justify-content-center align-items-center" style={{ zIndex: 1030, marginTop: '100px' }}>
//                 <Button
//                     label="Save"
//                     type="button"
//                     color="#fff"
//                     size="small"
//                     backgroundColor="#209dff"
//                     isLoading={buttonLoading}
//                     onClick={handleSubmit}
//                 />
//             </div> */}
//         </div>
//     )
// }

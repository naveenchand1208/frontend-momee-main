'use client';
import './page.css';
import Image from "next/image";
import { React, useEffect, useState, useRef } from "react";
import Button from "@/components/shared/button/page";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/shared/input/page";
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { showError, showSuccess } from "@/common/toast/toastService";
import { CircularProgress } from "@mui/material";
import AutoCompleteInput from "@/components/shared/autocomplete/page";
import Breadcrumb from "@/components/shared/breadcrumb/page";
import { getMonths, getWeeks, objectToFormData } from "@/common/utils/util";
import RadioGroup from "@/components/shared/radio/page";
import FileUpload from "@/components/shared/file/page";
import { TRIMESTER } from "@/common/constants/enum";
import { Colors } from '@/common/constants/colorEnum';
import Textarea from '@/components/shared/textarea/page';
export default function ManageJourney() {
    const [form, setForm] = useState({
        name: '',
        nameTa: '',
        file: '',
        status: 'Active',
        weight: '',
        height: '',
        babyFruitSize: '',
        babyFruitSizeTa: '',
        description: '',
        descriptionTa: '',
        notes: [],
        momType: '',
        trimesterId: '',
        trimesterName: '',
        link: '',
        pregMom: false,
        newMom: false
    });
    const [noteForm, setNoteForm] = useState({
        descriptions: []
    })
    const { id } = useParams();
    const router = useRouter();
    const viewApiRef = useRef();
    const isEdit = id !== 'add';
    // const [noteTitle, setNoteTitle] = useState('');
    // const [noteDescription, setNoteDescription] = useState('');
    const [noteTitle, setNoteTitle] = useState('');
    const [noteTitleTa, setNoteTitleTa] = useState('');
    const [noteDescription, setNoteDescription] = useState('');
    const [noteDescriptionTa, setNoteDescriptionTa] = useState('');

    const [previewUrl, setPreviewUrl] = useState('');
    const [viewJourneys, setViewJourneys] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [backLoading, setBackLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditNotes, setIsEditNotes] = useState(false);
    const [notesId, setNotesId] = useState('');
    const [months, setMonths] = useState('');
    const [weeks, setWeeks] = useState('');
    const breadcrumbItems = [
        { label: 'Content Management' },
        { label: 'Journey', href: '/journey' },
        {
            label: isEdit ? 'Edit' : 'Add',
            href: isEdit ? `/journey/${id}` : '/journey/add'
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
        const month = getMonths(12);
        setMonths(month);
        const week = getWeeks();
        setWeeks(week);
    }, []);
    useEffect(() => {
        if (isEdit) {
            setIsLoading(true)
            if (viewApiRef.current) return;
            viewApiRef.current = true;
            viewJourney(id)
        }
    }, [id]);
    const handleSelectTrimester = (item) => {
        setForm((prev) => ({
            ...prev,
            trimesterId: item.id,
            trimesterName: item.label,
        }));
    };
    const handleBack = () => {
        setBackLoading(true);
        router.push('/journey')
    }
    const handleMomTypeChange = async (e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            momType: value,
            month: '',
            week: '',
        }));
        setViewJourneys(prev => ({
            ...prev,
            momType: value,
            month: '',
            week: '',
        }));
    };
    const handleMonthSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            month: item.label,
        }));
    };
    const handleWeekSelect = (item) => {
        setForm((prev) => ({
            ...prev,
            week: item.label,
        }));
    };

    const handleAddDescription = () => {

    if (
        !noteDescription.trim() ||
        !noteDescriptionTa.trim()
    ) {
        showError('Please enter English and Tamil description');
        return;
    }

    const newDescription = {
        id:
            noteForm.descriptions.length > 0
                ? noteForm.descriptions[
                    noteForm.descriptions.length - 1
                ].id + 1
                : 1,

        content: noteDescription,

        translations: {
            en: {
                content: noteDescription
            },
            ta: {
                content: noteDescriptionTa
            }
        }
    };

    setNoteForm((prev) => ({
        ...prev,
        descriptions: [
            ...prev.descriptions,
            newDescription
        ]
    }));

    setNoteDescription('');
    setNoteDescriptionTa('');
};

    // const handleAddDescription = () => {
    //     if (
    //         !noteDescription.trim() ||
    //         !noteDescriptionTa.trim()
    //     ) {
    //         return;
    //     }

    //     const newDescription = {
    //         id: noteForm.descriptions.length > 0
    //             ? noteForm.descriptions[
    //                 noteForm.descriptions.length - 1
    //             ].id + 1
    //             : 1,

    //         content: noteDescription,

    //         translations: {
    //             en: {
    //                 content: noteDescription
    //             },
    //             ta: {
    //                 content: noteDescriptionTa
    //             }
    //         }
    //     };

    //     setNoteForm((prev) => ({
    //         ...prev,
    //         descriptions: [
    //             ...prev.descriptions,
    //             newDescription
    //         ],
    //     }));

    //     setNoteDescription('');
    //     setNoteDescriptionTa('');
    // };

//     const handleAddNotes = () => {

//     if (
//         !noteTitle.trim() ||
//         !noteTitleTa.trim() ||
//         noteForm.descriptions.length === 0
//     ) {
//         return;
//     }

//     const newNote = {

//         id: form.notes.length > 0
//             ? form.notes[form.notes.length - 1].id + 1
//             : 1,

//         title: noteTitle,

//         translations: {
//             en: {
//                 title: noteTitle
//             },
//             ta: {
//                 title: noteTitleTa
//             }
//         },

//         descriptions: noteForm.descriptions
//     };

//     if (isEditNotes) {

//         setForm((prev) => ({
//             ...prev,

//             notes: prev.notes.map((note) =>
//                 note.id === notesId
//                     ? {
//                         ...note,

//                         title: noteTitle,

//                         translations: {
//                             en: {
//                                 title: noteTitle
//                             },
//                             ta: {
//                                 title: noteTitleTa
//                             }
//                         },

//                         descriptions:
//                             noteForm.descriptions
//                     }
//                     : note
//             )
//         }));

//     } else {

//         setForm((prev) => ({
//             ...prev,

//             notes: [
//                 ...prev.notes,
//                 newNote
//             ]
//         }));
//     }

//     setNoteTitle('');
//     setNoteTitleTa('');

//     setNoteDescription('');
//     setNoteDescriptionTa('');

//     setNoteForm({
//         descriptions: []
//     });

//     setIsEditNotes(false);
//     setNotesId('');
// };

    // const handleAddDescription = () => {
    //     if (!noteDescription.trim()) return;
    //     const newDescription = {
    //         id: noteForm.descriptions.length > 0
    //             ? noteForm.descriptions[noteForm.descriptions.length - 1].id + 1
    //             : 1,
    //         content: noteDescription,
    //     };
    //     setNoteForm((prev) => ({
    //         ...prev,
    //         descriptions: [...prev.descriptions, newDescription],
    //     }));
    //     setNoteDescription('');
    // }

    // const handleAddNotes = () => {
    //     if (!noteTitle.trim() || noteForm.descriptions.length === 0) return;
    //     const newNote = {
    //         id: form.notes.length > 0 ? form.notes[form.notes.length - 1].id + 1 : 1,
    //         title: noteTitle,
    //         descriptions: noteForm.descriptions
    //     };
    //     if (isEditNotes) {
    //         setForm((prev) => ({
    //             ...prev,
    //             notes: prev.notes.map((note) =>
    //                 note.id === notesId
    //                     ? {
    //                         ...note,
    //                         title: noteTitle,
    //                         descriptions: noteForm.descriptions,
    //                     }
    //                     : note
    //             ),
    //         }));
    //     } else {
    //         setForm((prev) => ({
    //             ...prev,
    //             notes: [...prev.notes, newNote],
    //         }));
    //     }
    //     setNoteTitle('');
    //     setNoteDescription('');
    //     setNoteForm((prev) => ({
    //         ...prev,
    //         descriptions: [],
    //     }));
    // };

    const handleAddNotes = () => {

    if (!noteTitle.trim()) {
        showError('Please enter note title');
        return;
    }

    if (!noteTitleTa.trim()) {
        showError('Please enter Tamil note title');
        return;
    }

    if (noteForm.descriptions.length === 0) {
        showError('Please add at least one description');
        return;
    }

    const newNote = {
        id:
            form.notes.length > 0
                ? form.notes[form.notes.length - 1].id + 1
                : 1,

        title: noteTitle,

        translations: {
            en: {
                title: noteTitle
            },
            ta: {
                title: noteTitleTa
            }
        },

        descriptions: noteForm.descriptions
    };

    if (isEditNotes) {

        setForm((prev) => ({
            ...prev,

            notes: prev.notes.map((note) =>
                note.id === notesId
                    ? newNote
                    : note
            )
        }));

    } else {

        setForm((prev) => ({
            ...prev,

            notes: [
                ...prev.notes,
                newNote
            ]
        }));
    }

    setNoteTitle('');
    setNoteTitleTa('');

    setNoteDescription('');
    setNoteDescriptionTa('');

    setNoteForm({
        descriptions: []
    });

    setIsEditNotes(false);
    setNotesId('');
};
    const handleDeleteContent = (idToDelete) => {
        const updatedContent = noteForm.descriptions
            .filter((notes) => notes.id !== idToDelete)
            .map((f, i) => ({
                ...f,
                id: i + 1,
            }));
        setNoteForm({ ...form, descriptions: updatedContent });
    }
    const handleDeleteNotes = (idToDelete) => {
        const updatedNotes = form.notes
            .filter((notes) => notes.id !== idToDelete)
            .map((f, i) => ({
                ...f,
                id: i + 1,
            }));
        setForm({ ...form, notes: updatedNotes });
    };
        const handlePatchNotes = (note) => {

        setIsEditNotes(true);

        setNotesId(note.id);

        setNoteTitle(
            note?.translations?.en?.title ||
            note?.title ||
            ''
        );

        setNoteTitleTa(
            note?.translations?.ta?.title ||
            ''
        );

        setNoteForm({
            descriptions: (
                note?.descriptions || []
            ).map((desc) => ({
                id: desc?.id,

                content:
                    desc?.translations?.en?.content ||
                    desc?.content ||
                    '',

                translations: {
                    en: {
                        content:
                            desc?.translations?.en?.content ||
                            desc?.content ||
                            ''
                    },

                    ta: {
                        content:
                            desc?.translations?.ta?.content ||
                            ''
                    }
                }
            }))
        });
    };
    // const handlePatchNotes = (note) => {
    //     setIsEditNotes(true)
    //     setNotesId(note.id)
    //     setNoteTitle(note.title);
    //     setNoteForm((prev) => ({
    //         ...prev,
    //         descriptions: note.descriptions,
    //     }));
    //     console.log('noteForm', noteForm)
    // }
    const viewJourney = async (id) => {
        try {
            //const payload = { params: { id } }
            const payload = { params: { id, admin: true }};
            const data = await apiRequest(apiRoutes.viewJourney, 'POST', payload, router);
            if (data?.response) {
                const journey = data?.data;
                setForm({
                    name:
                        journey?.translations?.en?.name ||
                        journey?.name ||
                        '',

                    nameTa:
                        journey?.translations?.ta?.name ||
                        '',

                    file:
                        journey?.file ||
                        '',

                    weight:
                        journey?.weight ?? '',

                    height:
                        journey?.height ?? '',

                    status:
                        journey?.status ||
                        '',

                    link:
                        journey?.link ||
                        '',

                    babyFruitSize:
                        journey?.translations?.en?.babyFruitSize ||
                        journey?.babyFruitSize ||
                        '',

                    babyFruitSizeTa:
                        journey?.translations?.ta?.babyFruitSize ||
                        '',

                    description:
                        journey?.translations?.en?.description ||
                        journey?.description ||
                        '',

                    descriptionTa:
                        journey?.translations?.ta?.description ||
                        '',

                    notes: (
                        journey?.notes || []
                    ).map(note => ({

                        id: note?.id,

                        title:
                            note?.translations?.en?.title ||
                            note?.title ||
                            '',

                        translations: {
                            en: {
                                title:
                                    note?.translations?.en?.title ||
                                    note?.title ||
                                    ''
                            },

                            ta: {
                                title:
                                    note?.translations?.ta?.title ||
                                    ''
                            }
                        },

                        descriptions: (
                            note?.descriptions || []
                        ).map(desc => ({

                            id: desc?.id,

                            content:
                                desc?.translations?.en?.content ||
                                desc?.content ||
                                '',

                            translations: {
                                en: {
                                    content:
                                        desc?.translations?.en?.content ||
                                        desc?.content ||
                                        ''
                                },

                                ta: {
                                    content:
                                        desc?.translations?.ta?.content ||
                                        ''
                                }
                            }

                        }))

                    })),

                    momType:
                        journey?.momType ||
                        '',

                    month:
                        journey?.month ||
                        '',

                    week:
                        journey?.week ||
                        '',

                    trimesterId:
                        journey?.trimesterId ||
                        '',

                    trimester:
                        TRIMESTER.find(
                            t => t.id === journey?.trimesterId
                        )?.label || '',

                    pregMom:
                        journey?.momType === 'pregMom',

                    newMom:
                        journey?.momType === 'newMom'
                });
                // setForm({
                //     name: journey?.name || '',
                //     file: journey?.file || '',
                //     weight: journey?.weight ?? '',
                //     height: journey?.height ?? '',
                //     status: journey?.status || '',
                //     link: journey?.link || '',
                //     babyFruitSize: journey?.babyFruitSize || '',
                //     description: journey?.description || '',
                //     notes: journey?.notes.map(note => ({
                //         id: note?.id,
                //         title: note?.title || '',
                //         descriptions: note.descriptions.map(desc => ({
                //             id: desc.id,
                //             content: desc.content || ''
                //         })) || []
                //     })) || [],
                //     momType: journey?.momType || '',
                //     month: journey?.month || '',
                //     week: journey?.week || '',
                //     trimesterId: journey?.trimesterId || '',
                //     trimester: TRIMESTER.find(t => t.id === journey?.trimesterId)?.label || '',
                //     pregMom: journey?.momType === 'pregMom',
                //     newMom: journey?.momType === 'newMom',
                // });

                setPreviewUrl(journey?.file || '');
                setViewJourneys(journey)
                setIsLoading(false)
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    const isValidWebsiteUrl = (value) => {
        try {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };
    const handleSubmit = async (e) => {
    e.preventDefault();

    setFormSubmitted(true);
    setButtonLoading(true);

    if (!form.momType) {
        showError('Please Select Mom Type');
        setButtonLoading(false);
        return;
    }

    if (
        !form.name ||
        !form.nameTa ||
        !form.file ||
        !form.description ||
        !form.descriptionTa ||
        (form.momType === 'pregMom' &&
            (!form.trimesterId ||
                !form.babyFruitSize ||
                !form.babyFruitSizeTa))
    ) {
        showError('Please fill all required English and Tamil fields');
        setButtonLoading(false);
        return;
    }

    const value = (form?.link || '')
        .trim()
        .replace(/\s+/g, '');

    if (value && !isValidWebsiteUrl(value)) {
        showError('Enter a valid website URL (http or https)');
        setButtonLoading(false);
        return;
    }

    /*
     * IMPORTANT:
     * If user entered note title + description
     * but did not click "Add another note",
     * create the note automatically.
     */
    let finalNotes = [...form.notes];

    if (
        noteTitle.trim() &&
        noteTitleTa.trim() &&
        noteForm.descriptions.length > 0
    ) {
        const newNote = {
            id:
                finalNotes.length > 0
                    ? finalNotes[finalNotes.length - 1].id + 1
                    : 1,

            title: noteTitle,

            translations: {
                en: {
                    title: noteTitle
                },
                ta: {
                    title: noteTitleTa
                }
            },

            descriptions: noteForm.descriptions
        };

        if (isEditNotes) {
            finalNotes = finalNotes.map((note) =>
                note.id === notesId
                    ? newNote
                    : note
            );
        } else {
            finalNotes.push(newNote);
        }
    }

    /*
     * Notes are still required.
     */
    if (finalNotes.length === 0) {
        showError('Please add at least one note');
        setButtonLoading(false);
        return;
    }

    let updateForm;

    if (isEdit && viewJourneys) {
        const isFileChanged =
            form.file !== viewJourneys.file;

        updateForm = {
            ...viewJourneys,
            ...form,
            notes: finalNotes,
            fileChanged: isFileChanged,
        };
    } else {
        updateForm = {
            ...form,
            notes: finalNotes,
        };
    }

    const formData = objectToFormData(updateForm);

    /*
     * English + Tamil fields
     */
    formData.set('name', form.name);
    formData.set('nameTa', form.nameTa);

    formData.set(
        'babyFruitSize',
        form.babyFruitSize || ''
    );

    formData.set(
        'babyFruitSizeTa',
        form.babyFruitSizeTa || ''
    );

    formData.set(
        'description',
        form.description
    );

    formData.set(
        'descriptionTa',
        form.descriptionTa
    );

    /*
     * Notes with English + Tamil
     */
    formData.set(
        'notes',
        JSON.stringify(finalNotes)
    );

    formData.set(
        'momType',
        form.momType
    );

    formData.set(
        'status',
        form.status
    );

    formData.set(
        'trimesterId',
        form.trimesterId || ''
    );

    formData.set(
        'weight',
        form.weight || ''
    );

    formData.set(
        'height',
        form.height || ''
    );

    formData.set(
        'week',
        form.week || ''
    );

    formData.set(
        'month',
        form.month || ''
    );

    formData.set(
        'link',
        form.link || ''
    );

    if (isEdit) {
        formData.set('id', id);

        formData.set(
            'fileChanged',
            String(updateForm.fileChanged)
        );
    }

    console.log('========== JOURNEY FORM DATA ==========');

    for (const [key, value] of formData.entries()) {
        console.log(key, value);
    }

    manageJourney(formData);
};
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setFormSubmitted(true);
    //     setButtonLoading(true);
    //     if (!form.momType) {
    //         showError('Please Select Mom Type');
    //         return;
    //     }
    //     console.log('form', form);
    //     if (
    //             !form.name ||
    //             !form.nameTa ||
    //             !form.file ||
    //             !form.description ||
    //             !form.descriptionTa ||
    //             !form.babyFruitSize ||
    //             !form.babyFruitSizeTa ||
    //             (form.momType === 'pregMom' &&
    //                 (!form.trimesterId))
    //         ) {
    //             showError('Please fill all required English and Tamil fields');
    //             setButtonLoading(false);
    //             return;
    //         }
    //     const value = (form?.link || "").trim().replace(/\s+/g, "");
    //     console.log("URL value:", value);

    //     if (value && !isValidWebsiteUrl(value)) {
    //         showError("Enter a valid website URL (http or https)");
    //         setButtonLoading(false);
    //         return;
    //     }

    //     if (form.notes.length === 0) {
    //         showError('Please add at least one note');
    //         setButtonLoading(false);
    //         return;
    //     }
    //     let updateForm;
    //     if (isEdit && viewJourneys) {
    //         const isFileChanged = form.file !== viewJourneys.file;

    //         updateForm = {
    //             ...viewJourneys,
    //             ...form,
    //             fileChanged: isFileChanged,
    //         };
    //     } else {
    //         updateForm = {
    //             ...form,
    //         };
    //     }
    //     // const formData = objectToFormData(updateForm)
    //     // manageJourney(formData);
    //     const formData = objectToFormData(updateForm);

    //     formData.set('name', form.name);
    //     formData.set('nameTa', form.nameTa);

    //     formData.set(
    //         'babyFruitSize',
    //         form.babyFruitSize || ''
    //     );

    //     formData.set(
    //         'babyFruitSizeTa',
    //         form.babyFruitSizeTa || ''
    //     );

    //     formData.set(
    //         'description',
    //         form.description
    //     );

    //     formData.set(
    //         'descriptionTa',
    //         form.descriptionTa
    //     );

    //     formData.set(
    //         'notes',
    //         JSON.stringify(form.notes)
    //     );

    //     formData.set(
    //         'momType',
    //         form.momType
    //     );

    //     formData.set(
    //         'status',
    //         form.status
    //     );

    //     formData.set(
    //         'trimesterId',
    //         form.trimesterId || ''
    //     );

    //     formData.set(
    //         'weight',
    //         form.weight || ''
    //     );

    //     formData.set(
    //         'height',
    //         form.height || ''
    //     );

    //     formData.set(
    //         'week',
    //         form.week || ''
    //     );

    //     formData.set(
    //         'month',
    //         form.month || ''
    //     );

    //     formData.set(
    //         'link',
    //         form.link || ''
    //     );

    //     if (isEdit) {

    //         formData.set('id', id);

    //         formData.set(
    //             'fileChanged',
    //             String(updateForm.fileChanged)
    //         );
    //     }

    //     console.log('========== JOURNEY FORM DATA ==========');

    //     for (const [key, value] of formData.entries()) {
    //         console.log(key, value);
    //     }

    //     manageJourney(formData);
    // }
    const manageJourney = async (formData) => {
        const action = isEdit ? apiRoutes.updateJourney : apiRoutes.addJourney;
        try {
            const data = await apiRequest(action, 'POST', formData, router);
            if (data?.response) {
                console.log('journey', data);
                const message = isEdit ? 'Journey updated successfully!' : 'Journey added successfully!';
                showSuccess(message);
                router.push('/journey');
            }
        } catch (error) {
            console.log('error', error);
        } finally {
            setFormSubmitted(false);
        }
        setButtonLoading(false);
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
            ) : (
                <div className="d-flex gap-2">
                    <form className="custom-form gap-2" style={{ width: '30%' }} onSubmit={handleSubmit}>
                        <label className="mt-0" style={{ fontSize: '13px', fontWeight: '500' }}>Mom Type</label>
                        <div className="d-flex gap-3 mt-1">
                            <RadioGroup
                                name="momType"
                                options={momTypeOptions}
                                selectedValue={form.momType}
                                onChange={handleMomTypeChange}
                                required
                            />
                        </div>
                        <div className="mt-2">
                            <Input
                                placeholder=""
                                name="name"
                                label="Journey Name"
                                disabled={!form.momType}
                                value={form.name}
                                required={true}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="mt-2">
                            <Input
                                placeholder=""
                                name="nameTa"
                                label="Journey Name (Tamil)"
                                disabled={!form.momType}
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
                        <div className="mt-2">
                            <FileUpload
                                label="Thumbnail"
                                format='image'
                                parentFile={previewUrl}
                                required={true}
                                formSubmitted={formSubmitted}
                                disabled={!form.momType}
                                onFileSelect={(file) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    setForm({ ...form, file });
                                    setPreviewUrl(previewUrl)
                                }}
                            />
                        </div>
                        {form.momType === 'pregMom' && (
                            <>
                                <div className="d-flex gap-2 mb-2 mt-2">
                                    <div style={{ flex: 1 }}>
                                        <Input
                                            placeholder=""
                                            name="weight"
                                            label="Weight(Kg)"
                                            disabled={!form.momType}
                                            value={form.weight}
                                            required={false}
                                            formSubmitted={formSubmitted}
                                            onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Input
                                            placeholder=""
                                            name="height"
                                            label="Height(cm)"
                                            disabled={!form.momType}
                                            value={form.height}
                                            required={false}
                                            formSubmitted={formSubmitted}
                                            onChange={(e) => setForm({ ...form, height: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mb-2 mt-2">
                                    <div style={{ flex: 1 }}>
                                        <AutoCompleteInput
                                            label="Trimester"
                                            options={TRIMESTER}
                                            required={true}
                                            disabled={!form.momType}
                                            formSubmitted={formSubmitted}
                                            onSelect={handleSelectTrimester}
                                            //value={form.trimester}
                                            value={form.trimesterName}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Input
                                            placeholder=""
                                            name="babyFruitSize"
                                            label="Fruit Size"
                                            value={form.babyFruitSize}
                                            required={true}
                                            disabled={!form.momType}
                                            formSubmitted={formSubmitted}
                                            onChange={(e) => setForm({ ...form, babyFruitSize: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Input
                                            placeholder=""
                                            name="babyFruitSizeTa"
                                            label="Fruit Size (Tamil)"
                                            value={form.babyFruitSizeTa}
                                            required={true}
                                            disabled={!form.momType}
                                            formSubmitted={formSubmitted}
                                            tamilKeyboard={true}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    babyFruitSizeTa: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {form.momType === 'newMom' ? (
                            <div className="mt-3" >
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

                        <div className="mt-2">
                            <Input
                                placeholder=""
                                name="name"
                                label="Link"
                                disabled={!form.momType}
                                value={form.link}
                                required={true}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, link: e.target.value })}
                            />
                        </div>
                        <div className="mt-2">
                            <Textarea
                                placeholder=""
                                name="description"
                                label="Description"
                                disabled={!form.momType}
                                value={form.description}
                                required={true}
                                formSubmitted={formSubmitted}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <div className="mt-2">
                            <Textarea
                                placeholder=""
                                name="descriptionTa"
                                label="Description (Tamil)"
                                disabled={!form.momType}
                                value={form.descriptionTa}
                                required={true}
                                formSubmitted={formSubmitted}
                                tamilKeyboard={true}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        descriptionTa: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="d-flex justify-content-end align-items-center mt-2" style={{ position: 'sticky' }}>
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
                    <div className="d-flex flex-column gap-2" style={{ width: '70%' }}>
                        <div className="custom-form" >
                            <div style={{ border: 'none' }}>
                                <label htmlFor="Feature" className="form-label mb-3" style={{ minWidth: '100px' }}>
                                    Add Notes
                                </label>
                                <div>
                                    <Input
                                        placeholder=""
                                        name="noteTitle"
                                        label="Title"
                                        value={noteTitle}
                                        required={false}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                    />
                                </div>
                                <Input
                                    placeholder=""
                                    name="noteTitleTa"
                                    label="Title (Tamil)"
                                    value={noteTitleTa}
                                    required={false}
                                    tamilKeyboard={true}
                                    onChange={(e) =>
                                        setNoteTitleTa(e.target.value)
                                    }
                                />
                                <div className="d-flex gap-2 mb-2 mt-1" style={{ width: '100%' }}>
                                    <div style={{ width: '95%' }}>
                                        <Input
                                            placeholder=""
                                            name="noteDescription"
                                            label="Description"
                                            value={noteDescription}
                                            required={false}
                                            onChange={(e) => setNoteDescription(e.target.value)}
                                        />
                                    </div>
                                    <Input
                                        placeholder=""
                                        name="noteDescriptionTa"
                                        label="Description (Tamil)"
                                        value={noteDescriptionTa}
                                        required={false}
                                        tamilKeyboard={true}
                                        onChange={(e) =>
                                            setNoteDescriptionTa(e.target.value)
                                        }
                                    />
                                    <div style={{ width: '5%', marginTop: '24px' }}>
                                        <Button
                                            label="Add"
                                            type="button"
                                            color="#fff"
                                            size="small"
                                            onClick={handleAddDescription}
                                        />
                                    </div>
                                </div>
                            </div>

                            {noteForm.descriptions.length > 0 && (
                                <div className="mb-3" style={{ border: 'none' }}>
                                    <label
                                        htmlFor="Notes"
                                        className="form-label mb-0 pt-1"
                                        style={{ minWidth: '100px' }}
                                    >
                                        Contents
                                    </label>

                                    <div className="mt-2 ms-3"
                                        style={{
                                            maxHeight: '180px', overflow: 'auto'
                                        }}
                                    >
                                        <ul className="cursor"
                                            style={{
                                                listStyleType: 'circle',
                                                paddingLeft: '20px',
                                                marginBottom: 0,
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                maxWidth: '100%',
                                            }}
                                        >

                                            {noteForm.descriptions.map((note, index) => (
                                                <li
                                                    className='cursor'
                                                    key={note.id}
                                                    style={{
                                                        listStyleType: 'circle',
                                                    }}
                                                >
                                                    <div
                                                        className="d-flex justify-content-between align-items-center cursor"
                                                        style={{
                                                            borderBottom: index !== noteForm.descriptions.length - 1 ? '1px solid #ccc' : 'none',
                                                            paddingBottom: '6px',
                                                            paddingTop: '6px',
                                                        }}
                                                    >
                                                        <span>{note.content}</span>
                                                        <Image
                                                            src="/assets/icons/delete-icon.svg"
                                                            alt="icon"
                                                            width={18}
                                                            height={18}
                                                            className="ms-2"
                                                            onClick={() => handleDeleteContent(note.id)}
                                                        />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            <div className="d-flex justify-content-center align-items-center mt-2  cursor">
                                <Image
                                    src="/assets/icons/plus-icon.svg"
                                    alt="icon"
                                    width={18}
                                    height={18}
                                    className="ms-2"
                                // onClick={() => handleDeleteContent(note.id)}
                                />
                                <Button
                                    label="Add another note"
                                    type="button"
                                    size="small"
                                    backgroundColor="transparent"
                                    color={Colors.Primary2}
                                    onClick={handleAddNotes}
                                />
                            </div>
                        </div>
                        {form.notes.map((note) => (
                            <div
                                key={note.id}
                                className="card shadow-sm mt-2"
                                style={{ maxHeight: '400px', overflowY: 'auto' }}
                            >
                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="card-title mb-0">{note.title}</h5>
                                        <div className="d-flex gap-2 align-items-center cursor">
                                            <Image
                                                src="/assets/icons/edit-icon.svg"
                                                alt="edit icon"
                                                width={18}
                                                height={18}
                                                className="ms-2"
                                                onClick={() => handlePatchNotes(note)}
                                            />
                                            <Image
                                                src="/assets/icons/delete-icon.svg"
                                                alt="delete icon"
                                                width={18}
                                                height={18}
                                                className="ms-2"
                                                onClick={() => handleDeleteNotes(note.id)}
                                            />
                                        </div>
                                    </div>

                                    {note.descriptions.length > 0 && (
                                        <ul className="list-unstyled">
                                            {note.descriptions.map((desc) => (
                                                <li
                                                    key={desc.id}
                                                    className="mb-2 p-2 border rounded bg-light"
                                                    style={{ wordWrap: 'break-word' }}
                                                >
                                                    {desc.content}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            )
            }
        </div >
    )
}
{/* <div className="custom-form" style={{ width: '70%' }}>
    {noteForms.map((noteForm, idx) => {
        const savedNote = form.notes.find((n) => n.formId === noteForm.id);

        return (
            <div key={noteForm.id} className="mb-4 p-3" style={{ border: '1px dashed #ccc', borderRadius: 8 }}>
                <label className="form-label">Note {idx + 1}</label>
                <Input
                    name={`noteTitle-${noteForm.id}`}
                    label="Title"
                    value={noteForm.title}
                    onChange={(e) => {
                        const updated = [...noteForms];
                        updated[idx].title = e.target.value;
                        setNoteForms(updated);
                    }}
                />

                <Input
                    name={`noteDesc-${noteForm.id}`}
                    label="Description"
                    value={noteForm.description}
                    onChange={(e) => {
                        const updated = [...noteForms];
                        updated[idx].description = e.target.value;
                        setNoteForms(updated);
                    }}
                />

                <div className="d-flex justify-content-end mt-2">
                    <Button
                        label="Add"
                        type="button"
                        size="small"
                        backgroundColor="#209dff"
                        onClick={() => handleAddNotes()}
                    />
                </div>

                {savedNote && (
                    <div
                        className="mt-3 p-2 d-flex justify-content-between align-items-start"
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: 8,
                        }}
                    >
                        <div>
                            <p>{savedNote.title}</p>
                            <p className="mb-0">{savedNote.descriptions[0]?.content}</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Image
                                src="/assets/icons/edit-icon.svg"
                                alt="edit"
                                width={18}
                                height={18}
                                onClick={() => {
                                    const updatedForms = [...noteForms];
                                    const index = noteForms.findIndex(f => f.id === noteForm.id);
                                    updatedForms[index] = {
                                        id: noteForm.id,
                                        title: savedNote.title,
                                        description: savedNote.descriptions[0]?.content,
                                    };
                                    setNoteForms(updatedForms);

                                    const updatedNotes = form.notes.filter(n => n.id !== savedNote.id);
                                    setForm(prev => ({ ...prev, notes: updatedNotes }));
                                }}
                                style={{ cursor: 'pointer' }}
                            />
                            <Image
                                src="/assets/icons/delete-icon.svg"
                                alt="delete"
                                width={18}
                                height={18}
                                onClick={() => {
                                    const updatedNotes = form.notes.filter(n => n.id !== savedNote.id);
                                    setForm(prev => ({ ...prev, notes: updatedNotes }));
                                }}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    })}
    <Button
        label="Add another note"
        type="button"
        size="small"
        backgroundColor="transparent"
        color="#209dff"
        onClick={() =>
            setNoteForms((prev) => [
                ...prev,
                { id: Date.now(), title: '', description: '' },
            ])
        }
    />
</div> */}
{/* <div className="position-sticky bottom-0 bg-white p-2 d-flex justify-content-center align-items-center mt-5 rounded-2" style={{ zIndex: 1030 }}>
                <Button
                    label="Save"
                    type="button"
                    color="#fff"
                    size="small"
                    backgroundColor="#209dff"
                    isLoading={buttonLoading}
                    onClick={handleSubmit}
                />
            </div> */}
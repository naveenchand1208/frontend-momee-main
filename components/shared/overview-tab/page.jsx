'use client';
import '../overview-tab/page.css';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';
import ChartComponent from '@/components/charts/page';
import DatePicker from '@/components/shared/date/page';
import CustomDialog from '@/components/shared/dialog/dialog';
import { formatDateTime } from '@/common/utils/util';
import { apiRequest } from '@/common/api/apiService';
import apiRoutes from '@/common/constants/apiRoutes';
import { useDispatch } from 'react-redux';
import { userProfileData } from '@/common/store/auth/authSlice';
export default function OverviewTab() {
    const { id } = useParams();
    const hasFetchedRef = useRef(false);
    const hasTrackerChart = useRef(false);
    const hasConsumptionChart = useRef(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedConsumptionDate, setSelectedConsumptionDate] = useState(new Date().toISOString().split('T')[0]);
    const [moodXAxisData, setMoodXAxisData] = useState([]);
    const [moodYAxisData, setMoodYAxisData] = useState([]);
    const [waterXAxisData, setWaterXAxisData] = useState([]);
    const [waterYAxisData, setWaterYAxisData] = useState([]);
    const [favBabyNames, setFavBabyNames] = useState({ type: "", babyNames: [] });
    const dispatch = useDispatch();
    const moodEmojiMap = {
        0: '😞', 1: '😰', 2: '😤', 3: '😡', 4: '😢',
        5: '😐', 6: '😴', 7: '🙂', 8: '😊', 9: '💪',
        10: '🙏', 11: '🏆', 12: '😃', 13: '🤩', 14: '❤️'
    };
    useEffect(() => {
        if (!hasFetchedRef.current && id) {
            fetchUserData(id);
            hasFetchedRef.current = true;
        }
    }, [id]);

    useEffect(() => {
        if (id && selectedDate) {
            fetchMoodData(id, selectedDate);
        };
    }, [id, selectedDate]);


    useEffect(() => {
        if (id && selectedConsumptionDate) {
            fetchWaterData(id, selectedConsumptionDate);
        }
    }, [id, selectedConsumptionDate]);


    const fetchUserData = async (id) => {
        setLoading(true);
        try {
            let data;
            try {
                const pregResponse = await apiRequest(apiRoutes.viewPregMom, 'POST', { params: { id } });
                if (pregResponse?.response) {
                    data = pregResponse.data;
                }
            } catch (e) {
                // const newResponse = await apiRequest(apiRoutes.viewNewMom, 'POST', { params: { id } });
                // if (newResponse?.response) {
                //     data = newResponse.data;
                // }
                console.log('view-api-error')
            }
            if (data) {
                setUserData(data);
                dispatch(userProfileData({
                    viewMomDetails: data,
                }));
            } else {
                console.error('User not found in either momType APIs.');
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };
    const fetchMoodData = async (id, date) => {
        try {
            const response = await apiRequest(apiRoutes.moodTrackerReport, 'POST', {
                params: { userId: id, pagination: 'true', page: '1', limit: '100' },
            });
            const docs = (response.data?.docs || []).filter(item => item.dateAndTime.split(' ')[0] === date);
            setMoodXAxisData(docs.map(d =>
                new Date(d.dateAndTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                })
            )
            );
            setMoodYAxisData(docs.map(d => Number(d.score)));
        } catch (error) {
            console.error('Error fetching mood data:', error);
        }
    };
    const fetchWaterData = async (id, date) => {
        try {
            const response = await apiRequest(apiRoutes.waterConsumptionReport, 'POST', {
                params: { userId: id, pagination: 'true', page: '1', limit: '100' },
            });
            const docs = response.data?.docs || [];
            const filteredDocs = docs.filter(doc => {
                const docDate = new Date(doc.createdAt).toISOString().split('T')[0];
                return docDate === date;
            });
            setWaterXAxisData(
                filteredDocs.map(d => new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
            );
            setWaterYAxisData(filteredDocs.map(d => d.volume));
        } catch (error) {
            console.error('Error fetching water data:', error);
        }
    };
    const fetchBabyNames = async (userId) => {
        try {
            const response = await apiRequest(
                apiRoutes.viewFavouriteBabyNames,
                "POST",
                { params: { userId } }
            );

            console.log("API RAW DATA >>> ", response?.data);

            const data = response?.data;

            if (!data) {
                setFavBabyNames({ type: "", babyNames: [] });
                return;
            }

            // FIXED: use babyNames array
            setFavBabyNames({
                type: data.type || "",
                babyNames: data.babyNames || []
            });

        } catch (error) {
            console.error("Error fetching baby names:", error);
            setFavBabyNames({ type: "", babyNames: [] });
        }
    };



    useEffect(() => {
        if (id) {
            console.log("ID VALUE >>>", id);
            fetchBabyNames(id);
        }
    }, [id]);


    useEffect(() => {
        if (id) {
            console.log("ID VALUE >>>", id);

            fetchBabyNames(id);
        }
    }, [id]);



    if (isLoading || !userData) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <CircularProgress />
            </div>
        );
    }
    // Access momType from fetched data
    const momType = userData?.momType;
    return (
        <div className="max-w-4xl mx-auto mt-10">
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
                <div className="row">
                    {/* user profile card */}
                    <div className="col-12 col-lg-4 bg-white p-3 mx-3 rounded">
                        <div className="text-center">
                            <img
                                className="menu-bar rounded-full cursor border border-gray-300 object-cover"
                                src={userData?.profile || "/assets/pregmom-profile.png"}
                                width={80}
                                height={80}
                                onClick={() => {
                                    setSelectedImage(userData?.profile || "/assets/pregmom-profile.png");
                                    setIsDialogOpen(true);
                                }}
                                onError={(e) => {
                                    e.target.src = "/assets/pregmom-profile.png";
                                }}
                                alt="Profile"
                            />
                            <div className="flexbox bb-1 mb-15 pt-2">
                                <div>
                                    <p className="fs-15" style={{ margin: 0 }}>
                                        <strong>{userData?.userName}</strong>
                                    </p>
                                    <p className="text-fade" style={{ margin: 0 }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            {userData?.email}
                                            <img
                                                src="/assets/icons/approved-icon.svg"
                                                alt="Approved"
                                                width={15}
                                                height={15}
                                                style={{ margin: 0 }}
                                            />
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive" style={{ margin: 2 }}>
                            <table className="table text-fade">
                                <tbody>
                                    <tr>
                                        <td>Types of Relation</td>
                                        <td> {userData?.relationType || '-'} </td>
                                    </tr>
                                    <tr>
                                        <td>Relation Name</td>
                                        <td> {userData?.relationName || '-'} </td>
                                    </tr>
                                    <tr>
                                        <td>Mobile</td>
                                        <td>{userData?.mobile || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td>Date of Birth</td>
                                        <td>{userData?.dob ?? '-'} | {userData?.age ?? '-'} years</td>
                                    </tr>
                                    <tr>
                                        <td>Height</td>
                                        <td>{userData?.height || '-'} cm</td>
                                    </tr>
                                    <tr>
                                        <td>Weight</td>
                                        <td>{userData?.Weight || '-'} kg</td>
                                    </tr>
                                    {/* <tr>
                                                <td>Subscription Details</td>
                                                <td>
                                                    {userData?.subscribed ? (
                                                        <div>
                                                            <div>{userData?.subscribedPlans[0]?.subscribedPlan?.planName ?? '-'}</div>
                                                            <div>Valid till {userData?.subscribedPlans[0]?.validaityEndDate}</div>
                                                        </div>
                                                    ) : (
                                                        'Not Subscribed'
                                                    )}
                                                </td>
                                            </tr> */}
                                </tbody>
                            </table>
                        </div>
                        {/* {momType === 'pregMom' && (
                            <div className="box-body">
                                <p style={{ marginTop: '10px' }}>Pregnancy Weeks : Week {userData?.completedWeeks || '-'}
                                    
                                </p>
                            </div>
                        )}

                        {userData?.completedWeeks && (
                            <div style={{ textAlign: "center", width: "100%", marginTop: "6px" }}>
                                <span
                                    style={{
                                        backgroundColor: "#FFF7C2",
                                        padding: "4px 12px",
                                        borderRadius: "5px",
                                        fontWeight: "600",
                                        fontSize: "13px",
                                        display: "inline-block",
                                    }}
                                >
                                    Trimester : {userData.completedWeeks <= 12
                                        ? "1st Trimester"
                                        : userData.completedWeeks <= 27
                                            ? "2nd Trimester"
                                            : "3rd Trimester"}
                                </span>
                            </div>
                        )} */}

                        {momType === 'pregMom' && (
                            <div
                                style={{
                                    backgroundColor: '#f794b9',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    color: 'white'
                                }}
                            >
                                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
                                    Pregnancy Weeks :  Week {userData?.completedWeeks || '-'}
                                </p>

                                {userData?.completedWeeks && (
                                    <span
                                        style={{
                                            marginTop: '10px',
                                            backgroundColor: '#20296E',
                                            padding: '4px 14px',
                                            borderRadius: '20px',
                                            fontWeight: '600',
                                            fontSize: '10px',
                                            display: 'inline-block',
                                        }}
                                    >
                                        Trimester : {userData.completedWeeks <= 12
                                            ? "1st Trimester"
                                            : userData.completedWeeks <= 27
                                                ? "2nd Trimester"
                                                : "3rd Trimester"}
                                    </span>
                                )}
                            </div>
                        )}


                        {/* device infos */}
                        <div>
                            <style jsx>{`
    .table-responsive::-webkit-scrollbar {
      display: none;
    }
    .table-responsive {
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none;    /* Firefox */
    }
  `}</style>
                            <div
                                className='table-responsive'
                                style={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    scrollBehavior: 'smooth',
                                    gap: '16px',
                                    marginTop: '20px',
                                    paddingBottom: '8px',
                                    WebkitOverflowScrolling: 'touch',
                                }}
                            >
                                {userData?.deviceInfos?.map((device, index) => {
                                    const deviceName = device.deviceName || device.device || "";
                                    const os = device.os?.toLowerCase() || "";
                                    const brand = device.deviceBrand?.toLowerCase() || "";
                                    const isWeb = deviceName.toLowerCase() === "web";
                                    const isAndroid = os === 'android';
                                    const isApple =
                                        os.includes('ios') || brand === 'apple';
                                    const icon = isAndroid
                                        ? '/assets/icons/android-icon.svg'
                                        : isApple
                                            ? '/assets/icons/apple-icon.svg'
                                            : isWeb
                                                ? '/assets/icons/web-icon.svg'
                                                : '/assets/icdeons/device-icon.svg';
                                    const osLabel = isAndroid ? 'Android' : isApple ? 'iOS' : isWeb ? "Web" : device.os || "Unknown";
                                    let version = device.osVersion ?? "-";
                                    if (isWeb && version) {
                                        const match = version.match(/\d+(\.\d+)?/);
                                        version = match ? match[0] : version;
                                    }
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '16px',
                                                borderRadius: '10px',
                                                backgroundColor: '#fff',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                width: '25%',
                                                minWidth: '180px',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <img
                                                src={icon}
                                                alt={`${osLabel} Icon`}
                                                style={{ width: '24px', height: '24px', marginRight: '10px' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '11px' }}>
                                                    {`${device.deviceBrand?.[0]?.toUpperCase() + device.deviceBrand?.slice(1)} (${device.os ?? '-'} ${version ?? '-'})`}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#888' }}>
                                                    Last Login:<br /> {formatDateTime(userData.updatedAt)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>

                    </div>
                    {/* pregnancy details */}
                    <div className="col-12 col-lg-7 p-3 bg-white rounded">
                        <h4 className="box-title">Pregnancy Details</h4>
                        <hr />
                        <div className="row">

                            {/* Common for pregMom only */}
                            {momType === 'pregMom' && (
                                <>
                                    <div className="col-md-4 mb-10">
                                        <h6 className="fs-15">Pregnancy Date:</h6>
                                        <p className="text-fade"> {userData?.pregnancyDate || '-'} </p>
                                    </div>
                                    <div className="col-md-4 mb-10">
                                        <h6 className="fs-15">Expected Delivery Date:</h6>
                                        <p className="text-fade"> {userData?.expectScanDeliveryDate || '-'} </p>
                                    </div>
                                    <div className="col-md-4 mb-10">
                                        <h6 className="fs-15">Blood Group:</h6>
                                        <p className="text-fade"> {userData?.bloodGroup || '-'} </p>
                                    </div>
                                    <div className="col-md-4 mb-10">
                                        <h6 className="fs-15">SAC Viable</h6>
                                        <p className="text-fade">{userData?.adequacyControlViable || '-'}</p>
                                    </div>
                                    <div className="col-md-4 mb-10">
                                        <h6 className="fs-15">Heart rate:</h6>
                                        <p className="text-fade">{userData?.heartRate || '-'}</p>
                                    </div>
                                    <div className="col-md-4 mb-10">
                                        <h6 className="fs-15">CRL (cm):</h6>
                                        <p className="text-fade">{userData?.crlCm || '-'}</p>
                                    </div>
                                </>
                            )}
                            {/* Common for both momTypes */}
                            {(momType === 'newMom' || momType === 'pregMom') && (
                                <>
                                    <div className="col-md-4 mb-10">
                                        <h6 className="fs-15">Any disabilities?</h6>
                                        <p className="text-fade">{userData?.disablities || '-'}</p>
                                    </div>
                                    <div className="col-md-6 mb-10">
                                        <h6 className="fs-15">No of Conception in Past</h6>
                                        <p className="text-fade">{userData?.totalNoOfConception || '-'}</p>
                                    </div>
                                    <div className="col-md-6 mb-10">
                                        <h6 className="fs-15">Any history of abortion?</h6>
                                        <p className="text-fade">{userData?.historyOrAbortion || '-'}</p>
                                        <h6 className="fs-15">Abortion Reason:</h6>
                                        <p className="text-fade">{userData?.reason || '-'}</p>
                                        <h6 className="fs-15">Total Abortion Count:</h6>
                                        <p className="text-fade">{userData?.totalAbortion || '-'}</p>
                                    </div>
                                    <div className="col-md-6 mb-10">
                                        <h6 className="fs-15">Any medical treatment during pregnancy?</h6>
                                        <p className="text-fade">{userData?.medicalTreatment || '-'}</p>
                                        <h6 className="fs-15">Name of Medical Treatment:</h6>
                                        <p className="text-fade">{userData?.nameOfTreatments || '-'}</p>
                                    </div>
                                </>
                            )}

                            {/* Only pregMom */}
                            {momType === 'pregMom' && (
                                <div className="col-md-6 mb-10">
                                    <h6 className="fs-15">Have you done confirmatory scan?</h6>
                                    <p className="text-fade">{userData?.scanConfirmation || '-'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* children details */}
                    <div className="col-12 col-lg-3 bg-white p-3 mt-3 mx-3 rounded" style={{ width: '33%' }}>
                        <h4 className="box-title">Childrens Details</h4>
                        <hr />
                        {userData?.childrensArray?.length > 0 ? (
                            userData?.childrensArray?.map((child, index) => (
                                <div key={index} className="d-flex flex-row align-items-start gap-3 mb-4">

                                    {/* Avatar */}
                                    <div>
                                        <img
                                            className="rounded-full"
                                            src="/assets/pregmom-profile.png"
                                            alt="child"
                                            width={40}
                                            height={40}
                                        />
                                    </div>
                                    {/* Info */}
                                    <div className="d-flex flex-column flex-grow-1 gap-2">
                                        {/* Child Info */}
                                        <div className="d-flex flex-row justify-content-between gap-3 flex-wrap">
                                            <div className="d-flex flex-column">
                                                <strong style={{ fontSize: '14px' }}>{child.childName ?? '-'}</strong>
                                                <span className="text-mute" style={{ fontSize: '12px' }}>{child.childType ?? '-'}</span>
                                                <span className="text-mute" style={{ fontSize: '12px' }}>{child.age ?? '-'}</span>
                                            </div>

                                            {/* Vaccination Info */}
                                            <div className="d-flex flex-column">
                                                <span style={{ fontSize: '12px', fontWeight: '500' }}>Vaccination Name:</span>
                                                <span className="text-mute" style={{ fontSize: '11px' }}>{child.vaccinationsName ?? '-'}</span>
                                            </div>
                                            <div className="d-flex flex-row justify-content-between gap-3 flex-wrap mt-1">
                                                <div className="d-flex flex-column">
                                                    <span style={{ fontSize: '12px', fontWeight: '500' }}>Blood Group:</span>
                                                    <span className="text-mute" style={{ fontSize: '12px' }}>{child.bloodGroup ?? '-'}</span>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <span style={{ fontSize: '12px', fontWeight: '500' }}>Date of Birth:</span>
                                                    <span className="text-mute" style={{ fontSize: '12px' }}>{child.dob ?? '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Completed Vaccination */}
                                        <div className="d-flex flex-row align-items-center gap-2" style={{ fontSize: '12px' }}>
                                            <span style={{ fontWeight: '500' }}>Completed All Vaccinations:</span>
                                            {child.completedAllvaccination === 'Yes' || child.completedAllvaccination === true ? (
                                                <img src="/assets/icons/checked-tick-icon.svg" alt="Completed" width={14} height={14} />
                                            ) : (
                                                <img src="/assets/icons/wrong-icon.svg" alt="Not Completed" width={14} height={14} />
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-mute" style={{ marginLeft: '80px', marginTop: '25px' }} >No data available</p>
                        )}
                    </div>
                    {/* sos member details */}
                    <div className="col-12 col-lg-4 bg-white p-3 mt-3 rounded">
                        <h4 className="box-title">SOS Member Details</h4>
                        <hr />
                        {userData?.sosMembersDetails?.length > 0 ? (
                            userData?.sosMembersDetails?.map((member, index) => (
                                <div className="d-flex align-items-center mb-30" key={index}>
                                    <div className="me-10 bg-lightest h-50 px-2 l-h-50 rounded text-center">
                                        <img
                                            className="menu-bar rounded-full"
                                            src="/assets/pregmom-profile.png"
                                            alt="logo"
                                            width={40}
                                            height={40}
                                        />
                                    </div>
                                    <div className="d-flex flex-column flex-grow-1 mt-3">
                                        <strong style={{ fontSize: '14px' }}>{member?.userName ?? '-'}</strong>
                                        <span className="text-mute" style={{ fontSize: '12px' }}>{member?.relationType ?? '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-mute" style={{ fontSize: '12px' }}>{member?.phone ?? '-'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-mute" style={{ marginLeft: '130px', marginTop: '25px' }}>No data available</p>
                        )}
                    </div>
                    {/*subscription plan details */}
                    {/* <div className="col-12 col-lg-3 bg-white p-3 mt-3 mx-3 rounded" style={{ width: '24%' }}>
                        <h4 className="box-title">Subscription Details</h4>
                        <hr />
                        {userData?.subscribedPlans?.length > 0 ? (
                            userData?.subscribedPlans?.map((plan, index) => (
                                <div key={index} className="d-flex flex-column mb-4 border p-2 rounded shadow-sm" style={{ backgroundColor: '#f9f9f9' }}>
                                    <h6 className=" fs-15 text-primary mb-2">Plan {index + 1}</h6>
                                    <div className="d-flex flex-column gap-2">
                                        <div className="text-fade">
                                            <b className="fs-15">Plan Name:</b> {plan.planName}
                                        </div>
                                        <div className="text-fade">
                                            <b className="fs-15">Plan Amount:</b> ₹{plan.planAmount}
                                        </div>
                                        <div className="text-fade">
                                            <b className="fs-15">Validity Start Date:</b> {plan.
                                                validityEndDate
                                                || '-'}
                                        </div>
                                        <div className="text-fade">
                                            <b className="fs-15">Validity End Date:</b> {plan.validityEndDate || '-'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted" style={{ marginLeft: '80px', marginTop: '25px' }}>No data available</p>
                        )}
                    </div> */}
                    <div className="col-12 col-lg-3 bg-white p-3 mt-3 mx-3 rounded" style={{ width: '24%' }}>
                        <h4 className="box-title">Subscription Details</h4>
                        <hr />
                        {userData?.subscribedPlans?.filter(plan => plan.validityStartDate && plan.validityEndDate).length > 0 ? (
                            userData?.subscribedPlans?.filter(plan => plan.validityStartDate && plan.validityEndDate).map((plan, index) => (
                                <div key={index} className="d-flex flex-column mb-4 border p-2 rounded shadow-sm" style={{ backgroundColor: '#f9f9f9' }}>
                                    <h6 className="fs-15 text-primary mb-2">Plan {index + 1}</h6>
                                    <div className="d-flex flex-column gap-2">
                                        <div className="text-fade">
                                            <b className="fs-15">Plan Name:</b> {plan.planName}
                                        </div>
                                        <div className="text-fade">
                                            <b className="fs-15">Plan Amount:</b> ₹{plan.planAmount}
                                        </div>
                                        <div className="text-fade">
                                            <b className="fs-15">Validity Start Date:</b> {plan.validityStartDate || '-'}
                                        </div>
                                        <div className="text-fade">
                                            <b className="fs-15">Validity End Date:</b> {plan.validityEndDate || '-'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted" style={{ marginLeft: '80px', marginTop: '25px' }}>No data available</p>
                        )}
                    </div>

                    {/* mood tracker chart */}
                    <div className="mt-4" style={{ width: '47%' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={(date) => {
                                        console.log('Fetching mood data for date:', date);
                                        setSelectedDate(date);
                                    }}
                                />
                            </div>
                            <ChartComponent
                                title="Mood Tracker"
                                type="area"
                                xAxisTitle="Time"
                                yAxisTitle="Mood Score"
                                xAxisData={moodXAxisData}
                                yAxisData={moodYAxisData}
                                tooltipPointerName="Mood"
                                tooltipFormat={(val) => {
                                    const moodEmojiMap = {
                                        0: '😞', 1: '😰', 2: '😤', 3: '😡', 4: '😢', 5: '😐', 6: '😴',
                                        7: '🙂', 8: '😊', 9: '💪', 10: '🙏', 11: '🏆', 12: '😃', 13: '🤩', 14: '❤️'
                                    };
                                    return `${moodEmojiMap[Math.round(val)] || ''} (${val})`;
                                }}
                                yAxisLabel={{
                                    formatter: (val) => moodEmojiMap[Math.round(val)] || '',
                                    style: { fontSize: '16px', colors: ['#333'] }
                                }}
                            />
                        </div>
                    </div>
                    {/* water consumption chart */}
                    <div className="mt-4" style={{ width: '47%' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                                <DatePicker
                                    value={selectedConsumptionDate}
                                    onChange={(date) => {
                                        console.log('Fetching water data for date:', date);
                                        setSelectedConsumptionDate(date);
                                    }}
                                />
                            </div>
                            <ChartComponent
                                title="Water Consumption"
                                type="area"
                                xAxisTitle="Time"
                                yAxisTitle="Water Consumed (L)"
                                xAxisData={waterXAxisData}
                                yAxisData={waterYAxisData}
                                tooltipPointerName="Litre"
                                tooltipFormat={(val) => `${val} L`}
                                yAxisLabel={{
                                    formatter: (val) => `${val}`,
                                    style: { fontSize: '12px', colors: ['#333'] }
                                }}
                            />
                        </div>
                    </div>
                    {momType === 'pregMom' && (
                        <div className="col-12 col-lg-3 bg-white p-3 mt-3 mx-3 rounded">
                            <h4 className="box-title">Trying to Conceive Past Dates</h4>
                            <hr />
                            <div className="d-flex flex-column gap-2">
                                {userData?.conceiveCycle?.length > 0 ? (
                                    userData?.conceiveCycle?.map((cycle, index) => (
                                        <div key={index} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="text-fade"><b className='fs-15'>Cycle:</b>   {cycle.cycleName}</div>
                                                <br></br>
                                                <div className="text-fade"><b className='fs-15'>Date:</b>  {cycle.cycleDate}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-mute" style={{ marginLeft: '25px', marginTop: '25px' }}>No data available</p>
                                )}
                            </div>
                        </div>
                    )}
                    <div
                        className="col-12 col-lg-3 bg-white p-4 mt-3 mx-3 rounded shadow"
                        style={{ width: "33%", minHeight: "260px" }}
                    >
                        <h4 className="box-title mb-3" style={{ fontWeight: 600 }}>
                            Favourite Baby Names
                        </h4>

                        <hr style={{ marginTop: "-5px" }} />

                        {favBabyNames?.babyNames?.length > 0 ? (
                            <>
                                <h6
                                    className="text-capitalize text-muted mb-3"
                                    style={{ letterSpacing: "0.3px" }}
                                >
                                    {favBabyNames.type} Names
                                </h6>

                                <div
                                    className="d-flex align-items-center gap-3 p-3 rounded"
                                    style={{
                                        background: "#f1f5f9",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                color: "#333",
                                                marginBottom: "2px",
                                            }}
                                        >
                                            {favBabyNames.babyNames[0]?.name}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-muted mt-4" style={{ fontSize: "14px" }}>
                                No favourite names added yet
                            </p>
                        )}
                    </div>
                </div>
            )}
            <CustomDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Preview Image"
                maxWidth="xs"
                content={
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={selectedImage?.trim() ? selectedImage : '/assets/pregmom-profile.png'}
                            alt="Full Image"
                            width={400}
                            height={400}
                            style={{
                                borderRadius: '50%',
                                objectFit: 'cover',
                                display: 'block',
                                margin: '0 auto',
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/assets/pregmom-profile.png';
                            }}
                        />
                    </div>
                }
            />
        </div >
    );
}
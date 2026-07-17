'use client';
import './page.css';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import Button from '@/components/shared/button/page';
import { getWeeks } from '@/common/utils/util';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import DashboardCard from '@/components/shared/dashboard-card/page';
import SkeletonCard from '@/components/loader/skeleton-dashboard-card/page';
import DirectApexChart from '@/components/charts/dynamic-chart/page';
import ChartsSkeletonCard from '@/components/loader/skeleton-dynamic-chart/page';
import ChartSkeletonCard from '@/components/loader/skeleton-dashboard-chart/page';
import TinyAgeRangeInput from '@/components/shared/age-range-input/page';
import ChartComponent from '@/components/charts/page';
import { showError } from '@/common/toast/toastService';
import SkeletonTinyAgeRangeInput from '@/components/loader/skeleton-age-input/page';
import { MarginOutlined } from '@mui/icons-material';
export default function UserCount() {
    const [isLoading, setIsLoading] = useState(false);
    const [isMainChartLoading, setIsMainChartLoading] = useState(false); // for inactive user chart
    const [isAgeRangeLoading, setIsAgeRangeLoading] = useState(false); // for age range chart
    const [isTrimesterLoading, setIsTrimesterLoading] = useState(false);
    const [isWeekLoading, setIsWeekLoading] = useState(false);
    const router = useRouter();
    const fetchedRef = useRef(false);
    const fetchedDataRef = useRef(null);
    const ageChartRef = useRef(null);
    const trimesterChartRef = useRef(null);
    const weekChartRef = useRef(null);
    const isDownloadingRef = useRef(false);
    const [selectedDateRange, setSelectedDateRange] = useState({ fromDate: '', toDate: '' });
    const [selectedAgeRange, setSelectedAgeRange] = useState({ fromAge: '', toAge: '' });
    const [ageRangeData, setAgeRangeData] = useState({ count: 0, userIds: [] });
    const [statusLabel, setStatusLabel] = useState('7D');
    const [selectedTrimester, setSelectedTrimester] = useState("");
    const [trimesterCount, setTrimesterCount] = useState(0);
    const [selectedWeek, setSelectedWeek] = useState('');
    const [weekCount, setWeekCount] = useState(0);
    const [usersCount, setUsersCount] = useState({
        totalActive: 0,
        totalInactive: 0,
        pregMomActive: 0,
        pregMomInactive: 0,
        newMomActive: 0,
        newMomInactive: 0,
    });
    const weekOptions = [
        { id: "clear", label: "Clear", value: "clear" },
        ...getWeeks()
    ];
    const [userTrendData, setUserTrendData] = useState({
        totalActive: {},
        totalInactive: {},
        pregMomActive: {},
        pregMomInactive: {},
        newMomActive: {},
        newMomInactive: {},
    });
    const breadcrumbItems = [
        { label: 'Report Management' },
        { label: 'User Analytics', href: '/user-analytics' },
    ];
    const breadcrumbAction = [
        {
            type: 'dateTabs',
            onChange: ({ type, fromDate, toDate }) => {

                setSelectedDateRange({ fromDate, toDate });
                if (type === 'Custom' && (!fromDate || !toDate)) {
                    return;
                }
                setStatusLabel(type || '7D');
                fetchUserCounts({ fromDate, toDate, type });
            },
        },
    ];
    const allCards = [
        {
            title: "Total Active Users",
            subTitle: "totalActive",
            count: usersCount.totalActive,
            iconPath: '/assets/icons/active-icon.svg'
        },
        {
            title: "Total Inactive Users",
            subTitle: "totalInactive",
            count: usersCount.totalInactive,
            iconPath: '/assets/icons/inactive-icon.svg'
        },
        {
            title: "Pregmom Active Users",
            subTitle: "pregMomActive",
            count: usersCount.pregMomActive,
            iconPath: '/assets/icons/active-icon.svg'
        },
        {
            title: "Pregmom Inactive Users",
            subTitle: "pregMomInactive",
            count: usersCount.pregMomInactive,
            iconPath: '/assets/icons/inactive-icon.svg'
        },
        {
            title: "Newmom Active Users",
            subTitle: "newMomActive",
            count: usersCount.newMomActive,
            iconPath: '/assets/icons/active-icon.svg'
        },
        {
            title: "Newmom Inactive Users",
            subTitle: "newMomInactive",
            count: usersCount.newMomInactive,
            iconPath: '/assets/icons/inactive-icon.svg'
        },
    ];
    const ageCard = [
        {
            title: "Age Range Count",
            subTitle: "Selected range",
            count: ageRangeData?.count || 0,
            iconPath: '/assets/icons/age-range-icon.svg'
        }
    ];
    const keyMap = {
        '7D': 'last7Days',
        '15D': 'last15Days',
        '1M': 'last1Month',
        '3M': 'last3Months',
        '6M': 'last6Months',
        '1Y': 'last1Year',
        'Custom': 'customRange',
    };
    const categories = ['7D', '15D', '1M', '3M', '6M', '1Y'];
    const selectedCategory = statusLabel;
    const currentKey = keyMap[selectedCategory] || 'customRange';
    let chartCategories = categories;
    let chartSeries = [
        {
            name: 'Total Inactive',
            data: categories.map(cat => Number(userTrendData.totalInactive?.[keyMap[cat]]?.count) || 0)
        },
        {
            name: 'Pregmom Inactive',
            data: categories.map(cat => Number(userTrendData.pregMomInactive?.[keyMap[cat]]?.count) || 0)
        },
        {
            name: 'Newmom Inactive',
            data: categories.map(cat => Number(userTrendData.newMomInactive?.[keyMap[cat]]?.count) || 0)
        }
    ];
    if (selectedCategory !== 'All') {
        chartCategories = [selectedCategory];
        chartSeries = [
            {
                name: 'Total Inactive Users',
                data: [Number(userTrendData.totalInactive?.[currentKey]?.count) || 0]
            },
            {
                name: 'Pregmom Inactive Users',
                data: [Number(userTrendData.pregMomInactive?.[currentKey]?.count) || 0]
            },
            {
                name: 'Newmom Inactive Users',
                data: [Number(userTrendData.newMomInactive?.[currentKey]?.count) || 0]
            }
        ];
    }
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchUserCounts();
    }, []);
    useEffect(() => {
        if (weekCount && !isLoading) {
            weekChartRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [weekCount, isLoading]);
    const fetchAgeRangeData = async ({ fromAge, toAge }) => {
        try {
            setIsAgeRangeLoading(true);
            setIsMainChartLoading(true);
            const response = await apiRequest(apiRoutes.ageWiseUserReport, 'POST', {
                params: { fromAge, toAge }
            }, router);

            if (response?.response) {
                setAgeRangeData(response.data);
            }
            ageChartRef.current?.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            console.error('Failed to fetch age range data:', err);
        } finally {
            setIsAgeRangeLoading(false);
            setIsMainChartLoading(false);
        }
    };
    const fetchTrimesterCountData = async (trimester) => {
        try {
            setIsTrimesterLoading(true);
            const response = await apiRequest(apiRoutes.getTrimesterCount, "POST", {
                params: { trimester }
            });

            if (response?.response) {
                const count = response.data.trimesterCounts || 0;
                setTrimesterCount(count);
            }
            trimesterChartRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error("Error fetching trimester count:", err);
        } finally {
            setIsTrimesterLoading(false);
        }
    };
    const fetchWeekCountData = async (week) => {
        try {
            setIsWeekLoading(true);
            const response = await apiRequest(apiRoutes.getWeekCount, "POST", {
                params: { week }
            });

            if (response?.response) {
                const count = response.data.weekCounts || 0;
                setWeekCount(count);
            }
            weekChartRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Error fetching week count:", error);
        } finally {
            setIsWeekLoading(false);
        }
    };
    const fetchUserCounts = async ({ fromDate = '', toDate = '', type = null } = {}) => {
        try {
            setIsMainChartLoading(true);
            const isCustom = type === 'Custom' && !fromDate && !toDate;
            // Handle Custom Date Range
            if (isCustom) {
                const customKey = `${fromDate}_${toDate}`;

                // Use cache if available
                if (fetchedDataRef.current?.custom?.[customKey]) {
                    const cached = fetchedDataRef.current.custom[customKey];
                    setUsersCount(prev => ({ ...prev, ...cached.usersCount }));
                    setUserTrendData(prev => ({ ...prev, ...cached.userTrendData }));
                    setIsMainChartLoading(false);
                    return;
                }

                // Not cached — fetch inactive only
                const requests = [
                    { momType: '', label: 'totalInactive', api: apiRoutes.inActiveUsersCount },
                    { momType: 'pregMom', label: 'pregMomInactive', api: apiRoutes.inActiveUsersCount },
                    { momType: 'newMom', label: 'newMomInactive', api: apiRoutes.inActiveUsersCount }
                ];

                const responses = await Promise.all(
                    requests.map(({ momType, api }) =>
                        apiRequest(api, 'POST', { params: { momType, fromDate, toDate } }, router)
                    )
                );

                const newCounts = {
                    totalActive: usersCount.totalActive,
                    pregMomActive: usersCount.pregMomActive,
                    newMomActive: usersCount.newMomActive
                };
                const newTrendData = {};

                requests.forEach(({ label }, idx) => {
                    const res = responses[idx];
                    newCounts[label] = res?.data?.customRange?.count ?? 0;
                    newTrendData[label] = res?.data ?? {};
                });

                setUsersCount(prev => ({ ...prev, ...newCounts }));
                setUserTrendData(prev => ({ ...prev, ...newTrendData }));

                // Cache custom range
                if (!fetchedDataRef.current.custom) {
                    fetchedDataRef.current.custom = {};
                }
                fetchedDataRef.current.custom[customKey] = {
                    usersCount: newCounts,
                    userTrendData: newTrendData
                };

                setIsMainChartLoading(false);
                return;
            }

            // 🔹 All other tabs (7D, 15D, 1M, etc.) — Always fetch
            const isAllType = !type || type === 'All';
            const requests = [];

            if (isAllType) {
                // Fetch all (active + inactive)
                requests.push(
                    { momType: '', label: 'totalActive', api: apiRoutes.activeUsersCount },
                    { momType: 'pregMom', label: 'pregMomActive', api: apiRoutes.activeUsersCount },
                    { momType: 'newMom', label: 'newMomActive', api: apiRoutes.activeUsersCount },
                    { momType: '', label: 'totalInactive', api: apiRoutes.inActiveUsersCount, withDate: true },
                    { momType: 'pregMom', label: 'pregMomInactive', api: apiRoutes.inActiveUsersCount, withDate: true },
                    { momType: 'newMom', label: 'newMomInactive', api: apiRoutes.inActiveUsersCount, withDate: true }
                );
            } else {
                // Fetch only inactive for given range
                requests.push(
                    { momType: '', label: 'totalInactive', api: apiRoutes.inActiveUsersCount, withDate: true },
                    { momType: 'pregMom', label: 'pregMomInactive', api: apiRoutes.inActiveUsersCount, withDate: true },
                    { momType: 'newMom', label: 'newMomInactive', api: apiRoutes.inActiveUsersCount, withDate: true }
                );
            }

            const responses = await Promise.all(
                requests.map(({ momType, api, withDate }) => {
                    const params = withDate ? { momType, fromDate, toDate } : { momType };
                    return apiRequest(api, 'POST', { params }, router);
                })
            );

            const newCounts = {};
            const newTrendData = {};

            requests.forEach(({ label, withDate }, idx) => {
                const res = responses[idx];
                let count;

                if (withDate) {
                    const key = keyMap[type] || 'last7Days';
                    count = res?.data?.[key]?.count ?? 0;
                    newTrendData[label] = res?.data ?? {};
                } else {
                    count = res?.data?.count ?? res?.data?.counts ?? 0;
                    newTrendData[label] = res?.data ?? {};
                }

                newCounts[label] = count;
            });

            setUsersCount(prev => ({ ...prev, ...newCounts }));
            setUserTrendData(prev => ({ ...prev, ...newTrendData }));

            if (!fetchedDataRef.current) {
                fetchedDataRef.current = { custom: {} };
            }

            setIsLoading(false);
            setIsMainChartLoading(false);

        } catch (err) {
            console.error('Failed to fetch user counts:', err);
            setIsLoading(false);
            setIsMainChartLoading(false);
        }
    };
    const handleCardClick = (card) => {
        const dataKey = card.subTitle;
        if (dataKey === 'Selected range' || dataKey === 'ageRange') {
            const userIds = ageRangeData?.userIds;
            if (!userIds || userIds.length === 0) {
                showError("No user data available to export.");
                return;
            }
            handleExport(userIds);
            return;
        }
        const userData = userTrendData?.[dataKey]?.[currentKey] ?? userTrendData?.[dataKey];
        console.log("userData for export:", userData);

        const userIds = userData?.userIds;

        if (!userIds || userIds.length === 0) {
            showError("No user data available to export.");
            return;
        }
        handleExport(userIds);
    };
    const handleExport = async (userIds = []) => {
        if (!userIds || userIds.length === 0) {
            showError("No user data available to export.");
            return;
        }

        if (isDownloadingRef.current) return;
        isDownloadingRef.current = true;

        try {
            const payload = {
                params: {
                    userIds,
                },
            };

            await apiRequest(
                apiRoutes.getActiveInactiveUsersExcel,
                'POST',
                payload,
                router,
                'blob',
                'users.xlsx'
            );
        } catch (error) {
            console.log('Excel download error:', error);
            showError(error.message || 'Download failed');
        } finally {
            isDownloadingRef.current = false;
        }
    };
    const exportTrimesterData = async (trimester) => {
        if (isDownloadingRef.current) return;
        isDownloadingRef.current = true;

        if (trimesterCount === 0) {
            showError("No user data available to export.");
            isDownloadingRef.current = false; // release lock here
            return;
        }

        try {
            const payload = {
                params: {
                    trimester: trimester?.toString(),
                },
            };

            await apiRequest(
                apiRoutes.getTrimesterExcelReport,
                'POST',
                payload,
                router,
                'blob',
                'trimester_users.xlsx'
            );
        } catch (error) {
            console.error('Trimester Excel download error:', error);
            showError(error.message || 'Download failed');
        } finally {
            isDownloadingRef.current = false;
        }
    };
    const exportWeekData = async (week) => {
        if (isDownloadingRef.current) {
            console.log("Download already in progress, skipping...");
            return;
        }
        console.log("Export triggered for week:", week, "with weekCount:", weekCount);

        isDownloadingRef.current = true;

        if (weekCount === 0) {
            showError("No user data available to export.");
            isDownloadingRef.current = false; // release lock here
            return;
        }

        try {
            const payload = {
                params: {
                    week: week?.toString(),
                },
            };

            await apiRequest(
                apiRoutes.getWeekExcelReport,
                'POST',
                payload,
                router,
                'blob',
                'week_wise_report.xlsx'
            );
        } catch (error) {
            console.error('Week Excel download error:', error);
            showError(error.message || 'Download failed');
        } finally {
            isDownloadingRef.current = false;
        }
    };
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />
            <div className='cards-grid'>
                {isLoading
                    ? Array.from({ length: 6 }).map((_, idx) => (
                        <SkeletonCard key={idx} />
                    ))
                    : allCards.map((card, idx) => {
                        const { key, ...rest } = card;
                        return (
                            <div
                                key={idx}
                                className="cursor-pointer"
                            // onClick={() => handleCardClick(card)}
                            >
                                <DashboardCard {...rest} exportIcon={true} onExport={() => handleCardClick(card)} />
                            </div>
                        );
                    })}

            </div>
            <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '5px', maxWidth: "100%" }}>
                {isMainChartLoading ? (
                    <ChartsSkeletonCard />
                ) : (
                    <DirectApexChart
                        chartId="user-trend-chart"
                        title={`Inactive User Count - ${selectedCategory}`}
                        categories={chartCategories}
                        series={chartSeries}
                    />
                )}
            </div>
            <div
                className="mt-5"
                style={{
                    display: "flex",
                    flexWrap: "wrap", // allows wrapping on small screens
                    gap: "16px",
                    alignItems: "start",
                    justifyContent: "space-between",
                }}
            >
                {/* === LEFT COLUMN === */}
                <div
                    style={{
                        backgroundColor: "#c5eaf6ff",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        flex: "1 1 320px", // responsive width
                        minWidth: "300px",
                    }}
                >
                    <h6 className="text-sm text-black font-semibold mb-3">Trimester Wise User Count Report</h6>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: 'wrap' }}>
                        <select
                            value={selectedTrimester}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "clear") {
                                    setSelectedTrimester("");
                                    setTrimesterCount(0);
                                    return;
                                }
                                setSelectedTrimester(value);
                                fetchTrimesterCountData(value);
                            }}
                            style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                width: "140px",
                                fontSize: "14px",
                            }}
                        >
                            <option value="" disabled>Select</option>
                            <option value="1">Trimester 1</option>
                            <option value="2">Trimester 2</option>
                            <option value="3">Trimester 3</option>
                            <option value="clear">Clear</option>
                        </select>

                        <div
                            className="card-container"
                            style={{ width: "100%", maxWidth: "200px" }}
                            ref={trimesterChartRef}
                        >
                            {isLoading ? (
                                <SkeletonCard />
                            ) : (
                                <DashboardCard
                                    title={`Trimester ${selectedTrimester}`}
                                    iconPath={"/assets/icons/trimesters-icon.svg"}
                                    count={trimesterCount}
                                    exportIcon={true}
                                    onExport={() => exportTrimesterData(selectedTrimester)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* === RIGHT COLUMN === */}
                <div
                    style={{
                        backgroundColor: "#c5eaf6ff",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        flex: "1 1 320px",
                        minWidth: "300px",
                    }}
                >
                    <h6 className="text-sm text-black font-semibold mb-3">Week Wise Baby Count Report</h6>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: 'wrap' }}>
                        <select
                            value={selectedWeek}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "clear") {
                                    setSelectedWeek("");
                                    setWeekCount(0);
                                    return;
                                }
                                setSelectedWeek(val);
                                fetchWeekCountData(val);
                            }}
                            style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                width: "160px",
                                fontSize: "14px",
                            }}
                        >
                            <option value="" disabled>Select Week</option>
                            {weekOptions.map((week) => (
                                <option key={week.id} value={week.value}>
                                    {week.label}
                                </option>
                            ))}
                        </select>

                        <div
                            className="card-container"
                            style={{ width: "100%", maxWidth: "200px" }}
                            ref={weekChartRef}
                        >
                            {isLoading ? (
                                <SkeletonCard />
                            ) : (
                                <DashboardCard
                                    title={`Week ${selectedWeek}`}
                                    iconPath={"/assets/icons/week-icon.svg"}
                                    count={weekCount}
                                    exportIcon={true}
                                    onExport={() => exportWeekData(selectedWeek)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-5 bg-[#c5eaf6] p-4 rounded-lg shadow-md">
                <div className="flex flex-row gap-4">

                    {/* Left Side: 30% width - Input + Card in a column */}
                    <div className="flex flex-col gap-4 w-[20%] bg-[#c5eaf6] rounded-md p-2">

                        {/* Age Range Input */}
                        <div className="w-full">
                            {isLoading ? (
                                <SkeletonTinyAgeRangeInput />
                            ) : (
                                <TinyAgeRangeInput
                                    value={selectedAgeRange}
                                    onChange={(range) => {
                                        setSelectedAgeRange(range);
                                        const { fromAge, toAge } = range;
                                        if (fromAge && !toAge) {
                                            fetchAgeRangeData({ fromAge });
                                            return;
                                        }
                                        if (fromAge && toAge) {
                                            fetchAgeRangeData({ fromAge, toAge });
                                            return;
                                        }
                                        setAgeRangeData({ count: 0 });
                                    }}
                                />
                            )}
                        </div>

                        {/* Card */}
                        <div className="w-full">
                            {isLoading ? (
                                <SkeletonCard />
                            ) : (
                                ageCard.map((card, idx) => {
                                    const { key, ...rest } = card;
                                    return (
                                        <div key={idx} className="cursor-pointer">
                                            <DashboardCard
                                                {...rest}
                                                exportIcon={true}
                                                onExport={() => handleCardClick(card)}
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Side: 70% width - Chart */}
                    <div className="w-[80%]" ref={ageChartRef}>
                        {isAgeRangeLoading ? (
                            <ChartSkeletonCard />
                        ) : (
                            <ChartComponent
                                type="bar"
                                colors={['#211C84']}
                                title="Age Wise User Report"
                                xAxisData={[`${selectedAgeRange.fromAge}-${selectedAgeRange.toAge}`]}
                                yAxisData={[ageRangeData.count]}
                                yAxisTitle="User Count"
                                xAxisTitle="Age Range"
                                tooltipPointerName="Users"
                                tooltipFormat={(val) => `${val} user${val !== 1 ? 's' : ''}`}
                                yAxisLabel={{
                                    formatter: (val) => `${val}`,
                                    style: { fontSize: '14px', colors: ['#333'] },
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

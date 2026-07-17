'use client';
import Image from "next/image";
import '../components/shared/dashboard-card/page.css';
import { useSelector } from "react-redux";
import { useEffect, useRef, useState, useMemo } from "react";
import Tabs from "@/components/shared/custom-tab/page";
import DateRangePicker from "@/components/shared/date-range/page";
import apiRoutes from "@/common/constants/apiRoutes";
import { formatDate } from "@/common/utils/util";
import { apiRequest } from "@/common/api/apiService";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/shared/dashboard-card/page";
import SkeletonCard from "@/components/loader/skeleton-dashboard-card/page";
import KeywordSkeletonCard from "@/components/loader/skeleton-keyword-card/page";
import ChartSkeletonCard from "@/components/loader/skeleton-dashboard-chart/page";
import { Colors } from "@/common/constants/colorEnum";
import { showError } from "@/common/toast/toastService";
import ChartComponent from "@/components/charts/page";
import PieChartComponent from "@/components/charts/pie-chart/page";
import PieChartSkeletonCard from "@/components/loader/skeleton-dashboard-pie-chart/page";
import dynamic from 'next/dynamic';
import IndiaMap from "@/components/shared/IndiaMap";
import Heatmap from "@/components/heatmap/page";

const GeoHeatMap = dynamic(() => import('@/components/shared/GeoHeatMap'), {
  ssr: false,
});
export default function Home() {
  const router = useRouter();
  const fetchedRef = useRef(false);
  const isDownloadingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const hasCommunityLikedRef = useRef(false);
  const hasCommunityCommentRef = useRef(false);
  const hasCommunityCommentLikesRef = useRef(false);
  const { user, token } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState({ xAxis: [], yAxis: [] });
  const [selectedTab, setSelectedTab] = useState('Day');
  const [dateRange, setDateRange] = useState({ fromDate: "", toDate: "" });
  const [cards, setCards] = useState([]);
  const [articleViews, setArticleViews] = useState([]);
  const [communityViews, setCommunityViews] = useState([]);
  const [userCountData, setUserCountData] = useState({});
  const [communityCounts, setCommunityCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const tabs = [
    {
      tabName: 'Day',
      value: 'day',
      onClick: () => tabHandle('Day'),
    },
    {
      tabName: 'Week',
      value: 'week',
      onClick: () => tabHandle('Week'),
    },
    {
      tabName: 'Month',
      value: 'month',
      onClick: () => tabHandle('Month'),
    },
  ];
  const iconMap = [
    { iconPath: "/assets/icons/preg-mom-icon.svg", title: "Preg Mom" },
    { iconPath: "/assets/icons/new-mom-icon.svg", title: "New Mom" },
    { iconPath: "/assets/icons/articles-icon.svg", title: "Articles" },
    { iconPath: "/assets/icons/foods-to-avoid-icon.svg", title: "Food To Avoid" },
    { iconPath: "/assets/icons/foods-to-eat-icon.svg", title: "Food To Eat" },
    { iconPath: "/assets/icons/exercises-icon.svg", title: "Exercises" },
    { iconPath: "/assets/icons/music-playlists-icon.svg", title: "Musics" },
    { iconPath: "/assets/icons/podcasts-icon.svg", title: "PodCasts" },
    { iconPath: "/assets/icons/book-recommendations-icon.svg", title: "Books" },
    { iconPath: "/assets/icons/badges-icon.svg", title: "Badges" },
    { iconPath: "/assets/icons/community-icon.svg", title: "Community" },
    { iconPath: "/assets/icons/hospital-icon.svg", title: "Hospitals" },
    { iconPath: "/assets/icons/product-icon.svg", title: "Products" },
    { iconPath: "/assets/icons/orders-icon.svg", title: "Orders" },
    { iconPath: "/assets/icons/article-search-icon.svg", title: "Article Searches" },
    { iconPath: "/assets/icons/community-search-icon.svg", title: "Community Searches" },
    { iconPath: "/assets/icons/community-like-icon.svg", title: "Community Likes Count" },
    { iconPath: "/assets/icons/community-comment-icon.svg", title: "Community Comments Count" },
  ];
  const card = [
    {
      title: "Total Active Users",
      subTitle: "activeUsersCount",
      count: `${userCountData?.activeUsersCount ?? '-'}`,
      iconPath: '/assets/icons/active-icon.svg'
    },
    {
      title: "Total Inactive Users",
      subTitle: "inactiveUsersCount",
      count: `${userCountData?.inactiveUsersCount ?? '-'}`,
      iconPath: '/assets/icons/inactive-icon.svg'
    },
  ]
  const communityCard = [
    {
      title: "Total Community Likes",
      subTitle: "communityLikesCount",
      count: `${communityCounts?.communityLikesCount ?? '-'}`,
      iconPath: '/assets/icons/community-like-icon.svg'
    },
    {
      title: "Total Community Comments",
      subTitle: "communityCommentsCount",
      count: `${communityCounts?.communityCommentsCount ?? '-'}`,
      iconPath: '/assets/icons/community-comment-icon.svg'
    },
    {
      title: "Total Community Comments Likes",
      subTitle: "communityCommentsLikesCount",
      count: `${communityCounts?.communityCommentsLikesCount ?? '-'}`,
      iconPath: '/assets/icons/community-comment-like-icon.svg'
    },
  ]
  const keywordSections = [
    { title: 'Article Search Keywords:', data: articleViews, route: '/articles/keywords' },
    { title: 'Community Search Keywords:', data: communityViews, route: '/community/keywords' },
  ];
  useEffect(() => {
    console.log('User:', user);
    console.log('Token:', token);
  }, [user, token]);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUserReports();
  }, []);
  useEffect(() => {
    fetchUserReports();
  }, [selectedTab, dateRange]);
  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const activePayload = { params: { momType: '' } };
        const inactivePayload = { params: { momType: '' } };

        const [activeRes, inactiveRes] = await Promise.all([
          apiRequest(apiRoutes.activeUsersCount, 'POST', activePayload, router),
          apiRequest(apiRoutes.inActiveUsersCount, 'POST', inactivePayload, router),
        ]);

        if (activeRes?.response && inactiveRes?.response) {
          setUserCountData(prev => ({
            ...prev,
            activeUsersCount: activeRes?.data?.counts ?? 0,
            activeUsersIds: activeRes?.data?.userIds ?? [],
            inactiveUsersCount: inactiveRes?.data?.last7Days?.count ?? 0,
            inactiveUsersIds: inactiveRes?.data?.last7Days?.userIds ?? [],
          }));

        }
      } catch (err) {
        console.error('Failed to fetch user counts:', err);
      }
    };

    fetchUserCounts();
  }, []);
  const handleCardClick = (card) => {
    const dataKey = card.subTitle;
    let userIds = [];
    if (dataKey === 'activeUsersCount') {
      userIds = userCountData?.activeUsersIds ?? [];
    } else if (dataKey === 'inactiveUsersCount') {
      userIds = userCountData?.inactiveUsersIds ?? [];
    }
    console.log("Exporting userIds:", userIds);

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
      const payload = { params: { userIds } };
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
  const fetchUserReports = async () => {
    // setIsLoading(true);
    // const formatDate = (date) =>
    //   date ? new Date(date).toISOString().split('T')[0] : '';
    const type = tabs.find((item) => item.tabName === selectedTab)?.value;
    const payload = {
      params: {
        fromDate: formatDate(dateRange?.fromDate),
        toDate: formatDate(dateRange?.toDate),
        type: type || 'day',
      },
    };

    try {
      const data = await apiRequest(apiRoutes.userReport, 'POST', payload, router);

      if (data?.response) {
        let xAxis = data?.data?.map((item) => item._id);
        if (type === 'day') {
          xAxis = xAxis.map(date => date.split('-')[2])
        }
        if (type === 'week') {
          xAxis = xAxis.map((weekStr) => {
            const [year, week] = weekStr.split('-W');
            return `${year} - Week ${week}`;
          });
        }
        if (type === 'month') {
          xAxis = xAxis.map((dateStr) => {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'short' });
            return `${year}-${month}`;
          });
        }
        const yAxis = data?.data?.map((item) => item.count);
        setUserData({ xAxis: xAxis, yAxis: yAxis });
        console.log('type', type)
      }
    } catch (err) {
      console.error('Failed to fetch users report:', err);
    }
    finally {
      // setIsLoading(false);
    }
  };
  useEffect(() => {
    const data = {
      "response": true,
      "message": "Report Success",
      "data": [
        {
          "_id": "2025-W18",
          "count": 0
        },
        {
          "_id": "2025-W19",
          "count": 3
        },
        {
          "_id": "2025-W20",
          "count": 0
        },
        {
          "_id": "2025-W21",
          "count": 4
        },
        {
          "_id": "2025-W22",
          "count": 1
        }
      ]
    }
    const xAxis = data?.data?.map((item) => item._id);
    const yAxis = data?.data?.map((item) => item.count);
    setUserData({ xAxis: xAxis, yAxis: yAxis });
  }, [])
  useEffect(() => {
    if (hasCommunityLikedRef.current) return;
    hasCommunityLikedRef.current = true;
    const fetchCommunityLikesCounts = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(apiRoutes.communityLikesCount, 'POST', { params: {} });
        if (response) {
          console.log('response-like', response)
          setCommunityCounts(prev => ({
            ...prev,
            communityLikesCount: response?.data ?? 0,
          }));
        } else {
          console.error("Invalid response format", response);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunityLikesCounts();
  })
  useEffect(() => {
    if (hasCommunityCommentRef.current) return;
    hasCommunityCommentRef.current = true;
    const fetchCommunityCommentLikesCounts = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(apiRoutes.communityCommentsCount, 'POST', { params: {} });
        if (response) {
          console.log('response-comment', response)
          setCommunityCounts(prev => ({
            ...prev,
            communityCommentsCount: response?.data ?? 0,
          }));
        } else {
          console.error("Invalid response format", response);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunityCommentLikesCounts();
  })
  useEffect(() => {
    if (hasCommunityCommentLikesRef.current) return;
    hasCommunityCommentLikesRef.current = true;
    const fetchCommunityCommentLikesCounts = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(apiRoutes.communityCommentsLikesCount, 'POST', { params: {} });
        if (response) {
          console.log('response-comment', response)
          setCommunityCounts(prev => ({
            ...prev,
            communityCommentsLikesCount: response?.data ?? 0,
          }));
        } else {
          console.error("Invalid response format", response);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunityCommentLikesCounts();
  })
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    const fetchDashboardCounts = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(apiRoutes.getDashboardCountList, 'POST', { params: {} });
        if (response?.response) {
          // && Array.isArray(response.data)
          // const formattedCards = response.data.map(item => ({
          //   title: item.title,
          //   count: item.count,
          //   iconPath: iconMap[item.title]
          // }));
          // setCards(formattedCards);
          const formattedCards = response.data.result.reports.map(item => {
            const matchedIcon = iconMap.find(icon => icon.title === item.title);
            return {
              title: item.title,
              count: item.count,
              iconPath: matchedIcon?.iconPath || '/assets/icons/growth-icon.svg'
            };
          });
          setCards(formattedCards);
          setArticleViews(response.data.result.topArticles)
          setCommunityViews(response.data.result.topCommunites)
        } else {
          console.error("Invalid response format", response);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardCounts();
  }, []);
  const tabHandle = (tabName) => {
    console.log('tabName', tabName)
    if (tabName) {
      setSelectedTab(tabName)
      // fetchUserReports();
    }
  }
  const pieChartData = useMemo(() => {
    return cards.filter(card =>
      card.title === 'Preg Mom' || card.title === 'New Mom'
    ).map(card => ({
      title: card.title,
      count: Number(card.count?.toString().replace(/,/g, '')) || 0
    }));
  }, [cards]);
  return (
    <div>
      <div className="dashboard-card-grid">
        {isLoading
          ? Array.from({ length: 2 }).map((_, idx) => <SkeletonCard key={idx} />)
          : card.map((card, idx) => <DashboardCard key={idx} {...card} 
          // exportIcon={true} onExport={() => handleCardClick(card)} 
          />
          )}
      </div>
      <div className="dashboard-card-grid">
        {isLoading
          ? Array.from({ length: 2 }).map((_, idx) => <SkeletonCard key={idx} />)
          : communityCard.map((card, idx) => <DashboardCard key={idx} {...card} />
          )}
      </div>
      <div className="dashboard-card-grid">
        {isLoading
          ? Array.from({ length: 16 }).map((_, idx) => <SkeletonCard key={idx} />)
          :
          cards.map((card, idx) => <DashboardCard key={idx} {...card} />)}
      </div>
      <div style={{ display: 'flex', gap: '20px', padding: '10px 25px' }}>
        {isLoading
          ? Array.from({ length: 2 }).map((_, idx) => <KeywordSkeletonCard key={idx} />)
          :
          keywordSections.map((section, index) =>
            section.data.length > 0 ? (
              <div
                key={index}
                style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '10px',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '10px',
                    color: Colors.Primary1,
                  }}
                >
                  {section.title}
                </span>

                {/* Header Row */}
                <div
                  style={{
                    display: 'flex',
                    // fontWeight: '600',
                    marginBottom: '5px',
                  }}
                >
                  <div style={{ width: '90%' }}>Keyword</div>
                  <div style={{ width: '10%' }}>Views</div>
                </div>

                {/* Data Rows */}
                {section.data.map((view, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      marginBottom: '4px',
                      gap: '10px',
                      fontSize: '13px',
                      fontFamily: 'math',
                    }}
                  >
                    <div style={{ width: '90%', textAlign: 'start' }}>
                      {view.searchKey}
                    </div>
                    <div style={{ width: '10%', textAlign: 'center' }}>
                      {view.searchCount}
                    </div>
                  </div>
                ))}

                {/* View All */}
                <div onClick={() => router.push(section.route)}
                  style={{
                    color: '#6461c9',
                    textAlign: 'end',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  View All
                  <Image
                    className="cursor"
                    src={`/assets/icons/arrow-right-blue-icon.svg`}
                    alt="Image"
                    width={20}
                    height={20}
                    style={{ borderRadius: '50%' }}
                  />
                </div>
              </div>
            ) : null
          )}
      </div>
      {/* <div className="dashboard-card-grid">
        {cards.map((card, idx) => (
          <DashboardCard key={idx} {...card} />
        ))}
      </div> */}



      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#8080800d',
        borderRadius: '5px'
      }}>
        <div style={{
          width: '50%',
          marginTop: '10px',
          padding: '10px'
          // display: 'flex',
          // justifyContent: 'center'
        }}>
          <Heatmap />
        </div>
      </div>
    </div>
  );
}
//  <div className="flex flex-column"></div>


{/* <div
  className="d-flex"
  style={{
    width: '100%',
    justifyContent: 'flex-start',
    gap: '20px',
    marginLeft: '22px',
    flexWrap: 'wrap',
  }}
>
  <div
    style={{
      width: '100%',
      maxWidth: '580px',
      marginBottom: '20px',
    }}
  >
    {isLoading ? (
      <ChartSkeletonCard />
    ) : (
      <>
        <div style={{ position: 'relative', width: '100%' }}>
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '280px',
              right: '10px',
              zIndex: 10,
            }}
          >
            <div
              className="mt-0"
              style={{ marginLeft: '50px', fontSize: '12px', height: '5px' }}
            >
              <Tabs tabs={tabs} initialActive={0} selectedIndex="selectedTab" />
            </div>
          </div>
          <ChartComponent
            title="Total User Analytics"
            type="area"
            xAxisTitle="Time period"
            yAxisTitle="Users Count"
            xAxisData={userData.xAxis}
            yAxisData={userData.yAxis}
            tooltipPointerName="Users"
            tooltipFormat={(val) => `${val} users`}
            yAxisLabel={{
              formatter: (val) => `${val}`,
              style: { fontSize: '12px', colors: ['#333'] },
            }}
          />
        </div>
      </>
    )}
  </div>

  <div
    style={{
      width: '100%',
      maxWidth: '350px',
    }}
  >
    {isLoading ? (
      <PieChartSkeletonCard />
    ) : (
      <PieChartComponent
        title="User Distribution"
        labels={pieChartData.map((item) => item.title)}
        series={pieChartData.map((item) => item.count)}
      />
    )}
  </div>
</div> */}
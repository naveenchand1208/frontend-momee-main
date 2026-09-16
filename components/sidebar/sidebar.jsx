'use client'
import './sidebar.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Tooltip from '@mui/material/Tooltip';
import { useRouter, usePathname } from 'next/navigation';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import ConfirmationDialog from '@/components/shared/confirmation-dialog/confirmation-dialog';
import { logout } from '@/common/store/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function Sidebar({ ontoggle }) {

  const [isOpen, setIsOpen] = useState({});
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [subMenuLoading, setSubMenuLoading] = useState(false);
  const [link, setLink] = useState(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const unreadByUser = useSelector((state) => state.chatNotifications.unreadByUser);
  const unreadCount = Object.values(unreadByUser || {}).reduce((total, count) => total + count, 0);
  const menuItems = [
    { title: 'Dashboard', link: '/', iconName: '/assets/icons/dashboard-icon.svg', submenu: [], parentWithChilds: false },
    {

      title: 'User Management', link: '#', iconName: '/assets/icons/user-management-icon.svg', parentWithChilds: true, submenu: [
        { title: 'Preg Mom', link: '/preg-mom', iconName: '/assets/icons/preg-mom-icon.svg' },
        { title: 'New Mom', link: '/new-mom', iconName: '/assets/icons/new-mom-icon.svg' },
        { title: 'Subscriptions', link: '/subscription', iconName: '/assets/icons/subscription-icon.svg' },
        { title: 'Diet Plans', link: '/diet-plans', iconName: '/assets/icons/diet-plan-icon.svg' },
        { title: 'Exercise Plans', link: '/exercise-plan', iconName: '/assets/icons/exercise-plan-icon.svg' }
      ]
    },
    {
      title: 'Content Management', link: '#', iconName: '/assets/icons/content-management-icon.svg', parentWithChilds: true, submenu: [
        { title: 'Articles', link: '/articles', iconName: '/assets/icons/articles-icon.svg' },
        { title: 'Baby Animation', link: '/baby-animation', iconName: '/assets/icons/baby-animation-icon.svg', parentWithChilds: false, submenu: [] },
        { title: 'Baby Names', link: '/baby-names', iconName: '/assets/icons/baby-names-icon.svg', parentWithChilds: false, submenu: [] },
        { title: 'Badges', link: '/badges', iconName: '/assets/icons/badges-icon.svg' },
        { title: 'Banner', link: '/banner', iconName: '/assets/icons/banner-icon.svg' },
        { title: 'Book Recommendations', link: '/book-recommendations', iconName: '/assets/icons/book-recommendations-icon.svg' },
        { title: 'Community', link: '/community', iconName: '/assets/icons/community-icon.svg' },
        { title: 'Exercises', link: '/exercises', iconName: '/assets/icons/exercises-icon.svg' },
        { title: 'Foods To Avoid', link: '/food-to-avoid', iconName: '/assets/icons/foods-to-avoid-icon.svg' },
        { title: 'Foods To Eat', link: '/food-to-eat', iconName: '/assets/icons/foods-to-eat-icon.svg' },
        { title: 'Foods Template', link: '/food-template', iconName: '/assets/icons/food-template-icon.svg' },
        { title: 'Journey', link: '/journey', iconName: '/assets/icons/trimester-icon.svg' },
        { title: 'Live Classes', link: '/live-classes', iconName: '/assets/icons/live-class-icon.svg' },
        { title: 'Mood Quotes', link: '/mood-quotes', iconName: '/assets/icons/moodQuotes-icon.svg', parentWithChilds: false, submenu: [] },
        { title: 'Music Playlists', link: '/music-playlists', iconName: '/assets/icons/music-playlists-icon.svg' },
        { title: 'Podcasts', link: '/podcasts', iconName: '/assets/icons/podcasts-icon.svg' },
        { title: 'Workouts', link: '/workouts', iconName: '/assets/icons/workout-icon.svg' },

        // { title: 'Notifications', link: '/notifications', iconName: '/assets/icons/notifications-icon.svg' },
        // { title: 'Nearby Hospitals', link: '/nearby-hospitals', iconName: '/assets/icons/hospital-icon.svg' },
        // { title: 'Daily tips', link: '/daily-tips', iconName: '/assets/icons/daily-tips-icon.svg' },
        // { title: 'List of Categories', link: '/list-of-categories', iconName: '/assets/icons/categories-icon.svg' },
        // { title: 'Create a Trimester', link: '/create-trimester', iconName: '/assets/icons/trimester-icon.svg' },
        // { title: 'Create a Milestone', link: '/create-a-milestone', iconName: '/assets/icons/milestone-icon.svg' },
      ]
    },
    {
      title: 'Keywords', link: '#', iconName: '/assets/icons/keywords-icon.svg', parentWithChilds: true, submenu: [
        { title: 'Articles Keywords', link: '/articles/keywords', iconName: '/assets/icons/article-search-icon.svg' },
        { title: 'Community Keywords', link: '/community/keywords', iconName: '/assets/icons/community-search-icon.svg' },
      ]
    },
    { title: 'Hospitals', link: '/hospitals', iconName: '/assets/icons/hospital-icon.svg', parentWithChilds: false, submenu: [] },
    { title: 'SOS Requests', link: '/sos-requests', iconName: '/assets/icons/sos-request-icon.svg', parentWithChilds: false, submenu: [] },
    {
      title: 'Notifications', link: '#', iconName: '/assets/icons/notification-icon.svg', parentWithChilds: true, submenu: [
        { title: 'Chat Notifications', link: '/chat-notifications', iconName: '/assets/icons/notification-icon.svg' },
        { title: 'Custom Notifications', link: '/notifications', iconName: '/assets/icons/custom-notifications-icon.svg' }
      ]
    },
    {
      title: 'Products',
      link: '#', iconName: '/assets/icons/product-icon.svg',
      parentWithChilds: true,
      submenu: [
        { title: 'Product Listings', link: '/product-listings', iconName: '/assets/icons/product-list-icon.svg' },
        { title: 'Orders', link: '/orders', iconName: '/assets/icons/orders-icon.svg' },
        // { title: 'Inventory', link: '/inventory', iconName: '/assets/icons/inventory-icon.svg' },
      ],
    },
    {
      title: 'Reports',
      link: '#', iconName: '/assets/icons/reports-icon.svg',
      parentWithChilds: true,
      submenu: [
        // { title: 'User Reports', link: 'user-reports', iconName: '/assets/icons/use-reports-icon.svg' },
        // { title: 'Health Data Trends', link: 'health-data-trends', iconName: '/assets/icons/health-data-trends-icon.svg' },
        { title: 'User Plans', link: '/userplan', iconName: '/assets/icons/user-reports-icon.svg' },
        { title: 'User Diet Plans', link: '/user-dietplan', iconName: '/assets/icons/user-diet-plan-icon.svg' },
        { title: 'User Live Class Plans', link: '/user-liveclass', iconName: '/assets/icons/user-class-plan-icon.svg' },
        { title: 'User Analytics', link: '/user-analytics', iconName: '/assets/icons/user-analytics-icon.svg' },
        { title: 'Android Payment Logs', link: '/payment-logs', iconName: '/assets/icons/android-icon.svg' },
        { title: 'iOS Payment Logs', link: '/ios-payment-logs', iconName: '/assets/icons/apple-icon.svg' },
        { title: 'Notification Logs', link: '/notification-logs', iconName: '/assets/icons/notification-log-icon.svg' },
        { title: 'User Exercise Plans', link: '/user-exercise', iconName: '/assets/icons/user-exercise-plan-icon.svg' },
      ],
    },
    { title: 'Settings', link: '/settings', iconName: '/assets/icons/settings-icon.svg', parentWithChilds: false, submenu: [] },
    { title: 'App Update', link: '/app-update', iconName: '/assets/icons/settings-icon.svg', parentWithChilds: false, submenu: [] },
    {
      title: 'Feedback',
      link: '#', iconName: '/assets/icons/feedback-icon.svg',
      parentWithChilds: true,
      submenu: [
        { title: 'User Feedback', link: '/user-feedback', iconName: '/assets/icons/user-feedback-icon.svg' },
        // { title: 'App Improvement Suggestions', link: 'app-improvement-suggestions', iconName: '/assets/icons/app-improvement-icon.svg' },
      ],
    },

    //   {
    //   title: 'Chats',
    //   link: '#', iconName: '/assets/icons/feedback-icon.svg',
    //   parentWithChilds: true,
    //   submenu: [
    //     { title: 'Admin To User Chats', link: 'chat', iconName: '/assets/icons/user-feedback-icon.svg' },
    //     // { title: 'App Improvement Suggestions', link: 'app-improvement-suggestions', iconName: '/assets/icons/app-improvement-icon.svg' },
    //   ],
    // },
    // {
    //   title: 'Settings',
    //   link: '#', iconName: '/assets/icons/settings-icon.svg',
    //   parentWithChilds: true,
    //   submenu: [
    //     { title: 'General Settings', link: 'general-settings', iconName: '/assets/icons/general-settings-icon.svg' },
    //     { title: 'Payment Settings', link: 'payment-settings', iconName: '/assets/icons/payment-settings-icon.svg' },
    //     { title: 'Role Based Access Control', link: 'role-based-access-control', iconName: '/assets/icons/role-based-access-control-icon.svg' },
    //   ],
    // },
  ];
  useEffect(() => {
    setSubMenuLoading(false)
    setLink(null)
  }, [pathname])
  useEffect(() => {
    menuItems.forEach((item, parentIndex) => {
      item.submenu?.forEach((subItem, childIndex) => {
        if (pathname === subItem.link) {
          setIsOpen((prev) => ({ ...prev, [parentIndex]: true }));
        }
      });
    });
  }, [pathname]);
  const toggleSubmenu = (index) => {
    setIsOpen((prevState) => {
      if (prevState[index]) {
        return {};
      }
      return { [index]: true };
    });
  };
  const toggleSidebar = () => {
    const newValue = !isSideBarOpen;
    setIsSideBarOpen(newValue);
    ontoggle(isSideBarOpen);
  };
  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };
  const handleLogoutConfirm = async () => {
    const response = await apiRequest(apiRoutes.logout, 'POST', {}, router);
    if (response?.response) {
      dispatch(logout());
      localStorage.clear();
      router.push('/login');
    }
  };
  const handleLogoutCancel = () => {
    setIsLogoutDialogOpen(false);
  };
  return (
    <div
      className={isSideBarOpen ? 'sidebar' : 'sideclose'}
      style={{
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      {/* Header */}
      <div
        className={`heads d-flex align-items-center cursor ${isSideBarOpen ? 'justify-content-between' : 'justify-content-end'}`}
        style={{ padding: '21px', position: 'sticky', marginTop: '-10px', background: '#ffffff', zIndex: 1000 }}
      >
        {isSideBarOpen && (
          <div>
            <Image src="/assets/logo.png" alt="logo" width={100} height={86} priority />
          </div>
        )}
        <Image
          className="menu-bar"
          src="/assets/icons/menu-bar-icon.svg"
          alt="menu"
          width={28}
          height={28}
          onClick={toggleSidebar}
        />
      </div>

      {/* Scrollable Menu */}
      <div className="sidebar-menu-scroll" style={{ flexGrow: 1, overflowY: 'auto' }}>
        <ul className="nav flex-column cursor">
          {menuItems.map((item, index) => {
            const isActiveParent =
              pathname === item.link || item.submenu?.some((subItem) => pathname === subItem.link);

            return (
              <li className="nav-item" key={index}>
                <div
                  className="cursor"
                  onClick={() => {
                    if (item.submenu.length > 0) toggleSubmenu(index);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: isSideBarOpen ? 'space-between' : 'flex-end',
                    marginRight: item.parentWithChilds ? '' : '24px',
                  }}
                >
                  <Link
                    href={item.link}
                    className={`nav-link d-flex align-items-center cursor ${isActiveParent ? 'active-menu active-menu-bg' : ''}`}
                    onClick={() => {
                      if (item.link !== '#' && pathname !== item.link) {
                        setSubMenuLoading(true)
                        setLink(item.link)
                      } else {
                        setSubMenuLoading(false)
                      }
                    }}
                  >
                    {isSideBarOpen ? (
                      subMenuLoading && link === item.link ? (
                        <LoadingDots />
                      ) : (
                        < span className="cursor">{item.title}</span>
                      )
                    ) : (
                      item.iconName && (
                        <Tooltip title={item.title}>
                          <Image className="dashboard cursor" src={item.iconName} alt="Icon" width={25} height={25} />
                        </Tooltip>
                      )
                    )}
                  </Link>

                  {item.submenu.length > 0 && (
                    <span className="ms-2 d-flex justify-content-center align-items-center cursor">
                      <Image
                        src={
                          isOpen[index]
                            ? '/assets/icons/down-arrow-icon.svg'
                            : '/assets/icons/right-arrow-icon.svg'
                        }
                        alt="Arrow"
                        width={16}
                        height={16}
                      />
                    </span>
                  )}
                </div>

                {
                  item.submenu.length > 0 && isOpen[index] && (
                    <ul
                      className="nav flex-column ms-3"
                      style={{
                        listStyleType: isSideBarOpen ? 'circle' : '',
                        paddingLeft: isSideBarOpen ? '30px' : '180px',
                      }}
                    >
                      {item.submenu.map((subItem, subIndex) => {
                        const isActiveChild = pathname === subItem.link;
                        return (
                          <li className="nav-item cursor" key={subIndex}>
                            <Link
                              href={subItem.link}
                              className={`nav-link cursor ${isActiveChild ? 'active-menu' : ''}`}

                              onClick={() => {
                                if (pathname !== subItem.link) {
                                  setSubMenuLoading(true)
                                  setLink(subItem.link)
                                } else {
                                  setSubMenuLoading(false)
                                }
                              }}
                            >
                              {isSideBarOpen ? (
                                subMenuLoading && link === subItem.link ? (
                                  <LoadingDots />
                                ) : (
                                  <span>{subItem.title}</span>
                                )
                              ) : (
                                subItem.iconName && (
                                  <Tooltip title={subItem.title}>
                                    <Image
                                      className="dashboard"
                                      src={subItem.iconName}
                                      alt="Icon"
                                      width={20}
                                      height={20}
                                    />
                                  </Tooltip>
                                )
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )
                }
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout Button at Bottom */}
      <div style={{ padding: '1rem' }}>
        <div className="chat-notification-wrap">
          <button
            type="button"
            className={`chat-notification-btn ${!isSideBarOpen ? 'collapsed' : ''} ${pathname === '/chat-notifications' ? 'active' : ''}`}
            onClick={() => router.push('/chat-notifications')}
            aria-label="Chat notifications"
          >
            <span className="chat-notification-icon">
              <Image
                src="/assets/icons/notification-icon.svg"
                alt="notifications"
                width={24}
                height={24}
              />
              {unreadCount > 0 && (
                <span className="chat-notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
            {isSideBarOpen && <span>Chat Notifications</span>}
          </button>
        </div>

        {isSideBarOpen ? (
          <button
            className="cursor"
            onClick={handleLogoutClick}
            style={{
              backgroundColor: 'black',
              color: 'white',
              width: '100%',
              padding: '0.6rem',
              border: 'none',
              borderRadius: '6px',
            }}
          >
            Logout
          </button>
        ) : (
          <div className="cursor" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Logout">
              <Image
                src="/assets/icons/logout-icon.svg"
                alt="logout"
                width={50}
                height={28}
                style={{ marginRight: '2px' }}
                onClick={handleLogoutClick}
              />
            </Tooltip>
          </div>
        )}
      </div>

      {/* Logout Confirmation */}
      <ConfirmationDialog
        open={isLogoutDialogOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        cancelLabel="Cancel"
        confirmLabel="Logout"
      />
    </div >
  );

}


const LoadingDots = () => (
  <span className="loading-dots">
    <span className="dot">.</span>
    <span className="dot">.</span>
    <span className="dot">.</span>
  </span>
);

'use client';
import React from 'react';
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import { Colors } from '@/common/constants/colorEnum';
import { CircularProgress } from '@mui/material';
import Tabs from '@/components/shared/custom-tab/page';
import Diet_Food_Eat from '@/components/shared/diet-food-eat-tab/page';
import OverviewTab from '@/components/shared/overview-tab/page';
import Diet_Food_Avoid from '@/components/shared/diet-food-avoid-tab/page';
import ChatPage from '@/components/shared/chat-system/page';
import { useSelector } from 'react-redux';
import Custom_Exercise_Tab from '@/components/shared/custom-exercise-tab/page';
export default function NewMomView() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { viewMomDetails } = useSelector((state) => state.auth);
    const [selectedTab, setSelectedTab] = useState('Overview');
    const [isLoading, setLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [dietSubscription, setDietSubscription] = useState(false);
    const [exerciseSubscription, setExerciseSubscription] = useState(false);
    const [filteredTabs, setFilteredTabs] = useState([]);
    const breadcrumbItems = [
        { label: 'User Management' },
        { label: 'New Mom', href: '/new-mom' },
        { label: 'View', href: `/new-mom/${id}` }
    ];
    const breadcrumbAction = {
        label: 'Back',
        type: 'button',
        size: 'extraSmall',
        color: '#fff',
        isLoading: addLoading,
        backgroundColor: Colors.Primary1,
        onClick: () => handleReturnBack(),
    };
    const tabs = [
        {
            tabName: 'Overview',
            value: 'overview',
            onClick: () => tabHandle('Overview'),
        },
        {
            tabName: 'Food to eat',
            value: 'foodToEat',
            onClick: () => tabHandle('Food to eat'),
        },
        {
            tabName: 'Food to avoid',
            value: 'foodToAvoid',
            onClick: () => tabHandle('Food to avoid'),
        },
        {
            tabName: 'Chat System',
            value: 'chatSystem',
            onClick: () => tabHandle('Chat System'),
        },
        {
            tabName: 'Custom Exercise',
            value: 'customExercise',
            onClick: () => tabHandle('Custom Exercise'),
        }
    ];
    // useEffect(() => {
    //     const viewMom = viewMomDetails.viewMomDetails;
    //     const dietSubscription = viewMom?.dietSubscribed ?? false;
    //     setDietSubscription(dietSubscription);
    //     const exerciseSubscription = viewMom?.exerciseSubscribed ?? false;
    //     setExerciseSubscription(exerciseSubscription);
    //     if (!dietSubscription) {
    //         setFilteredTabs(tabs.filter(item => item.tabName === 'Overview' || item.tabName === 'Chat System'));
    //     } else {
    //         setFilteredTabs(tabs); // show all tabs
    //     }
    // }, [viewMomDetails]);
    useEffect(() => {
        const viewMom = viewMomDetails?.viewMomDetails;
        const hasDiet = viewMom?.dietOverview ?? false;
        const hasExercise = viewMom?.exerciseOverview ?? false;

        setDietSubscription(hasDiet);
        setExerciseSubscription(hasExercise);

        let allowedTabs = tabs.filter(tab => {
            if (
                (tab.tabName === 'Food to eat' || tab.tabName === 'Food to avoid') &&
                !hasDiet
            ) {
                return false;
            }
            if (
                tab.tabName === 'Custom Exercise' &&
                !hasExercise
            ) {
                return false;
            }
            return true; // allow all others
        });

        setFilteredTabs(allowedTabs);
    }, [viewMomDetails]);
    useEffect(() => {
        if (searchParams.get('tab') === 'chatSystem') {
            setSelectedTab('Chat System');
        }
    }, [searchParams]);

    const handleReturnBack = () => {
        router.push('/new-mom');
    }
    const tabHandle = (tabName) => {
        setSelectedTab(tabName);
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
                <div className="row">
                    <Tabs
                        tabs={filteredTabs}
                        initialActive={0}
                        selectedIndex={Math.max(filteredTabs.findIndex((tab) => tab.tabName === selectedTab), 0)}
                    />
                    {selectedTab === 'Overview' && (
                        <OverviewTab />)}
                    {selectedTab === 'Food to eat' && dietSubscription && (
                        <Diet_Food_Eat />
                    )}
                    {selectedTab === 'Food to avoid' && dietSubscription && (
                        <Diet_Food_Avoid />
                    )}
                    {selectedTab === 'Chat System' && (
                        <ChatPage />
                    )}
                    {selectedTab === 'Custom Exercise' && exerciseSubscription && (
                        <Custom_Exercise_Tab />
                    )}
                </div>
            )}
        </div >
    )
}





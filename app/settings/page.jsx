'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import Tabs from '@/components/shared/custom-tab/page';
import RichTextEditor from '@/components/shared/text-editor/page';
import Button from '@/components/shared/button/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { showError, showSuccess } from '@/common/toast/toastService';
import { Colors } from '@/common/constants/colorEnum';
export default function SettingsTabsPage() {
    const router = useRouter();
    const TABS = [
        { tabName: 'Terms & Condition', value: 'terms', id: 'Terms-18082025165117', addApi: apiRoutes.addTermsPolicy, viewApi: apiRoutes.viewTermsPolicy, updateApi: apiRoutes.updateTermsPolicy },
        { tabName: 'Privacy Policy', value: 'privacy', id: 'PrivacyPolicy-18082025184628', addApi: apiRoutes.addPrivacyPolicy, viewApi: apiRoutes.viewPrivacyPolicy, updateApi: apiRoutes.updatePrivacyPolicy },
        { tabName: 'Cancellation', value: 'cancel', id: 'CancellationPolicy-18082025184809', addApi: apiRoutes.addCancellationPolicy, viewApi: apiRoutes.viewCancellationPolicy, updateApi: apiRoutes.updateCancellationPolicy },
        { tabName: 'Refund Policy', value: 'refund', id: 'Refund-18082025185302', addApi: apiRoutes.addRefundPolicy, viewApi: apiRoutes.viewRefundPolicy, updateApi: apiRoutes.updateRefundPolicy },
    ];
    const [tabContents, setTabContents] = useState({
        terms: '',
        privacy: '',
        cancel: '',
        refund: '',
    });
    const [selectedTab, setSelectedTab] = useState(TABS[0]);
    const [editorValue, setEditorValue] = useState(tabContents.terms);
    const [isExistingPolicy, setIsExistingPolicy] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isLoading] = useState(false);
    const breadcrumbItems = [{ label: 'Settings', href: '/settings' }];
    const breadcrumbAction = {
        label: 'Back',
        type: 'button',
        size: 'extraSmall',
        backgroundColor: Colors.Primary1,
        onClick: () => router.push('/settings'),
    };
    useEffect(() => {
        setEditorValue(tabContents[selectedTab.value] || '');
    }, [selectedTab]);
     useEffect(() => {
        const fetchPolicy = async () => {
            const tab = selectedTab;
            try {
                const payload = { params: { id: tab.id } };
                const res = await apiRequest(tab.viewApi, 'POST', payload, router);
                const description = res?.data?.description;

                if (description) {
                    setEditorValue(description);
                    setIsExistingPolicy(true); // mark as update
                    setTabContents((prev) => ({
                        ...prev,
                        [tab.value]: description,
                    }));
                } else {
                    setEditorValue('');
                    setIsExistingPolicy(false); // mark as save
                }
            } catch (err) {
                console.log('Error fetching tab content:', err);
                setEditorValue('');
                setIsExistingPolicy(false); // mark as save
            }
        };

        fetchPolicy();
    }, [selectedTab]);
    const handleTabClick = (tab) => {
        setSelectedTab(tab);
    };
    const handleContentChange = (value) => {
        setEditorValue(value);
        setTabContents((prev) => ({
            ...prev,
            [selectedTab.value]: value,
        }));
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonLoading(true);

        const content = editorValue.trim();
        if (!content) {
            showError(`Please enter valid content for ${selectedTab.tabName}`);
            setButtonLoading(false);
            return;
        }
        const payload = isExistingPolicy
            ? { params: { id: selectedTab.id, description: content } }
            : { params: { description: content } };

        try {
            const api = isExistingPolicy ? selectedTab.updateApi : selectedTab.addApi;
            const data = await apiRequest(api, 'POST', payload, router);

            if (data?.response) {
                showSuccess(`${selectedTab.tabName} ${isExistingPolicy ? 'updated' : 'saved'} successfully!`);
            }
        } catch (error) {
            console.error('Update error:', error);
            showError('Failed to update content');
        } finally {
            setButtonLoading(false);
        }
    };
    return (
        <div className="max-w-6xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} actionButton={breadcrumbAction} />

            {/* Tabs */}
            <div className="mt-4">
                <Tabs
                    tabs={TABS.map((tab) => ({
                        ...tab,
                        onClick: () => handleTabClick(tab),
                    }))}
                    selectedIndex={TABS.findIndex((t) => t.value === selectedTab?.value)}
                />
            </div>

            {/* Editor */}
            {isLoading ? (
                <div className="flex justify-center items-center h-96">
                    <CircularProgress />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="flex justify-between flex-end mb-3">
                    </div>
                    <div className="custom-form editor-container" style={{ height: 'max-content' }}>
                        <RichTextEditor
                            height="400px"
                            value={editorValue}
                            onChange={handleContentChange}
                        />

                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                label={isExistingPolicy ? "Update" : "Save"}
                                type="submit"
                                size="small"
                                color="#fff"
                                backgroundColor={Colors.Primary2}
                                isLoading={buttonLoading}
                            />

                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

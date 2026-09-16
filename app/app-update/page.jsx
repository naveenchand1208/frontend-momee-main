'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import Breadcrumb from '@/components/shared/breadcrumb/page';
import Input from '@/components/shared/input/page';
import Textarea from '@/components/shared/textarea/page';
import Button from '@/components/shared/button/page';
import ToggleSwitch from '@/components/shared/toggle-switch/page';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { showSuccess } from '@/common/toast/toastService';
import { Colors } from '@/common/constants/colorEnum';

const PLATFORMS = ['android', 'ios'];
const PLATFORM_LABELS = { android: 'Android (Google Play)', ios: 'iOS (App Store)' };

export default function AppUpdatePage() {
    const router = useRouter();
    const [configs, setConfigs] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState({});

    const breadcrumbItems = [{ label: 'App Update' }];

    const load = async () => {
        setIsLoading(true);
        try {
            const res = await apiRequest(apiRoutes.getAppUpdateConfig, 'POST', { params: {} }, router);
            if (res?.response) {
                const docs = res.data?.docs || [];
                const byPlatform = {};
                docs.forEach((c) => { byPlatform[c.platform] = c; });
                setConfigs(byPlatform);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const updateField = (platform, field, value) => {
        setConfigs((prev) => ({ ...prev, [platform]: { ...prev[platform], [field]: value } }));
    };

    const save = async (platform) => {
        setSaving((prev) => ({ ...prev, [platform]: true }));
        try {
            const c = configs[platform] || {};
            const payload = {
                params: {
                    platform,
                    minVersion: c.minVersion,
                    latestVersion: c.latestVersion,
                    storeUrl: c.storeUrl,
                    updateMessage: c.updateMessage,
                    forceUpdateEnabled: c.forceUpdateEnabled,
                },
            };
            const res = await apiRequest(apiRoutes.updateAppUpdateConfig, 'POST', payload, router);
            if (res?.response) {
                setConfigs((prev) => ({ ...prev, [platform]: res.data }));
                showSuccess(`${PLATFORM_LABELS[platform]} config saved — takes effect on the app's next launch, no rebuild needed.`);
            }
        } finally {
            setSaving((prev) => ({ ...prev, [platform]: false }));
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-10">
            <Breadcrumb items={breadcrumbItems} />
            <p className="px-4 mt-2 mb-4" style={{ fontSize: '13px', color: '#6b7280' }}>
                Set the minimum app version allowed to run. Anyone below it is blocked with a mandatory update screen until they update — no rebuild needed.
            </p>

            <div className="px-4">
                {isLoading ? (
                    <div className="flex justify-content-center align-items-center" style={{ height: '256px' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div
                        className="d-grid gap-4"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}
                    >
                        {PLATFORMS.map((platform) => (
                            <PlatformCard
                                key={platform}
                                platform={platform}
                                config={configs[platform] || {}}
                                onChange={(field, value) => updateField(platform, field, value)}
                                onSave={() => save(platform)}
                                saving={!!saving[platform]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PlatformCard({ platform, config, onChange, onSave, saving }) {
    return (
        <div className="custom-form">
            <div className="d-flex align-items-center justify-content-between mb-3" style={{ gap: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{PLATFORM_LABELS[platform]}</h2>
                <label
                    className="d-flex align-items-center cursor"
                    style={{ gap: '8px', fontSize: '12.5px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}
                >
                    Force update on
                    <ToggleSwitch
                        isChecked={!!config.forceUpdateEnabled}
                        onToggle={(checked) => onChange('forceUpdateEnabled', checked)}
                    />
                </label>
            </div>

            <div className="mb-3">
                <Input
                    label="Minimum required version"
                    name={`minVersion-${platform}`}
                    placeholder="e.g. 1.0.5"
                    value={config.minVersion || ''}
                    onChange={(e) => onChange('minVersion', e.target.value)}
                />
            </div>

            <div className="mb-3">
                <Input
                    label="Latest version (shows a dismissible update prompt)"
                    name={`latestVersion-${platform}`}
                    placeholder="e.g. 1.0.6"
                    value={config.latestVersion || ''}
                    onChange={(e) => onChange('latestVersion', e.target.value)}
                />
            </div>

            <div className="mb-3">
                <Input
                    label="Store URL"
                    name={`storeUrl-${platform}`}
                    placeholder={platform === 'android'
                        ? 'https://play.google.com/store/apps/details?id=com.bhive.momee'
                        : 'https://apps.apple.com/in/app/momee/id<APP_STORE_ID>'}
                    value={config.storeUrl || ''}
                    onChange={(e) => onChange('storeUrl', e.target.value)}
                />
            </div>

            <div className="mb-3">
                <Textarea
                    label="Update screen message"
                    name={`updateMessage-${platform}`}
                    rows={3}
                    value={config.updateMessage || ''}
                    onChange={(e) => onChange('updateMessage', e.target.value)}
                />
            </div>

            <div className="d-flex justify-content-end mt-2">
                <Button
                    label={saving ? 'Saving…' : `Save ${PLATFORM_LABELS[platform].split(' ')[0]} config`}
                    type="button"
                    size="small"
                    color="#fff"
                    backgroundColor={Colors.Primary2}
                    isLoading={saving}
                    onClick={onSave}
                />
            </div>
        </div>
    );
}

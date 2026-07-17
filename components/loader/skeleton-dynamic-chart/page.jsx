'use client';
import React from 'react';

const ChartsSkeletonCard = () => {
    const barStyle = (width, height = '14px', color = '#e0e0e0') => ({
        width,
        height,
        backgroundColor: color,
        borderRadius: '4px',
    });

    // Scattered bar definitions with varying heights
    const bars = [
        { label: '7D', height: 40 },
        { label: '15D', height: 65 },
        { label: '1M', height: 50 },
        { label: '3M', height: 80 },
        { label: '6M', height: 60 },
        { label: '1Y', height: 75 },
    ];

    return (
        <div
            className="animate-pulse"
            style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '1rem',
                height: '350px',
                width: '100%',
                maxWidth: '100%',
                position: 'relative',
            }}
        >
            {/* Title Placeholder */}
            <div style={{ marginBottom: '1.2rem', ...barStyle('160px', '16px') }} />

            {/* Legend Placeholder */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.8rem' }}>
                <div style={barStyle('50px', '12px')} />
                <div style={barStyle('70px', '12px')} />
                <div style={barStyle('60px', '12px')} />
            </div>

            {/* Scattered Bar Chart Placeholder */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    height: '180px',
                    gap: '180px',
                    paddingBottom: '10px',
                    paddingLeft: '20px',
                }}
            >
                {bars.map((bar, idx) => (
                    <div key={idx} style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '28px',
                                height: `${bar.height}px`,
                                backgroundColor: '#dcdcdc',
                                borderRadius: '4px',
                                marginBottom: '6px',
                            }}
                        />
                        <div style={{ fontSize: '10px', color: '#aaa' }}>{bar.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChartsSkeletonCard;

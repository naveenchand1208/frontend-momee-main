'use client';
import React, { useEffect, useState } from 'react';

const AnimatedCounter = ({ count = 0, duration = 1000, className = '', style = {}, formatFn, prefix = '', suffix = '' }) => {
    const [displayCount, setDisplayCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseFloat(count);
        if (isNaN(end)) return;

        const incrementTime = 30;
        const steps = Math.ceil(duration / incrementTime);
        const increment = end / steps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayCount(end);
                clearInterval(timer);
            } else {
                setDisplayCount(start);
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [count, duration]);

    const formattedCount = formatFn
        ? formatFn(displayCount)
        : Math.floor(displayCount).toLocaleString();
    return (
        <div className={className} style={style}>
            {prefix}{formattedCount}{suffix}
        </div>
    );
};

export default AnimatedCounter;

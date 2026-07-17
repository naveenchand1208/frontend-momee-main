'use client';

import { useState, useEffect } from "react";
import './page.css';

export default function Tabs({ tabs = [], initialActive = 0, selectedIndex }) {
    const [activeIndex, setActiveIndex] = useState(initialActive);

    useEffect(() => {
        if (typeof selectedIndex === "number") {
            setActiveIndex(selectedIndex);
        } else {
            setActiveIndex(0);
        }
    }, [selectedIndex, initialActive]);

    const handleTabClick = (tab, index) => {
        setActiveIndex(index);
        if (typeof tab.onClick === "function") {
            tab.onClick();
        }
    };

    return (
        <div className="flex space-x-4 border-b border-[#cccccc52] mb-4">
            {tabs.map((tab, index) => (
                <div
                    key={tab.tabName}
                    onClick={() => handleTabClick(tab, index)}
                    className={`py-2 px-4 transition-colors cursor ${index === activeIndex
                        ? 'border-b-2 border-[blue] text-[blue] font-semibold'
                        : 'border-b-0 text-gray-600 hover:text-blue-500'
                        }`}
                >
                    {tab.tabName}
                </div>
            ))}
        </div>

    );
}

'use client';
import './page.css';
import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
export default function DailyTips() {
    const router = useRouter();
    const myTableData = [
        {
            id: 1, title: "Health Tip 1", date: "21 November, 2023", count: "45",
            background: "#76b7f6 "
        },
        {
            id: 2, title: "Exercise Tip 1", date: "21 November, 2023", count: "45",
            background: "#2f5db4  "
        },
        {
            id: 3, title: "Exercise Tip 1", date: "21 November, 2023", count: "45",
            background: "#d83740"
        },
        {
            id: 4, title: "Exercise Tip 1", date: "21 November, 2023", count: "45",
            background: "#f50ea0"
        },

    ];
    const handleWhiteHeart = (row) => {
        console.log('Parent received WhiteHEART action:', row);
    };
    const actionConfig = [
        { iconName: 'white-heart-icon', disabled: false, onClick: handleWhiteHeart },
    ];
    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="px-4 shadow rounded bg-white mb-3"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    background: '#fff'
                }}
            >
                <div className='d-flex justify-content-between align-items-center p-4'>
                    <div className='d-flex gap-2 align-items-center'>
                        <span><a href='/daily-tips'> Content Management
                        </a> / Daily Tips</span>
                    </div>
                </div>
            </div>
            <div className="row g-4">
                {myTableData.map((tips) => (
                    <div
                        key={tips.id}
                        className="col-md-12 col-lg-4"
                    >
                        <div
                            className="p-3 rounded-[12px] h-100 text-white"
                            style={{ backgroundColor: tips.background }}
                        >
                            <div className="box">
                                <p className='text-white'>
                                    <b>{tips.title}</b>
                                </p>
                                <p className='text-white'>
                                    Holisticly benchmark plug imperatives for multifunctional deliverables. Seamlessly incubate RubyX functional action.
                                </p>
                                <div className="row d-flex">
                                    <div className='col-8' >
                                        <p className=" text-white me-3" href="#">
                                            {tips.date}
                                        </p>
                                    </div>
                                    <div className="col-4 d-flex justify-content-end gap-2 ">
                                        {actionConfig.length > 0 &&
                                            actionConfig.map((action) => (
                                                <Image
                                                    key={action.iconName}
                                                    className=""
                                                    src={`/assets/icons/${action.iconName}.svg`}
                                                    alt="icon"
                                                    width={20}
                                                    height={20}
                                                />
                                            ))}
                                        <p>{tips.count}</p>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="d-flex justify-content-end gap-2 mt-3">
                                {actionConfig.length > 0 &&
                                    actionConfig.map((action) => (
                                        <Image
                                            key={action.iconName}
                                            className=""
                                            src={`/assets/icons/${action.iconName}.svg`}
                                            alt="icon"
                                            width={20}
                                            height={20}
                                        />
                                    ))}
                            </div> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}



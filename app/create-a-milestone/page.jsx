'use client';
import './page.css';
import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/button/page';
export default function CreateMilestone() {
    const router = useRouter();
    const myTableData = [
        {
            id: 1, name: "Milestone Name", trimester: "First Trimester", week: "4 Weeks",
            background: "#fcd3f8"
        },
        {
            id: 2, name: "Milestone Name", trimester: "Second Trimester", week: "16 Weeks",
            background: "#c9fafd"
        },

    ];
    const handleEdit = (row) => {
        console.log('Parent received EDIT action:', row);
    };
    const handleDelete = (row) => {
        console.log('Parent received DELETE action:', row);
    };
    const actionConfig = [
        { iconName: 'edit-icon', disabled: false, onClick: handleEdit },
        { iconName: 'delete-icon', disabled: false, onClick: handleDelete },
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
                        <span><a href='/create-a-milestone'> Content Management
                        </a> / Create Milestone</span>
                    </div>
                    <div className='d-flex gap-1'>
                        <Button
                            label="Create Milestone"
                            type="button"
                            color="#fff"
                            size='small'
                            backgroundColor="#0baee3"
                        />
                    </div>
                </div>
            </div>
            <div className="row g-4">
                {myTableData.map((milestone) => (
                    <div
                        key={milestone.id}
                        className="col-md-12 col-lg-6"
                    >
                        <div
                            className="p-4 rounded-[12px] h-100"
                            style={{ backgroundColor: milestone.background }}
                        >
                            <div className="bg-warning-light">
                                <h5>
                                    <a className="text-dark hover-danger" href="#">
                                        {milestone.name}
                                    </a>
                                </h5>
                                <div className='row'>
                                    <div className='col-9 d flex'>
                                        <p className='me-4'>{milestone.trimester}</p>
                                        <p className='badge '>
                                            {milestone.week}
                                        </p>
                                    </div>
                                    <div className="col-3 d-flex gap-2  ">
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
                                    </div>
                                </div>
                                <ul className="timeline">
                                    <li className="border-pink"><a href="#!">Physical Changes</a></li>
                                    <li className="border-blue"><a href="#!">Emotional Changes</a></li>
                                    <li className="border-green"><a href="#!">Body Changes and Comfort</a></li>
                                    <li className="border-orange"><a href="#!">Emotional Milestones</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    )

}



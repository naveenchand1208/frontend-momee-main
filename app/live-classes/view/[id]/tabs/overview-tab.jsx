import Button from "@/components/shared/button/page";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Colors } from "@/common/constants/colorEnum";
export default function OverviewTab({ viewLiveClasses }) {
    const router = useRouter();
    const [editLoading, setEditLoading] = useState(false);
    const handleEdit = () => {
        setEditLoading(true);
        router.push(`/live-classes/${viewLiveClasses?.id}`);
    };
    return (
        <div className="row mt-5 p-4" style={{ width: '100%' }}>
            <div className="custom-form row">
                <div className="d-flex flex-wrap">
                    <div className="col-12 col-md-4 text-center mb-3 mb-md-0">
                        <img
                            className="rounded border border-gray-300"
                            src={viewLiveClasses?.file || "/assets/articles-image.jpeg"}
                            alt="Meeting"
                            style={{ width: '170px', height: '170px', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="col-12 col-md-8">
                        <div className="row">
                            {[
                                { label: "Name", value: viewLiveClasses?.name },
                                { label: "Performed By", value: viewLiveClasses?.performedBy },
                                { label: "From Date", value: viewLiveClasses?.fromDate },
                                { label: "To Date", value: viewLiveClasses?.toDate },
                                { label: "Start Time", value: viewLiveClasses?.startTime },
                                { label: "End Time", value: viewLiveClasses?.endTime },
                                { label: "Amount", value: viewLiveClasses?.amount },
                                { label: "momType", value: viewLiveClasses?.momType },
                                { label: "Description", value: viewLiveClasses?.description },
                            ].map((item, idx) => (
                                <div key={idx} className="col-md-6 mb-3">
                                    <h6 className="fw-bold mb-1 fs-15">{item.label}:</h6>
                                    <p className="text-muted">{item.value || '-'}</p>
                                </div>
                            ))}
                            <div className="col-md-12 mb-3">
                                <h6 className="fw-bold mb-1 fs-15">Meeting URL:</h6>
                                <p className="text-muted mb-0">
                                    {viewLiveClasses?.MeetingLink ? (
                                        <a className="cursor"
                                            href={viewLiveClasses.MeetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ wordBreak: 'break-word', color: '#007bff' }}
                                        >
                                            {viewLiveClasses.MeetingLink}
                                        </a>
                                    ) : (
                                        '-'
                                    )}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="col-12 d-flex justify-content-end mt-3" style={{ gap: '5px' }}>
                    <Button
                        label="Edit"
                        type="submit"
                        size="extraSmall"
                        color="#fff"
                        onClick={handleEdit}
                        backgroundColor={Colors.Primary2}
                        disabled={false}
                    />
                </div>
            </div>

        </div>
    );
}

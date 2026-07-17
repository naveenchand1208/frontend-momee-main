'use client';
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import './page.css'; // Ensure custom styles are imported

// export default function DatePicker({ onChange, value = '' }) {
//     const [selectedDate, setSelectedDate] = useState(value || '');
//     const dateInputRef = useRef(null);

//     useEffect(() => {
//         if (value) {
//             setSelectedDate(value);
//         }
//     }, [value]);

//     const openDatePicker = () => {
//         if (dateInputRef.current) dateInputRef.current.showPicker?.();
//     };

//     const handleChange = (e) => {
//         const date = e.target.value;
//         setSelectedDate(date);
//         onChange?.(date);
//     };

//     return (
//         <>
//             <label
//                 className="text-sm font-semibold text-gray-600 flex flex-start mb-1 px-1"
//                 style={{ fontSize: '12px' }}
//             >
//                 Select Date
//             </label>
//             <div
//                 style={{
//                     border: '1px solid #ccc',
//                     padding: '10px 20px',
//                     borderRadius: '6px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     fontSize: '11px',
//                     width: '100%',
//                 }}
//             >
//                 <div className="relative w-full">
//                     <input
//                         ref={dateInputRef}
//                         type="date"
//                         value={selectedDate}
//                         onChange={handleChange}
//                         className="custom-date-input bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full text-black cursor pl-8"
//                         onClick={openDatePicker}
//                     />

//                     <span
//                         className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor"
//                         onClick={openDatePicker}
//                     >
//                         <Image
//                             src="/assets/icons/calendar-icon.svg"
//                             alt="Calendar Icon"
//                             width={14}
//                             height={14}
//                         />
//                     </span>
//                 </div>
//             </div>
//         </>
//     );
// }

export default function DatePicker({ onChange, value = '', futureOnly = false }) {
    const [selectedDate, setSelectedDate] = useState(value || '');
    const dateInputRef = useRef(null);

    useEffect(() => {
        if (value) {
            setSelectedDate(value);
        }
    }, [value]);

    const openDatePicker = () => {
        if (dateInputRef.current) dateInputRef.current.showPicker?.();
    };

    const handleChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        onChange?.(date);
    };

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <>
            <label
                className="text-sm font-semibold text-gray-600 flex flex-start mb-1 px-1"
                style={{ fontSize: '12px' }}
            >
                Select Date
            </label>
            <div
                style={{
                    border: '1px solid #ccc',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '11px',
                    width: '100%',
                }}
            >
                <div className="relative w-full">
                    <input
                        ref={dateInputRef}
                        type="date"
                        min={futureOnly ? getTomorrowDate() : undefined}
                        value={selectedDate}
                        onChange={handleChange}
                        className="custom-date-input bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full text-black cursor pl-8"
                        onClick={openDatePicker}
                    />
                    <span
                        className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor"
                        onClick={openDatePicker}
                    >
                        <Image
                            src="/assets/icons/calendar-icon.svg"
                            alt="Calendar Icon"
                            width={14}
                            height={14}
                        />
                    </span>
                </div>
            </div>
        </>
    );
}

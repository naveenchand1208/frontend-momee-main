'use client'
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Button from "../button/page";
import './page.css';

export default function CustomCalendarInput({ onChange, value, required = false, formSubmitted = false, isButton = false }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const hasError = required && formSubmitted && (!fromDate || !toDate);

  useEffect(() => {
    if (value) {
      setFromDate(value.fromDate || "");
      setToDate(value.toDate || "");
    }
  }, [value]);
  const openFromDate = () => {
    if (fromDateRef.current) fromDateRef.current.showPicker?.();
  };

  const openToDate = () => {
    if (toDateRef.current) toDateRef.current.showPicker?.();
  };

  const handleFromChange = (e) => {
    setFromDate(e.target.value);
    onChange?.({ fromDate: e.target.value, toDate });
  };

  const handleToChange = (e) => {
    setToDate(e.target.value);
    onChange?.({ fromDate, toDate: e.target.value });
  };

  const handleSubmit = () => {
    if (!fromDate || !toDate) return;
    onSubmit?.({ fromDate, toDate }); // trigger parent handler
  };

  return (
    <>
      {/* <div className="text-center text-sm font-semibold text-gray-600"
        style={{
          fontSize: '12px',
          position: 'relative',
          top: '0',
          left: '10px',
          fontWeight: 500,
          display: 'inline-flex',
        }}>
        From Date
      </div>
      <div className="text-center text-sm font-semibold text-gray-600"
        style={{
          fontSize: '12px',
          position: 'relative',
          top: '0px',
          left: '117px',
          fontWeight: 500,
          display: 'inline-flex',
        }}>
        To Date
      </div> */}
      <div className="flex mb-1 px-1" style={{
        width: '100%',
        fontSize: '12px',
      }}>
        <label className="text-sm font-semibold text-gray-600 flex flex-start common-cursor" style={{
          width: '50%'
        }}>From Date</label>
        <label className="text-sm font-semibold text-gray-600 flex flex-start common-cursor" style={{
          width: '50%'
        }}>To Date</label>
      </div>
      <div className=""
        style={{
          border: hasError ? '1px solid red' : '1px solid #ccc',
          padding: '10px 20px',
          borderRadius: '6px',
          display: 'flex',
          gap: '30px',
          alignItems: 'center',
          fontSize: '11px',
          width: '100%'
        }}>
        <div className="relative w-full" >
          <input
            ref={fromDateRef}
            type="date"
            value={fromDate}
            onChange={handleFromChange}
            className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full text-black cursor pl-8" // padding for icon space
            onClick={openFromDate}
          />

          <span
            className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor"
            onClick={openFromDate}
          >
            <Image
              src="/assets/icons/calendar-icon.svg"
              alt="Calendar Icon"
              width={14}
              height={14}
            />
          </span>
        </div>
        <span className="p-0 m-0">|</span>
        <div className="relative w-full">
          <input
            ref={toDateRef}
            type="date"
            value={toDate}
            onChange={handleToChange}
            className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full text-black cursor pl-8" // padding for icon space
            onClick={openToDate}
          />

          <span
            className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor"
            onClick={openToDate}
          >
            <Image
              src="/assets/icons/calendar-icon.svg"
              alt="Calendar Icon"
              width={14}
              height={14}
            />
          </span>
        </div>
        {isButton && (
          <div className="relative group inline-block mr-4">
            <Button
              label="Submit"
              backgroundColor="black"
              type="button"
              size="xxSmall"
              onClick={() => onSubmit?.({ fromDate, toDate })} >
            </Button>
          </div>
        )}
      </div>
      {hasError && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          Both dates are required.
        </div>
      )}
    </>
  );
}


// import DateRangePicker from "@/components/shared/date-range/page";
// const handleDateChange = ({ fromDate, toDate }) => {
//   console.log("Date range:", fromDate, toDate);
// };
// <div>

//   <DateRangePicker onChange={handleDateChange} />
// </div>
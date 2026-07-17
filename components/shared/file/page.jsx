// 'use client';

// import { useRef, useState, useEffect } from 'react';
// import '../file/page.css';

// export default function FileUpload({
//   label = "Upload Image",
//   onFileSelect,
//   required = false,
//   formSubmitted = false,
//   parentFile
// }) {
//   const [file, setFile] = useState(null);
//   const [hasError, setHasError] = useState(false);
//   const [touched, setTouched] = useState(false);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     if (!parentFile && inputRef.current) {
//       inputRef.current.value = '';
//       setFile(null);
//       setTouched(false);      // Reset touch state
//       setHasError(false);
//     }
//   }, [parentFile]);

//   useEffect(() => {
//     // Trigger error if form is submitted or field is touched and no file is selected
//     if ((touched || formSubmitted) && required && !file) {
//       setHasError(true);
//     } else {
//       setHasError(false);
//     }
//   }, [touched, formSubmitted, required, file]);

//   const handleClick = () => {
//     setTouched(true);
//     inputRef.current.click();
//   };

//   const handleChange = (e) => {
//     const selectedFile = e.target.files?.[0] || null;
//     setFile(selectedFile);
//     if (onFileSelect && selectedFile) {
//       onFileSelect(selectedFile);
//     }
//   };

//   return (
//     <div className="file-upload-row" style={{ width: '100%' }}>
//       {label !== '' && (
//         <label
//           style={{
//             fontWeight: 500,
//             fontSize: '13px',
//             marginBottom: '2px',
//           }}
//         >
//           {label} {required && <span style={{ color: 'red' }}>*</span>}
//         </label>
//       )}

//       <div className="file-upload-controls" style={{ width: '100%' }}>
//         <input
//           type="file"
//           ref={inputRef}
//           onChange={handleChange}
//           style={{ display: 'none' }}
//         />

//         <div className={`file-upload-bordered ${hasError ? 'error-border' : ''}`} style={{ flex: 1 }}>
//           <button type="button" className="choose-button" onClick={handleClick}>
//             Choose File
//           </button>
//           <span className="file-name">
//             {file ? file.name : "No file chosen"}
//           </span>
//         </div>
//       </div>

//       {/* {required && touched && !file && ( */}
//       <div style={{ height: '14px', marginBottom: '1px' }}>
//         {hasError && (
//           <span className="error-text">
//             {label} is required
//           </span>
//         )}
//       </div>
//       {/* )} */}
//     </div>
//   );
// }

'use client';

import { useRef, useState, useEffect } from 'react';
import '../file/page.css';
import { showError } from "@/common/toast/toastService";

export default function FileUpload({
  label = "Upload Image",
  onFileSelect,
  required = false,
  formSubmitted = false,
  disabled = false,
  format = '',
  parentFile,
  sizeKey = 'md' // 'sm' | 'md' | 'lg'
}) {
  const [file, setFile] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState(''); // For URL display
  const [hasError, setHasError] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);
  const sizeClassMap = {
    sm: '300px',
    md: '100%',
    lg: '100%'
  };

  useEffect(() => {
    if (!parentFile && inputRef.current) {
      inputRef.current.value = '';
      setFile(null);
      setPreviewUrl('');
      setTouched(false);
      setHasError(false);
    } else if (typeof parentFile === 'string') {
      // If parentFile is a URL (like in edit mode)
      setPreviewUrl(parentFile);
    }
  }, [parentFile]);

  useEffect(() => {
    if ((touched || formSubmitted) && required && !file && !parentFile) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [touched, formSubmitted, required, file, parentFile]);

  const handleClick = () => {
    setTouched(true);
    inputRef.current.click();
  };

  // const handleChange = (e) => {
  //   const selectedFile = e.target.files?.[0] || null;
  //   if (selectedFile) {
  //     setFile(selectedFile);
  //     const preview = URL.createObjectURL(selectedFile);
  //     setPreviewUrl(preview);

  //     if (onFileSelect) {
  //       onFileSelect(selectedFile);
  //     }
  //   }
  // };

  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    const isImageValid =
      format === 'image' &&
      selectedFile.type.startsWith('image/') &&
      selectedFile.type !== 'image/gif';

    const isAudioValid =
      format === 'audio' &&
      selectedFile.type.startsWith('audio/');

    const isPdfValid =
      format === 'pdf' &&
      selectedFile.type === 'application/pdf';

    const isGifValid =
      format === 'gif' && selectedFile.type === 'image/gif';

    const isValid =
      (format === 'image' && isImageValid) ||
      (format === 'audio' && isAudioValid) ||
      (format === 'pdf' && isPdfValid) ||
      (format === 'gif' && isGifValid) ||
      !format;

    if (!isValid) {
      setHasError(true);
      setPreviewUrl('');
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';

      if (format === 'image') {
        showError?.('Please upload only image files (jpg,png,webp etc..)');
      } else if (format === 'audio') {
        showError?.('Please upload only audio files (mp3,mp4 etc..)');
      } else if (format === 'pdf') {
        showError?.('Only pdf files are allowed');
      } else if (format === 'gif') {
        showError?.('Only gif files are allowed');
      } else {
        showError?.(`${label} required`);
      }

      return;
    }

    setHasError(false);
    setFile(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    setPreviewUrl(preview);

    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };



  // const getPreviewImageSrc = () =>
  //   !previewUrl ? null :
  //     format === 'audio' ? `/assets/icons/music-file-icon.svg` :
  //       previewUrl;

  const getPreviewImageSrc = () =>
    !previewUrl
      ? null
      : format === 'audio'
        ? '/assets/icons/music-file-icon.svg'
        : format === 'pdf'
          ? '/assets/icons/pdf-icon.svg'
          : previewUrl;
  return (
    // <div className="file-upload-row" style={{ width: '100%' }}>
    //   {label !== '' && (
    //     <label className='common-cursor' style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>
    //       {label} {required && <span style={{ color: 'red' }}>*</span>}
    //     </label>
    //   )}

    //   <div className="d-flex align-items-center gap-2" style={{ width: '100%' }}>

    //     <div className="file-upload-controls" style={{ width: '90%' }}>
    //       <input
    //         type="file"
    //         ref={inputRef}
    //         onChange={handleChange}
    //         disabled={disabled}
    //         accept={
    //           format === 'image' ? 'image/*' :
    //             format === 'audio' ? 'audio/*' :
    //               format === 'pdf' ? 'application/pdf' :
    //                 format === 'gif' ? 'image/pdf' :
    //                   undefined
    //         }
    //         style={{ display: 'none' }}
    //       />

    //       <div className={`file-upload-bordered ${hasError ? 'error-border' : ''}`} style={{ flex: 1 }}>
    //         <button type="button" className="choose-button cursor" disabled={disabled}
    //           onClick={handleClick}
    //           style={disabled ? { cursor: 'not-allowed' } : {}}
    //         >
    //           Choose File
    //         </button>
    //         <span className="file-name">
    //           {(() => {
    //             const name = file
    //               ? file.name
    //               : parentFile
    //                 ? parentFile.split('/').pop()
    //                 : "No file chosen";

    //             return name.length > 15 ? name.slice(0, 15) + '...' : name;
    //           })()}
    //         </span>
    //       </div>
    //     </div>

    //     <div style={{ marginTop: '8px', width: '10%', position: 'relative', bottom: '5px' }}>
    //       {getPreviewImageSrc() && (
    //         <img
    //           src={getPreviewImageSrc()}
    //           alt="preview"
    //           width={40}
    //           height={40}
    //           style={{ borderRadius: '50%', objectFit: 'cover' }}
    //         />
    //       )}
    //     </div>
    //   </div>

    //   {/* <div style={{ height: '14px', marginBottom: '1px' }}>
    //     {hasError && (
    //       <span className="error-text">
    //         {format === 'image'
    //           ? 'Please upload a valid image file (jpg, jpeg, png, webp)'
    //           : `${label} required`}
    //       </span>
    //     )}
    //   </div> */}
    // </div>
    <div className="file-upload-row" style={{ width: sizeClassMap[sizeKey] || '100%' }}>
      {label && (
        <label className="common-cursor" style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}

      <div className="file-upload-controls" style={{ width: '100%' }}>
        <input
          type="file"
          ref={inputRef}
          onChange={handleChange}
          disabled={disabled}
          accept={
            format === 'image' ? 'image/*' :
              format === 'audio' ? 'audio/*' :
                format === 'pdf' ? 'application/pdf' :
                  format === 'gif' ? 'image/gif' :
                    undefined
          }
          style={{ display: 'none' }}
        />

        <div className={`file-upload-bordered ${hasError ? 'error-border' : ''}`} style={{ width: '100%' }}>
          <button type="button" className="choose-button cursor" disabled={disabled}
            onClick={handleClick}
            style={disabled ? { cursor: 'not-allowed' } : {}}
          >
            Choose File
          </button>
          <span className="file-name">
            {(() => {
              const name = file
                ? file.name
                : parentFile
                  ? parentFile.split('/').pop()
                  : "No file chosen";

              return name.length > 25 ? name.slice(0, 25) + '...' : name;
            })()}
          </span>
        </div>
      </div>

      {/* {getPreviewImageSrc() && (
        <div style={{ marginTop: '12px', width: '100%' }}>
          <img
            src={getPreviewImageSrc()}
            alt="preview"
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: '#f9f9f9',
              padding: '4px',
            }}
          />
        </div>
      )} */}


      {getPreviewImageSrc() && (
        <div style={{ marginTop: '12px', width: '100%' }}>
          <img
            src={getPreviewImageSrc()}
            alt="preview"
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: '#f9f9f9',
              padding: '4px',
            }}
          />
        </div>
      )}

      {hasError && (
        <div style={{ height: '14px', marginTop: '4px' }}>
          <span style={{ color: 'red', fontSize: '12px' }}>
            {label} required
          </span>
        </div>
      )}
    </div>

  );
}

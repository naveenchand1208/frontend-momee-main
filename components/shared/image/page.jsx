'use client';
import React, { useState, useRef, useEffect } from 'react';
export default function ImageUpload({
  label = 'Upload Image',
  onFileSelect,
  required = false,
  formSubmitted = false,
  disabled = false,
  format = 'image',
  parentFile = null,
  previewWidth = '100%',
  previewHeight = '20vh',
  exactWidth,
  exactHeight,
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (!parentFile && inputRef.current) {
      inputRef.current.value = '';
      setFile(null);
      setPreviewUrl('');
      setTouched(false);
      setHasError(false);
    } else if (typeof parentFile === 'string') {
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
  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    const type = selectedFile.type;
    const isImage = format === 'image' && type.startsWith('image/') && type !== 'image/gif';
    const isAudio = format === 'audio' && type.startsWith('audio/');
    const isPdf = format === 'pdf' && type === 'application/pdf';
    const isGif = format === 'gif' && type === 'image/gif';

    return isImage || isAudio || isPdf || isGif || format === '';
  };
  const validateImageDimensions = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (
            (exactWidth && img.width !== exactWidth) ||
            (exactHeight && img.height !== exactHeight)
          ) {
            setHasError(true);
            setErrorMsg(`Image must be exactly ${exactWidth} x ${exactHeight} pixels.`);
            resolve(false);
          } else {
            resolve(true);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };
  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    onFileSelect?.(selectedFile);
  };
  const handleChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    setTouched(true);

    if (!validateFile(selectedFile)) {
      setErrorMsg(true);
      setPreviewUrl('');
      setFile(null);
      inputRef.current.value = '';
      return;
    }

    if (format === 'image' && (exactWidth || exactHeight)) {
      const isValidSize = await validateImageDimensions(selectedFile);
      if (!isValidSize) {
        inputRef.current.value = '';
        setFile(null);
        setPreviewUrl('');
        return;
      }
    }
    handleFile(selectedFile);
  };


  const handleDrop = async (e) => {
    e.preventDefault();
    if (disabled) return;

    const selectedFile = e.dataTransfer.files?.[0];
    if (!validateFile(selectedFile)) {
      setHasError(true);
      setErrorMsg(`Please upload a valid ${format}`);
      setPreviewUrl('');
      setFile(null);
      return;
    }

    if (format === 'image' && (exactWidth || exactHeight)) {
      const isValidSize = await validateImageDimensions(selectedFile);
      if (!isValidSize) {
        return;
      }
    }

    handleFile(selectedFile);
  };
  const getPreviewImageSrc = () => {
    if (!previewUrl) return null;
    if (format === 'audio') return '/assets/icons/music-file-icon.svg';
    if (format === 'pdf') return '/assets/icons/pdf-icon.svg';
    return previewUrl;
  };
  return (
    <div style={{ width: previewWidth, height: previewHeight }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}

      <div className='cursor'
        onClick={() => !disabled && inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          width: previewWidth,
          height: previewHeight,
          border: `2px dashed ${hasError ? 'red' : '#209dff'}`,
          borderRadius: 8,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
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

        {getPreviewImageSrc() ? (
          <img
            src={getPreviewImageSrc()}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 8,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: '#aaa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 14,
              pointerEvents: 'none',
            }}
          >
            <img
              src="/assets/icons/image-icon.png"
              alt="Upload Icon"
              style={{ width: 34, height: 34, marginBottom: 4 }}
            />
            <span style={{ fontSize: 12 }}>{label}</span>
          </div>
        )}
      </div>

      {hasError && (
        <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
          {errorMsg || `Please upload a valid ${format || 'file'}`}
        </div>
      )}
    </div>
  );
}

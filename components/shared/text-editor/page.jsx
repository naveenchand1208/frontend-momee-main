// 'use client';

// import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
// import Quill from 'quill';
// import 'quill/dist/quill.snow.css';
// import './page.css';

// const RichTextEditor = forwardRef(({ value = '', onChange, height = '100px' }, ref) => {
//   const editorRef = useRef(null);
//   const initializedRef = useRef(false);
//   const quillRef = useRef(null);

//   useEffect(() => {
//     if (editorRef.current && !initializedRef.current) {
//       const quill = new Quill(editorRef.current, {
//         theme: 'snow',
//         modules: {
//           toolbar: [
//             [{ header: [1, 2, 3, false] }],
//             ['bold', 'italic', 'underline', 'strike'],
//             [{ list: 'ordered' }, { list: 'bullet' }],
//             ['link', 'image'],
//             ['clean'],
//           ],
//         },
//         placeholder: 'Write something...',
//         // readOnly: disabled,
//       });

//       quillRef.current = quill;
//       initializedRef.current = true;

//       quill.on('text-change', () => {
//         const html = quill.root.innerHTML;
//         console.log('html', html)
//         if (onChange) onChange(html);
//       });

//       // Set initial value
//       quill.root.innerHTML = value;
//     }
//   }, [value, disabled, onChange]);

//   useImperativeHandle(ref, () => ({
//     getContent: () => {
//       if (quillRef.current) {
//         return quillRef.current.root.innerHTML;
//       }
//       return '';
//     },
//   }));

//   return <div ref={editorRef} style={{ width: '100%', height: height }} />;
// });


// RichTextEditor.displayName = 'RichTextEditor';
// export default RichTextEditor;


'use client';

import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const RichTextEditor = ({ value = '', onChange, height = '200px' }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    // Initialize Quill
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],  
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'code-block', 'video'],
          ['clean'],
        ],
      },
      placeholder: 'Write something...',
    });

    quillRef.current = quill;

    // Set initial value
    quill.root.innerHTML = value;

    // Handle text change
    quill.on('text-change', () => {
      const html = quill.root.innerHTML;
      // console.log('Editor content:', html);
      onChange?.(html);
    });
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className='cursor'
      ref={editorRef}
      style={{
        height,
        width: '100%',
        background: 'white',
      }}
    />
  );
};

export default RichTextEditor;

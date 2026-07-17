'use client';
import './page.css'; // Assuming you create a CSS file for styles

// export default function Checkbox({
//     label = '',
//     name,
//     checked = false,
//     onChange,
//     required = false,
// }) {
//     return (
//         <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
//             <label
//                 htmlFor={name}
//                 style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     cursor: 'pointer',
//                     fontSize: '13px',
//                     userSelect: 'none',
//                 }}
//             >
//                 <input
//                     id={name}
//                     type="checkbox"
//                     name={name}
//                     checked={checked}
//                     onChange={onChange}
//                     style={{ marginRight: '8px', width: '16px', height: '16px', border: '1px solid #A9A9A9' }}
//                     required={required}
//                 />
//                 {label} {required && <span style={{ color: 'red' }}>*</span>}
//             </label>
//         </div>
//     );
// }



export default function Checkbox({
    label = '',
    name,
    checked = false,
    onChange,
    required = false,
}) {
    return (
        <div className="checkbox-container">
            <label htmlFor={name} className="checkbox-label cursor">
                <input
                    id={name}
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    required={required}
                    className="custom-checkbox"
                />
                <span className="custom-box cursor"></span>
                {label}
                {required && <span style={{ color: 'red' }}>*</span>}
            </label>
        </div>
    );
}

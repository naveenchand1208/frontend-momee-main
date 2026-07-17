'use client';
import './page.css';
import { useState } from 'react';

export default function Dropdown() {
    const [selected, setSelected] = useState("");

    return (
        <>
            <p>Dropdown</p>
            <div className="row">
                <div className="col-6">
                    <select 
                        className="form-select" 
                        value={selected} 
                        onChange={(e) => setSelected(e.target.value)}
                    >
                        <option value="" disabled>Select</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                    </select>
                </div>
            </div>
        </>
    );
}

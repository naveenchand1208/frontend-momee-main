// pages/my-page-with-dialog.js
'use client';
import Input from "@/components/shared/input/page"
// import Dropdown from "@/components/shared/dropdown/page"
import Date from "@/components/shared/date/page"
import Color_Input from "@/components/shared/color-input/page"
import File from "@/components/shared/file/page"
import Radio from "@/components/shared/radio/page"
// import Button from "@/components/shared/button/page"
import React, { useState ,useRef} from 'react';
import Button from '@mui/material/Button';
import PreqMom from '../preg-mom/page';
import Checkbox from "@/components/shared/checkbox/page";
import DatePicker from "@/components/shared/date/page";
import './page.css';
// import Image from 'next/image';
// import CustomDialog from '@/components/shared/dialog/dialog';
import ConfirmationDialog from "@/components/shared/confirmation-dialog/confirmation-dialog";
import RadioGroup from "@/components/shared/radio/page";
import FileUpload from "@/components/shared/file/page";
import RichTextEditor from "@/components/shared/text-editor/page";
import TextIconButton from "@/components/shared/text-icon-button/page";
export default function PageWithFullPageDialog() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [agree, setAgree] = useState(false);
    const [selected, setSelected] = useState('CSS');
    const [selectedDate, setSelectedDate] = useState('2025-05-02');
    const editorRef = useRef();

  // Function to log the content
  const logContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent();
      console.log('HTML Content:', html);
    }
  };
    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const openLogoutDialog = () => {
        setIsLogoutDialogOpen(true);
    };

    const handleLogout = () => {
        console.log('logout-coming')
        localStorage.removeItem('token');

        window.location.href = '/login';
        localStorage.clear();
    };

    return (
        <div>
            <h1>Page with Dialog</h1>
            <Button variant="outlined" onClick={handleOpenDialog}>
                Open Full Page Form in Dialog
            </Button>


            {/* <CustomDialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                title="Full Page Form"
                content={<PreqMom />}
            // onCloseDialog={handleCloseDialog}
            /> */}


            <ConfirmationDialog
                open={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
                onConfirm={handleLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                cancelLabel="Cancel"
                confirmLabel="Logout"
            />


            <Button onClick={openLogoutDialog}>Logout</Button>

            <Checkbox
                name="terms"
                label="I agree to the terms and conditions"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
            />

            <RadioGroup
                name="fav_language"
                label="Select a language"
                options={[
                    { value: 'HTML', label: 'HTML' },
                    { value: 'CSS', label: 'CSS' },
                    { value: 'JavaScript', label: 'JavaScript' },
                ]}
                selectedValue={selected}
                onChange={(e) => setSelected(e.target.value)}
            />

            <DatePicker
                name="edd"
                label="Select a date"
                size="small"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
            />
            <br></br>
            <FileUpload/>

            <br></br>
            <RichTextEditor ref={editorRef}/>
            <TextIconButton label="Filter"/>
            <button onClick={logContent}>Log HTML Content</button>

            <button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">Toggle right offcanvas</button>

            <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
                <div className="offcanvas-header">
                    <h3 className='top' id="offcanvasRightLabel">User Profile</h3>
                    <button id='close-button' type="button" className="btn-close text-reset btn btn-danger" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    ...
                </div>
            </div>

            <div className="row">
                <div className="col-6 pt-2">
                    <Input />
                </div>
                {/* <div className="col-6 pt-2">
                    <Dropdown />
                </div> */}
                {/* <div className="col-6 pt-2">
                    <Date />
                </div>
                <div className="col-6 pt-2">
                    <Color_Input />
                </div>
                <div className="col-6 pt-2">
                    <File />
                </div>
                <div className="col-6 pt-2">
                    <Checkbox />
                </div>
                <div className="col-12 pt-2">
                    <Radio />
                </div> */}

                {/* <div className="col-6 pt-2">
                    <Button
                        label="Submit"
                        type="button"
                        color="#fff"
                        backgroundColor="#28a745"
                    />
                </div> */}
            </div>
            <div style={{ width: '180px', marginTop: '10px' }}>
            {/* <AutoCompleteInput options={options} onSelect={handleSelect} required={true} formSubmitted={formSubmitted}
                            label="fruit"/> */}

            </div>
        </div>


    );
}

{/* <div className="card mb-3" style="max-width: 540px;">
    <div className="row g-0">
        <div className="col-md-4">
            <h3></h3>
            <div className='main'>
                <Image
                    src="/assets/profile.jpg"
                    alt="logo"
                    width={120}
                    height={120} />
                <h5 style={{ position: 'relative', top: '40px', left: '30' }} >NilYeager</h5>
                <p style={{ position: 'relative', left: '100%', bottom: '11px' }} className='text-fade'>Manager</p>
                <a style={{ position: 'relative', left: '30%' }} href=''>dummy@gmail.com</a><br></br>
                <a style={{ position: 'relative', left: '100%', bottom: '9px' }} href='' className='text-warning'>logout</a>
            </div>
            <div className='middle'>
                <Image

                />
                <a href=''>My Profile</a>
                <span className='text-fade'>Account settings and more</span>
            </div>
            <div className='last'>

                <a href=''>Settings</a>
                <span >Accout Settings</span>
            </div>
        </div>

    </div>
</div> */}
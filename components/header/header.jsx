import './header.css';
import Image from 'next/image';

export default function Header({ toggleSidebar, isSidebarOpen }) {

  return (
    <div className={`d-flex justify-content-between align-items-center  ${isSidebarOpen ? 'header' : 'header-full'}`}>

      <div className='d-flex align-items-center gap-4'>
        <Image
          className='menu-bar'
          src="/assets/icons/menu-bar-icon.svg"
          alt="logo"
          width={28}
          height={28}
          onClick={toggleSidebar}
        />
        <div className='search-input' style={{ position: 'relative', width: '260px', height: '45px' }}>
          <input
            type="search"
            placeholder="Search"
            style={{
              backgroundColor: '#EAEDF7',
              fontSize: '16px',
              width: '100%',
              height: '100%',
              padding: '5.25px 10.5px 5.25px 20px',
              border: '1px solid #EAEDF7',
              borderRadius: '8px',
            }}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '15px',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}>
            <Image
              src="/assets/icons/search-icon.svg"
              alt="logo"
              width={16}
              height={16}
            />
          </div>
        </div>
      </div>
      <Image
        className='profile'
        src="/assets/profile.jpg"
        alt="logo"
        width={100}
        height={46}
      />
    </div>
  );
}

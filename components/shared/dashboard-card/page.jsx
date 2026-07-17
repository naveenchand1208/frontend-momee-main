import React from "react";
import '../dashboard-card/page.css';
import AnimatedNumber from "../animated-number/page";
const DashboardCard = ({ iconPath, count, title, prefix, bgColor = "#FFFFFF", iconBg = "#F0F0F0", textColor = "#444444"
  , dropdown = false, dropdownOptions = [], onDropdownChange = () => { }, exportIcon = false, onExport = () => {}, }) => {
  return (
    <div
      className="dashboard-card"
      style={{ backgroundColor: bgColor, position: 'relative' }}
    >
      {dropdown && dropdownOptions.length > 0 && (
        <select
          className="card-dropdown"
          onChange={(e) => onDropdownChange(e.target.value)}
        >
          {dropdownOptions.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
      )}
      <div className="icon-container" style={{ backgroundColor: iconBg }}>
        <img src={iconPath && iconPath.trim() !== '' ? iconPath : '/assets/icons/growth-icon.svg'} alt={title} className="icon" />
      </div>
      <div className="text-container">
        <div className="title" style={{ color: textColor }}>{title}</div>
        <div className="count" style={{ color: textColor }}><AnimatedNumber count={count} duration={500} prefix={prefix} /></div>
        {exportIcon && (
          <div
            className="download-icon"
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              width: '25px',
              height: '25px',
              cursor: 'pointer',
            }}
              onClick={onExport}
              title="Export"
          >
            <img
              src="/assets/icons/export-icon.svg"
              alt="export-icon"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;


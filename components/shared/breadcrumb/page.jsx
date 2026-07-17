'use client';
import React from 'react';
import Link from 'next/link';
import Button from '@/components/shared/button/page';
import Input from '@/components/shared/input/page';
import TextIconButton from '../text-icon-button/page';
import '../breadcrumb/page.css';
import { Colors } from '@/common/constants/colorEnum';
import StatusTabGroup from '../tab-group/page';
import DateTabGroup from '../date-range-tab/page';
export default function Breadcrumb({
  items = [],
  height = '45px',
  fontSize = '13px',
  actionButton = null,
}) {
  return (
    <div
      className="bg-white breadcrumb-container px-4"
      style={{
        minHeight: height,
        position: 'sticky',
        top: 0,
        marginTop: '-12px',
        zIndex: 1000,
        backgroundColor: 'transparent',
        boxShadow: 'none',
      }}
    >
      <div className="breadcrumb-path" style={{ fontSize }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const labelStyle = {
            color: isLast ? Colors.Primary1 : '#6b7280',
            fontWeight: isLast ? '500' : 'normal',
          };
          return (
            <span key={index} style={labelStyle} className='cursor'>
              {item.href ? (
                <Link href={item.href} className="breadcrumb-link cursor" style={labelStyle}>
                  {item.label}
                </Link>
              ) : (
                item.label
              )}
              {index < items.length - 1 && ' / '}
            </span>
          );
        })}
      </div>
      {actionButton && (
        <div className="breadcrumb-action flex items-center gap-2">
          {(Array.isArray(actionButton) ? actionButton : [actionButton]).map((btn, i, arr) => (
            <React.Fragment key={i}>
              {btn.type === 'button' ? (
                <Button
                  iconPath={btn.iconPath}
                  type={btn.type}
                  size={btn.size}
                  label={btn.label}
                  backgroundColor={btn.backgroundColor}
                  isLoading={btn.isLoading}
                  onClick={btn.onClick}
                />
              ) : btn.type === 'statusTabs' ? (
                <StatusTabGroup
                  tabs={btn.options}
                  onChange={btn.onChange}
                />
              ):btn.type === 'dateTabs' ? (
                <DateTabGroup
                  tabs={btn.options}
                  onChange={btn.onChange}
                />
              ): btn.type === 'textIcon' ? (
                <TextIconButton
                  className='cursor'
                  iconPath={btn.iconPath}
                  label={btn.label}
                  onClick={btn.onClick}
                  options={btn.options || []}
                />
              ) : (
                <div className='cursor' style={{ width: '180px' }}>
                  <Input
                    iconPath={btn.iconPath}
                    placeholder={btn.placeholder}
                    name={btn.name}
                    label={btn.label}
                    value={btn.value}
                    required={btn.required}
                    onChange={btn.onChange}
                  />
                </div>
              )}
              {i < arr.length - 1 && (
                <span className="px-1 select-none" style={{ color: '#d1d1d1' }}>|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

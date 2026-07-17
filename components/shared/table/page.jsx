'use client';
import './page.css'
import React, { useState } from 'react';

export default function Table({ headers, data, itemsPerPage = 5, headerActions }) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  console.log('headerActions', headerActions)
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div>
      

      <div className="p-4 shadow rounded bg-white mt-3">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  onClick={() => header.sortable && handleSort(header.key)}
                  className={`p-2 cursor-pointer ${header.sortable ? 'hover:underline' : ''}`}
                >
                  {header.label}
                  {header.sortable && sortKey === header.key && (
                    <span> {sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-100">
                {/* {headers.map((header) => (
                  {
                    header.type === 'text' &&
                      <td key={header.key} className="p-2">
                        {row[header.key]}
                      </td>
                  }
                ))} */}
                {/* {headers.map((header) => (
                  <td key={header.key} className="p-2">
                    {header.type === 'text' && row[header.key]}

                    {header.type === 'action' && (
                      headerActions.map((action, index) => (
                        action.icon === 'view' && (
                          <Image
                            className='menu-bar'
                            src="/assets/icons/edit-icon.svg"
                            alt="logo"
                            width={24}
                            height={24}
                          />
                          
                        ),
                        <Image
                            className='menu-bar'
                            src="/assets/icons/view-icon.svg"
                            alt="logo"
                            width={24}
                            height={24}
                          />,
                          <Image
                            className='menu-bar'
                            src="/assets/icons/delete-icon.svg"
                            alt="logo"
                            width={24}
                            height={24}
                          />
                        
                      ))
                      
                      
                    )}
                  </td>
                  
                  
                  
                ))} */}
              </tr>
              
            ))}
            
          </tbody>
          
        </table>


        {/* Pagination */}


        <div className="flex justify-content-between pt-3 gap-2">
          <div className="flex justify-start pt-3">
            <p>Showing 1 to 2 of 1 entries</p>
          </div>
          <div className="flex justify-center mt-6">
            <div className="flex items-center bg-white shadow-md rounded-full px-4 py-2 gap-6">
              <nav aria-label="Page navigation example">
                <ul className="pagination">
                  <li className="page-item">
                    <a className="page-link" href="#" aria-label="Previous">
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  <li className="page-item"><a className="page-link" href="#">1</a></li>

                  <li className="page-item">
                    <a className="page-link" href="#" aria-label="Next">
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}


// <div className="flex gap-2">
//   <button onClick={() => handleView(row.id)} title="View">
//     👁️ {/* or use an SVG or icon component */}
//   </button>
//   <button onClick={() => handleEdit(row.id)} title="Edit">
//     ✏️ {/* or use an SVG or icon component */}
//   </button>
// </div>
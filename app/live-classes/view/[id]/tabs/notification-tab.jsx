import MaterialTable from "@/components/shared/material-table/page";
export default function NotificationsTab({
  myNoteTableHeaders,
  myNoteTableData,
  page,
  rowsPerPage,
  isLoading,
  actionConfig,
  sortField,
  sortOrder,
  onSortChange,
  onTableChange,
}) {
  return (
    <div className="mt-5">
      <MaterialTable
        headers={myNoteTableHeaders}
        data={myNoteTableData.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={myNoteTableData.length} 
        isLoading={isLoading}
        actionConfig={actionConfig}
        sortConfig={{ [sortField]: sortOrder }}
        onSortChange={onSortChange}
        onTableChange={onTableChange}
      />
    </div>
  );
}

'use client';
import { useState } from "react";
import MaterialTable from "@/components/shared/material-table/page";
import CustomDialog from "@/components/shared/dialog/dialog";
import Input from "@/components/shared/input/page";
import Textarea from "@/components/shared/textarea/page";
import Button from "@/components/shared/button/page";
import { Colors } from "@/common/constants/colorEnum";
export default function ParticipantsTab({
    myTableHeaders,
    myTableData,
    page,
    isLoading,
    rowsPerPage,
    totalDocs,
    sortField,
    sortOrder,
    onSortChange,
    onTableChange,
    onNotify,
}) {

    const [selectedRows, setSelectedRows] = useState([]);
    const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
    const toggleSelectRow = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };
    const allSelected =
        myTableData.length > 0 && selectedRows.length === myTableData.length;
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedRows([]);
        } else {
            setSelectedRows(myTableData.map((row) => row._id));
        }
    };
    const handleNotifySubmit = (formData) => {
        onNotify(selectedRows, formData);
        setIsNotifyDialogOpen(false);
        setSelectedRows([]);
    };
    const tableHeadersWithCheckbox = [
        {
            id: "__checkbox__",
            label: (
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                />
            ),
            align: "center",
            render: (row) => (
                <input
                    type="checkbox"
                    checked={selectedRows.includes(row._id)}
                    onChange={() => toggleSelectRow(row._id)}
                />
            ),
        },
        ...myTableHeaders,
    ];

    const NotificationForm = ({ onClose, onSubmit }) => {
        const [form, setForm] = useState({ title: '', message: '' });
        const handleChange = (e) => {
            const { name, value } = e.target;
            setForm((prev) => ({ ...prev, [name]: value }));
        };
        const handleSubmit = (e) => {
            e.preventDefault();
            if (!form.title || !form.message) {
                alert("Please enter both title and message.");
                return;
            }
            onSubmit(form);
        };
        return (
            <form onSubmit={handleSubmit} className="space-y-4 p-2">
                <div>
                    <Input
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <Textarea
                        label="Message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                    <Button
                        label="Cancel"
                        type="button"
                        size="small"
                        onClick={onClose}
                        backgroundColor={Colors.Primary1}
                    />
                    <Button
                        label="Submit"
                        type="submit"
                        size="extraSmall"
                        backgroundColor={Colors.Primary2}
                    />
                </div>
            </form>
        );
    };
    return (
        <div className="mt-5">
            <div className="mb-3 text-end">
                <div className={selectedRows.length === 0 ? "opacity-50 pointer-events-none inline-block" : "inline-block"}>
                    <Button
                        label="Notify"
                        type="button"
                        color="#fff"
                        backgroundColor={Colors.Primary1}
                        size="extraSmall"
                        onClick={() => setIsNotifyDialogOpen(true)}
                    />
                </div>
            </div>
            <MaterialTable
                headers={tableHeadersWithCheckbox}
                data={myTableData}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalDocs}
                isLoading={isLoading}
                sortConfig={{ [sortField]: sortOrder }}
                onSortChange={onSortChange}
                onTableChange={onTableChange}
                onNotify={onNotify}
            />
            <CustomDialog
                open={isNotifyDialogOpen}
                onClose={() => setIsNotifyDialogOpen(false)}
                title="Notify"
                titleColor="#000000"
                backgroundColor="#fafcfc"
                maxWidth="xs"
                content={
                    <NotificationForm
                        onClose={() => setIsNotifyDialogOpen(false)}
                        onSubmit={handleNotifySubmit}
                    />
                }
            />
        </div>
    );
}

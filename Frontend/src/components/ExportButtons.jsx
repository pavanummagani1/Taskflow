import React from 'react';
import { Download, FileText, Table, File } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ExportButtons({ data, filename, type }) {
  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(formatDataForExport(data));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportToPDF = () => {
    if (!data || data.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(filename.replace(/-/g, ' ').toUpperCase(), 20, 20);

    const tableData = formatDataForPDF(data);
    doc.autoTable({
      head: [tableData.headers],
      body: tableData.rows,
      startY: 30,
    });

    doc.save(`${filename}.pdf`);
  };

  const convertToCSV = (data) => {
    const formattedData = formatDataForExport(data);
    if (formattedData.length === 0) return '';

    const headers = Object.keys(formattedData[0]);
    const csvHeaders = headers.join(',');
    const csvRows = formattedData.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  };

  const formatDataForExport = (data) => {
    return data.map(item => {
      const formatted = {};
      
      if (type === 'tasks') {
        formatted.Title = item.title || '';
        formatted.Description = item.description || '';
        formatted.Category = item.category || '';
        formatted.Status = item.status || '';
        formatted.DueDate = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '';
        formatted.CreatedAt = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
      } else if (type === 'users') {
        formatted.Name = item.name || '';
        formatted.Email = item.email || '';
        formatted.Role = item.role || '';
        formatted.Status = item.status || '';
        formatted.JoinedAt = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
      } else if (type === 'audit') {
        formatted.Action = item.action || '';
        formatted.User = item.user?.name || 'System';
        formatted.Resource = item.resource || '';
        formatted.Details = item.details || '';
        formatted.Timestamp = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';
      } else if (type === 'chart') {
        formatted.Name = item.name || '';
        formatted.Value = item.value || 0;
      }

      return formatted;
    });
  };

  const formatDataForPDF = (data) => {
    const formattedData = formatDataForExport(data);
    if (formattedData.length === 0) return { headers: [], rows: [] };

    const headers = Object.keys(formattedData[0]);
    const rows = formattedData.map(item => Object.values(item));

    return { headers, rows };
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Export:</span>
      <button
        onClick={exportToCSV}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
      >
        <Table className="h-4 w-4" />
        CSV
      </button>
      <button
        onClick={exportToExcel}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
      >
        <FileText className="h-4 w-4" />
        Excel
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
      >
        <File className="h-4 w-4" />
        PDF
      </button>
    </div>
  );
}
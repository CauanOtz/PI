import React from "react";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

export const TableSection = (): JSX.Element => {
  // Define column headers data for better maintainability
  const columns = [
    { id: "name", label: "Name", width: "w-[180px]" },
    { id: "subject", label: "Subject", width: "w-[136px]" },
    { id: "class", label: "Class", width: "w-[169px]" },
    { id: "email", label: "Email address", width: "w-[297px]" },
    { id: "gender", label: "Gender", width: "flex-1" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow className="flex w-full">
          {columns.map((column) => (
            <TableHead
              key={column.id}
              className={`${column.width} pl-2 pr-0 pt-4 pb-[17px] flex items-center gap-2`}
            >
              <span className="relative w-fit mt-[-0.20px] font-['Kumbh_Sans',Helvetica] font-bold text-grey-500 text-xs">
                {column.label}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
    </Table>
  );
};

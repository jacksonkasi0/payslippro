import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Typography from "@/components/ui/typography";
import { Employee } from "@/lib/schemas/employee-schema";
import { DataTableRowActions } from "./row-actions";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default" as const;
    case "inactive":
      return "secondary" as const;
    case "probation":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

export const getColumns = (
  handleRowDeselection: ((rowId: string) => void) | null | undefined
): ColumnDef<Employee>[] => {
  const baseColumns: ColumnDef<Employee>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.profile_photo_url} />
            <AvatarFallback className="text-xs">
              {getInitials(row.getValue("full_name"))}
            </AvatarFallback>
          </Avatar>
          <div>
            <Typography variant="T_Medium_H6">{row.getValue("full_name")}</Typography>
            <Typography variant="T_Regular_H6" className="text-muted-foreground text-sm">
              {row.original.employee_code}
            </Typography>
          </div>
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <Typography variant="T_Regular_H6" className="text-muted-foreground">
          {row.getValue("email")}
        </Typography>
      ),
      size: 250,
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Department" />
      ),
      cell: ({ row }) => (
        <Typography variant="T_Regular_H6">
          {row.original.department?.name || "-"}
        </Typography>
      ),
      size: 150,
    },
    {
      accessorKey: "position",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Position" />
      ),
      cell: ({ row }) => (
        <Typography variant="T_Regular_H6">
          {row.original.position?.name || "-"}
        </Typography>
      ),
      size: 150,
    },
    {
      accessorKey: "employment_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("employment_status") as string;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status}
          </Badge>
        );
      },
      size: 120,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
          <Typography variant="T_Regular_H6">
            {format(date, "MMM d, yyyy")}
          </Typography>
        );
      },
      size: 120,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
      size: 100,
    },
  ];

  // Only include selection column if row selection is enabled
  if (handleRowDeselection !== null) {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-0.5 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              if (!value && handleRowDeselection) {
                handleRowDeselection(row.id);
              }
            }}
            aria-label="Select row"
            className="translate-y-0.5 cursor-pointer"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      ...baseColumns,
    ];
  }

  return baseColumns;
}; 
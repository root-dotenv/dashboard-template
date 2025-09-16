import { Checkbox } from "@/components/ui/checkbox";

// Custom Skeleton component for loading states
const Skeleton = ({ className = "", ...props }) => (
  <div
    className={`animate-pulse bg-gray-200/60 rounded ${className}`}
    {...props}
  />
);

// Table components to match your existing structure
const Table = ({ children, ...props }) => (
  <table className="w-full caption-bottom text-sm" {...props}>
    {children}
  </table>
);

const TableHeader = ({ children, ...props }) => (
  <thead className="[&_tr]:border-b" {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, ...props }) => (
  <tbody className="[&_tr:last-child]:border-0" {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = "", ...props }) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = "", ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "", style = {}, ...props }) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    style={style}
    {...props}
  >
    {children}
  </td>
);

export const TableSkeletonLoader = ({ rows = 15 }: { rows?: number }) => {
  return (
    <div className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b-2 border-gray-300">
            {/* Select Column */}
            <TableHead className="h-14 px-6 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] border-r border-gray-300 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm w-[50px]">
              <div className="flex items-center justify-center">
                <Checkbox
                  disabled
                  className="border-gray-300 rounded hover:bg-gray-50 mr-5"
                />
              </div>
            </TableHead>

            {/* Room Code Column */}
            <TableHead className="h-14 px-6 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] border-r border-gray-300 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm w-[160px]">
              ROOM CODE
            </TableHead>

            {/* Room Type Column */}
            <TableHead className="h-14 px-6 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] border-r border-gray-300 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm w-[220px]">
              ROOM TYPE
            </TableHead>

            {/* Bed Type Column */}
            <TableHead className="h-14 px-6 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] border-r border-gray-300 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm w-[180px]">
              BED TYPE
            </TableHead>

            {/* Capacity Column */}
            <TableHead className="h-14 px-6 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] border-r border-gray-300 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm w-[120px]">
              CAPACITY
            </TableHead>

            {/* Floor Column */}
            <TableHead className="h-14 px-6 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] border-r border-gray-300 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm w-[120px]">
              FLOOR
            </TableHead>

            {/* Price Column */}
            <TableHead className="h-14 px-6 text-right align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] border-r border-gray-300 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm w-[180px]">
              PRICE PER NIGHT
            </TableHead>

            {/* Status Column */}
            <TableHead className="h-14 px-6 text-left align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] border-r border-gray-300 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm w-[160px]">
              STATUS
            </TableHead>

            {/* Actions Column */}
            <TableHead className="h-14 px-6 text-center align-middle font-semibold text-[13px] uppercase tracking-wide text-[#667085] bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm w-[80px]">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="pt-4">
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow
              key={index}
              className="border-b border-gray-200 hover:bg-transparent"
            >
              {/* Select Column */}
              <TableCell
                className="px-6 py-4 align-middle border-r border-gray-200 text-gray-700"
                style={{ minHeight: "60px" }}
              >
                <div className="w-full flex items-center justify-center">
                  <Checkbox
                    disabled
                    className="border-gray-300 rounded bg-white hover:bg-gray-50 mr-5"
                  />
                </div>
              </TableCell>

              {/* Room Code Column */}
              <TableCell
                className="px-6 py-4 align-middle border-r border-gray-200 text-gray-700"
                style={{ minHeight: "60px" }}
              >
                <Skeleton className="h-4 w-16" />
              </TableCell>

              {/* Room Type Column */}
              <TableCell
                className="px-6 py-4 align-middle border-r border-gray-200 text-gray-700"
                style={{ minHeight: "60px" }}
              >
                <Skeleton className="h-4 w-24" />
              </TableCell>

              {/* Bed Type Column */}
              <TableCell
                className="px-6 py-4 align-middle border-r border-gray-200 text-gray-700"
                style={{ minHeight: "60px" }}
              >
                <Skeleton className="h-4 w-20" />
              </TableCell>

              {/* Capacity Column */}
              <TableCell
                className="px-6 py-4 align-middle border-r border-gray-200 text-gray-700"
                style={{ minHeight: "60px" }}
              >
                <div className="flex items-center px-3 py-1">
                  <Skeleton className="w-4 h-4 mr-2 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </TableCell>

              {/* Floor Column */}
              <TableCell
                className="px-6 py-4 align-middle border-r border-gray-200 text-gray-700"
                style={{ minHeight: "60px" }}
              >
                <Skeleton className="h-4 w-20" />
              </TableCell>

              {/* Price Column */}
              <TableCell
                className="px-6 py-4 align-middle border-r border-gray-200 text-gray-700"
                style={{ minHeight: "60px" }}
              >
                <div className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </TableCell>

              {/* Status Column */}
              <TableCell
                className="px-6 py-4 align-middle border-r border-gray-200 text-gray-700"
                style={{ minHeight: "60px" }}
              >
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>

              {/* Actions Column */}
              <TableCell
                className="px-6 py-4 align-middle text-gray-700"
                style={{ minHeight: "60px" }}
              >
                <div className="flex justify-center">
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

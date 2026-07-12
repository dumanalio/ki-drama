"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Search,
} from "lucide-react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BOOKING_STATUS_LABELS,
  LEAD_SEGMENT_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_VARIANTS,
} from "@/lib/labels";
import type { LeadListRow } from "@/lib/queries/admin-leads";
import { formatBerlin } from "@/lib/time";
import type { LeadSegment, LeadStatus } from "@/types/database";

const PAGE_SIZE = 25;

const STATUS_FILTER_OPTIONS: LeadStatus[] = [
  "neu",
  "kontaktiert",
  "termin_gebucht",
  "gespraech_gefuehrt",
  "kunde",
  "kein_interesse",
];
const SEGMENT_FILTER_OPTIONS: LeadSegment[] = ["privat", "business"];

function exportCsv(rows: LeadListRow[]) {
  const header = [
    "Name",
    "E-Mail",
    "Segment",
    "Status",
    "Termin",
    "Quelle",
    "Erstellt",
  ];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = rows.map((row) =>
    [
      row.name,
      row.email,
      LEAD_SEGMENT_LABELS[row.segment],
      LEAD_STATUS_LABELS[row.status],
      row.bookingStartsAt
        ? formatBerlin(row.bookingStartsAt, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      row.source ?? "",
      formatBerlin(row.createdAt, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    ]
      .map(escape)
      .join(";")
  );
  const csv = [header.map(escape).join(";"), ...lines].join("\n");

  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function LeadsTable({ data }: { data: LeadListRow[] }) {
  const router = useRouter();

  // Suche, Filter, Sortierung und Seite leben in der URL (nuqs) — überleben
  // einen Reload und lassen sich als Lesezeichen speichern/teilen.
  const [globalFilter, setGlobalFilter] = useQueryState(
    "q",
    parseAsString.withDefault("")
  );
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("alle")
  );
  const [segmentFilter, setSegmentFilter] = useQueryState(
    "segment",
    parseAsString.withDefault("alle")
  );
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    parseAsString.withDefault("")
  );
  const [sortDir, setSortDir] = useQueryState(
    "dir",
    parseAsStringEnum(["asc", "desc"]).withDefault("asc")
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const sorting: SortingState = React.useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortDir === "desc" }] : []),
    [sortBy, sortDir]
  );

  function handleSortingChange(updater: React.SetStateAction<SortingState>) {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (next.length === 0) {
      void setSortBy(null);
      void setSortDir(null);
    } else {
      void setSortBy(next[0].id);
      void setSortDir(next[0].desc ? "desc" : "asc");
    }
  }

  const pagination: PaginationState = React.useMemo(
    () => ({ pageIndex: page - 1, pageSize: PAGE_SIZE }),
    [page]
  );

  function handlePaginationChange(
    updater: React.SetStateAction<PaginationState>
  ) {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    void setPage(next.pageIndex + 1 === 1 ? null : next.pageIndex + 1);
  }

  function handleGlobalFilterChange(value: string) {
    void setGlobalFilter(value.length > 0 ? value : null);
    void setPage(null);
  }

  function handleStatusFilterChange(value: string) {
    void setStatusFilter(value === "alle" ? null : value);
    void setPage(null);
  }

  function handleSegmentFilterChange(value: string) {
    void setSegmentFilter(value === "alle" ? null : value);
    void setPage(null);
  }

  const filteredData = React.useMemo(() => {
    return data.filter((row) => {
      if (statusFilter !== "alle" && row.status !== statusFilter) return false;
      if (segmentFilter !== "alle" && row.segment !== segmentFilter)
        return false;
      return true;
    });
  }, [data, statusFilter, segmentFilter]);

  const columns = React.useMemo<ColumnDef<LeadListRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            href={`/admin/leads/${row.original.id}`}
            onClick={(event) => event.stopPropagation()}
            className="text-ink hover:text-accent focus-visible:ring-accent rounded font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "email",
        header: "E-Mail",
        cell: ({ row }) => (
          <span className="text-ink-soft">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "segment",
        header: "Segment",
        cell: ({ row }) => (
          <Badge variant="soft">
            {LEAD_SEGMENT_LABELS[row.original.segment]}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={LEAD_STATUS_VARIANTS[row.original.status]}>
            {LEAD_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "termin",
        accessorFn: (row) => row.bookingStartsAt ?? "",
        header: "Termin",
        cell: ({ row }) =>
          row.original.bookingStartsAt ? (
            <span className="text-ink-soft text-[14px]">
              {formatBerlin(row.original.bookingStartsAt, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {row.original.bookingStatus &&
              row.original.bookingStatus !== "gebucht"
                ? ` · ${BOOKING_STATUS_LABELS[row.original.bookingStatus]}`
                : ""}
            </span>
          ) : (
            <span className="text-ink-muted text-[14px]">—</span>
          ),
      },
      {
        accessorKey: "source",
        header: "Quelle",
        cell: ({ row }) => (
          <span className="text-ink-soft text-[14px]">
            {row.original.source ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Erstellt",
        cell: ({ row }) => (
          <span className="text-ink-soft text-[14px]">
            {formatBerlin(row.original.createdAt, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: (updater) =>
      handleGlobalFilterChange(
        typeof updater === "function" ? updater(globalFilter) : updater
      ),
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const lead = row.original;
      return (
        lead.name.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search) ||
        (lead.company?.toLowerCase().includes(search) ?? false)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const visibleRowCount = table.getFilteredRowModel().rows.length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="text-ink-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={globalFilter}
            onChange={(event) => handleGlobalFilterChange(event.target.value)}
            placeholder="Name, E-Mail oder Firma suchen…"
            className="pl-9"
            aria-label="Leads durchsuchen"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => handleStatusFilterChange(value ?? "alle")}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            {STATUS_FILTER_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={segmentFilter}
          onValueChange={(value) => handleSegmentFilterChange(value ?? "alle")}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Segmente</SelectItem>
            {SEGMENT_FILTER_OPTIONS.map((segment) => (
              <SelectItem key={segment} value={segment}>
                {LEAD_SEGMENT_LABELS[segment]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() =>
            exportCsv(
              table.getFilteredRowModel().rows.map((row) => row.original)
            )
          }
          disabled={visibleRowCount === 0}
        >
          <Download className="size-4" aria-hidden="true" />
          CSV exportieren
        </Button>
      </div>

      {visibleRowCount === 0 ? (
        <EmptyState
          icon={Search}
          title="Keine Leads gefunden"
          description="Passe die Suche oder die Filter an, um Ergebnisse zu sehen."
        />
      ) : (
        <>
          <div className="border-line overflow-x-auto rounded-xl border">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-line border-b">
                    {headerGroup.headers.map((header) => {
                      const sortState = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          className="bg-surface-alt text-ink-muted px-4 py-3 text-[13px] font-medium"
                        >
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="hover:text-ink focus-visible:ring-accent flex items-center gap-1.5 rounded transition-colors duration-[120ms] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {sortState === "asc" ? (
                              <ArrowUp
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            ) : sortState === "desc" ? (
                              <ArrowDown
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            ) : (
                              <ArrowUpDown
                                className="size-3.5 opacity-40"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() =>
                      router.push(`/admin/leads/${row.original.id}`)
                    }
                    className="border-line hover:bg-surface-alt cursor-pointer border-b last:border-b-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-ink-muted text-[13px]">
              {visibleRowCount} Lead{visibleRowCount === 1 ? "" : "s"} · Seite{" "}
              {table.getState().pagination.pageIndex + 1} von{" "}
              {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Zurück
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Weiter
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/src/core/infrastructure/utils/cn";
import { DataTableToolbar } from "@/src/core/presentation/components/molecules/data-table-toolbar";
import { Button } from "@/src/core/presentation/components/ui/button";
import {
  Columns, Edit2, Trash2, Eye, ArrowUp, ArrowDown, ArrowUpDown,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  Copy, FileText, ListFilter, Square, CheckSquare, MinusSquare, GripVertical, Download
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Wizard } from "@/src/core/presentation/components/organisms/wizard";
import { ConfirmDialog } from "@/src/core/presentation/components/molecules/confirm-dialog";
import { Dialog } from "@/src/core/presentation/components/ui/dialog";
import { Label } from "@/src/core/presentation/components/ui/label";
import { Input } from "@/src/core/presentation/components/ui/input";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPageWindow(current: number, total: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
  const delta = 1;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  pages.push(1);
  if (left > 2) pages.push('ellipsis-start');
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push('ellipsis-end');
  pages.push(total);
  return pages;
}

const extractTextFromNode = (node: React.ReactNode): string => {
  if (node === null || node === undefined) return "";
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromNode).join(" ").trim();
  if (React.isValidElement(node)) {
    const children = (node.props as { children?: React.ReactNode } | null | undefined)?.children;
    if (children) return extractTextFromNode(children);
  }
  return "";
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterType = 'text' | 'select' | 'date-range' | 'number-range' | 'boolean';

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface TableFilterConfig<T> {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  filterFn?: (row: T, filterValue: any) => boolean;
}

export interface SortEntry {
  key: string;
  direction: "asc" | "desc";
  priority: number;
}

export interface SpreadsheetColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string | number;
  sortable?: boolean;
  sortValue?: (row: T) => any;
  filterable?: boolean | 'select';
  filterValue?: (row: T) => string;
  fixed?: 'left' | 'right';
  resizable?: boolean;
}

interface SpreadsheetTableProps<T> {
  data: T[];
  columns: SpreadsheetColumn<T>[];
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  containerClassName?: string;
  maxHeight?: string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, term: string) => boolean;
  actionLabel?: string;
  onAction?: () => void;
  onExport?: (data: T[]) => void;
  pageSize?: number;
  disablePageSizeSelector?: boolean;
  emptyState?: { icon: React.ElementType; title: string; description: string };
  canManage?: boolean;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => Promise<{ ok: boolean; error?: { message: string } }> | void;
  canEdit?: (item: T) => boolean;
  rowActions?: {
    label: string | ((item: T) => string);
    icon: React.ReactNode | ((item: T) => React.ReactNode);
    onClick: (item: T) => void;
    variant?: "ghost" | "outline";
    className?: string | ((item: T) => string);
    isVisible?: (item: T) => boolean;
    disabled?: (item: T) => boolean;
  }[];
  deleteConfirmTitle?: string | ((item: T) => string);
  deleteConfirmDescription?: string | ((item: T) => string);
  filters?: TableFilterConfig<T>[];
  onSelectionChange?: (selectedItems: T[]) => void;
  stateKey?: string;
  serverSide?: boolean;
  totalCount?: number;
  onFetch?: (params: { page: number; pageSize: number; search: string; sort: SortEntry[]; filters: Record<string, any> }) => Promise<T[]>;
  isLoading?: boolean;
  draggableRows?: boolean;
  onRowReorder?: (from: number, to: number, newData: T[]) => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ActionIconButtonProps {
  label: string;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "ghost" | "outline";
  className?: string;
  disabled?: boolean;
}

function ActionIconButton({ label, children, onClick, variant = "ghost", className, disabled = false }: ActionIconButtonProps) {
  return (
    <div className="relative group/action">
      <Button variant={variant} size="icon" className={className} disabled={disabled} title={label} aria-label={label} onClick={onClick}>
        {children}
      </Button>
      <span className={cn("pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md", "bg-stone-900 px-2 py-1 text-[10px] font-medium text-white shadow-md", "opacity-0 transition-opacity group-hover/action:opacity-100 z-50")}>
        {label}
        <span className="absolute -bottom-1 right-3 border-4 border-transparent border-t-stone-900" />
      </span>
    </div>
  );
}

// ─── Export Actions Dropdown ──────────────────────────────────────────────────

function ExportActionsDropdown({ onExportExcel, onExportCSV, onCopy }: { onExportExcel: () => void, onExportCSV: () => void, onCopy: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="outline" className="gap-1.5" onClick={() => setIsOpen(!isOpen)} title="Acciones de exportación">
        Acciones
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("size-3.5 transition-transform", isOpen ? "rotate-180" : "")}><path d="m6 9 6 6 6-6"/></svg>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10 z-50 p-1 border border-stone-200 dark:border-zinc-800">
          <button onClick={() => { onExportExcel(); setIsOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-sm transition-colors text-left">
            <Download className="size-4" />
            Excel
          </button>
          <button onClick={() => { onExportCSV(); setIsOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-sm transition-colors text-left">
            <FileText className="size-4" />
            CSV
          </button>
          <button onClick={() => { onCopy(); setIsOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-sm transition-colors text-left">
            <Copy className="size-4" />
            Copiar al portapapeles
          </button>
        </div>
      )}
    </div>
  );
}

// ─── State persistence ────────────────────────────────────────────────────────

interface PersistedState {
  sortKeys: SortEntry[];
  hiddenColumns: Record<string, boolean>;
  pageSize: number;
  columnFilters: Record<string, string>;
  columnWidths: Record<string, number>;
}

function loadState(key: string): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(`spreadsheet_state__${key}`);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch { return {}; }
}

function saveState(key: string, state: PersistedState) {
  try { localStorage.setItem(`spreadsheet_state__${key}`, JSON.stringify(state)); } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpreadsheetTable<T>({
  data,
  columns,
  onRowClick,
  className,
  containerClassName,
  maxHeight = "600px",
  searchPlaceholder = "Buscar...",
  searchFilter,
  actionLabel,
  onAction,
  onExport,
  pageSize: pageSizeProp = 10,
  disablePageSizeSelector = false,
  emptyState,
  canManage = true,
  onView,
  onEdit,
  onDelete,
  canEdit,
  rowActions,
  deleteConfirmTitle,
  deleteConfirmDescription,
  filters,
  onSelectionChange,
  stateKey,
  serverSide,
  totalCount,
  onFetch,
  isLoading: isLoadingProp,
  draggableRows,
  onRowReorder,
}: SpreadsheetTableProps<T>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const persisted = useMemo(() => (stateKey ? loadState(stateKey) : {}), []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(persisted.pageSize ?? pageSizeProp);
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>(persisted.hiddenColumns ?? {});
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFiltersMenuOpen, setIsFiltersMenuOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortKeys, setSortKeys] = useState<SortEntry[]>(persisted.sortKeys ?? []);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(persisted.columnFilters ?? {});
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const lastSelectedIndex = useRef<number | null>(null);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(persisted.columnWidths ?? {});
  const [serverData, setServerData] = useState<T[]>([]);
  const [isServerFetching, setIsServerFetching] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!stateKey) return;
    saveState(stateKey, { sortKeys, hiddenColumns, pageSize, columnFilters, columnWidths });
  }, [stateKey, sortKeys, hiddenColumns, pageSize, columnFilters, columnWidths]);

  useEffect(() => {
    if (!serverSide || !onFetch) return;
    const fetchId = setTimeout(async () => {
      setIsServerFetching(true);
      try {
        const result = await onFetch({ page: currentPage, pageSize, search: searchTerm, sort: sortKeys, filters: { ...activeFilters, ...columnFilters } });
        setServerData(result);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsServerFetching(false);
      }
    }, 300);
    return () => clearTimeout(fetchId);
  }, [serverSide, onFetch, currentPage, pageSize, searchTerm, sortKeys, activeFilters, columnFilters]);

  const displayData = serverSide && onFetch ? serverData : data;

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);
  useEffect(() => { setCurrentPage(1); }, [pageSize]);
  useEffect(() => { setCurrentPage(1); }, [columnFilters]);
  useEffect(() => { setCurrentPage(1); }, [sortKeys]);
  useEffect(() => { setSelectedIndices(new Set()); }, [data]);

  const prevSelectionRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (!onSelectionChange) return;
    if (prevSelectionRef.current.size === selectedIndices.size && [...selectedIndices].every(i => prevSelectionRef.current.has(i))) return;
    prevSelectionRef.current = new Set(selectedIndices);
    onSelectionChange(data.filter((_, i) => selectedIndices.has(i)));
  }, [selectedIndices, data, onSelectionChange]);

  const visibleColumns = useMemo(() => columns.filter((c) => !hiddenColumns[c.key]), [columns, hiddenColumns]);
  const fixedLeftCols = useMemo(() => visibleColumns.filter(c => c.fixed === 'left'), [visibleColumns]);
  const fixedRightCols = useMemo(() => visibleColumns.filter(c => c.fixed === 'right'), [visibleColumns]);
  const scrollableCols = useMemo(() => visibleColumns.filter(c => !c.fixed), [visibleColumns]);
  const orderedCols = useMemo(() => [...fixedLeftCols, ...scrollableCols, ...fixedRightCols], [fixedLeftCols, scrollableCols, fixedRightCols]);

  const colSelectOptions = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const col of visibleColumns) {
      if (col.filterable !== 'select') continue;
      const values = new Set<string>();
      for (const row of data) {
        const val = col.filterValue ? col.filterValue(row) : col.render ? extractTextFromNode(col.render(row, 0)) : String((row as any)[col.key] ?? "");
        if (val) values.add(val);
      }
      result[col.key] = Array.from(values).sort((a, b) => a.localeCompare(b, 'es-MX'));
    }
    return result;
  }, [visibleColumns, data]);

  const searchFilteredData = useMemo(() => {
    if (!displayData) return [];
    if (serverSide) return displayData;
    let result = displayData;
    if (searchTerm.trim() && searchFilter) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => searchFilter(item, term));
    }
    if (filters && Object.keys(activeFilters).length > 0) {
      result = result.filter((item) => filters.every((fc) => {
        const fv = activeFilters[fc.id];
        if (fv === undefined || fv === null || fv === "") return true;
        if (fc.filterFn) return fc.filterFn(item, fv);
        const iv = (item as any)[fc.id];
        if (fc.type === 'select') return iv === fv;
        if (fc.type === 'text') return String(iv).toLowerCase().includes(String(fv).toLowerCase());
        if (fc.type === 'boolean') return Boolean(iv) === Boolean(fv);
        return true;
      }));
    }
    const activeColFilters = Object.entries(columnFilters).filter(([, v]) => v.trim() !== "");
    if (activeColFilters.length > 0) {
      result = result.filter((item) => activeColFilters.every(([key, fv]) => {
        const col = columns.find(c => c.key === key);
        if (!col) return true;
        const raw = col.filterValue ? col.filterValue(item) : col.render ? extractTextFromNode(col.render(item, 0)) : String((item as any)[key] ?? "");
        return raw.toLowerCase().includes(fv.toLowerCase());
      }));
    }
    if (sortKeys.length > 0) {
      result = [...result].sort((a, b) => {
        for (const sort of sortKeys) {
          const col = columns.find(c => c.key === sort.key);
          const aVal = col?.sortValue ? col.sortValue(a) : (a as any)[sort.key];
          const bVal = col?.sortValue ? col.sortValue(b) : (b as any)[sort.key];
          if (aVal === bVal) continue;
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const cmp = aVal.localeCompare(bVal, 'es-MX');
            return sort.direction === 'asc' ? cmp : -cmp;
          }
          if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return result;
  }, [displayData, serverSide, searchTerm, searchFilter, activeFilters, filters, columnFilters, sortKeys, columns]);

  const computedTotalCount = serverSide && totalCount !== undefined ? totalCount : searchFilteredData.length;
  const totalPages = Math.max(1, Math.ceil(computedTotalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    if (serverSide) return displayData;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return searchFilteredData.slice(startIndex, startIndex + pageSize);
  }, [serverSide, displayData, searchFilteredData, safeCurrentPage, pageSize]);

  const handleSortClick = useCallback((col: SpreadsheetColumn<T>, shiftKey: boolean) => {
    if (!col.sortable) return;
    setSortKeys(prev => {
      const existingIdx = prev.findIndex(s => s.key === col.key);
      if (shiftKey) {
        if (existingIdx === -1) return [...prev, { key: col.key, direction: 'asc', priority: prev.length + 1 }];
        const entry = prev[existingIdx];
        if (entry.direction === 'asc') { const u = [...prev]; u[existingIdx] = { ...entry, direction: 'desc' }; return u; }
        const removed = prev.filter((_, i) => i !== existingIdx);
        return removed.map((s, i) => ({ ...s, priority: i + 1 }));
      } else {
        if (existingIdx === -1 || prev.length > 1) return [{ key: col.key, direction: 'asc', priority: 1 }];
        const entry = prev[0];
        if (entry.direction === 'asc') return [{ key: col.key, direction: 'desc', priority: 1 }];
        return [];
      }
    });
  }, []);

  const handleRowCheckbox = useCallback((rowIdx: number, e: React.MouseEvent) => {
    const shiftKey = e.shiftKey;
    const ctrlKey = e.ctrlKey || e.metaKey;
    setSelectedIndices(prev => {
      const next = new Set(prev);
      const globalIdx = (safeCurrentPage - 1) * pageSize + rowIdx;
      if (shiftKey && lastSelectedIndex.current !== null) {
        const from = Math.min(lastSelectedIndex.current, globalIdx);
        const to = Math.max(lastSelectedIndex.current, globalIdx);
        for (let i = from; i <= to; i++) next.add(i);
        return next;
      }
      if (ctrlKey) {
        if (next.has(globalIdx)) next.delete(globalIdx); else next.add(globalIdx);
        lastSelectedIndex.current = globalIdx;
        return next;
      }
      if (next.has(globalIdx)) { next.delete(globalIdx); lastSelectedIndex.current = null; }
      else { next.add(globalIdx); lastSelectedIndex.current = globalIdx; }
      return next;
    });
  }, [safeCurrentPage, pageSize]);

  const handleSelectAll = useCallback(() => {
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const pageIndices = paginatedData.map((_, i) => pageStart + i);
    const allSelected = pageIndices.every(i => selectedIndices.has(i));
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (allSelected) pageIndices.forEach(i => next.delete(i));
      else pageIndices.forEach(i => next.add(i));
      return next;
    });
  }, [safeCurrentPage, pageSize, paginatedData, selectedIndices]);

  const pageSelectionState = useMemo(() => {
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const pageIndices = paginatedData.map((_, i) => pageStart + i);
    if (pageIndices.length === 0) return 'none';
    const count = pageIndices.filter(i => selectedIndices.has(i)).length;
    if (count === 0) return 'none';
    if (count === pageIndices.length) return 'all';
    return 'some';
  }, [safeCurrentPage, pageSize, paginatedData, selectedIndices]);

  const hasSelection = onSelectionChange !== undefined;

  const fixedLeftOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let acc = 0;
    if (draggableRows) acc += 32;
    if (hasSelection) acc += 36;
    for (const col of fixedLeftCols) {
      offsets[col.key] = acc;
      acc += columnWidths[col.key] ?? (typeof col.width === 'number' ? col.width : 120);
    }
    return offsets;
  }, [fixedLeftCols, hasSelection, draggableRows, columnWidths]);

  const fixedRightOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let acc = 120;
    for (let i = fixedRightCols.length - 1; i >= 0; i--) {
      const col = fixedRightCols[i];
      offsets[col.key] = acc;
      acc += columnWidths[col.key] ?? (typeof col.width === 'number' ? col.width : 120);
    }
    return offsets;
  }, [fixedRightCols, columnWidths]);

  const handleResizeStart = useCallback((e: React.MouseEvent, colKey: string) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const th = e.currentTarget.closest('th');
    const startWidth = th ? th.getBoundingClientRect().width : 100;
    
    const onMouseMove = (me: MouseEvent) => {
      const newWidth = Math.max(60, startWidth + (me.clientX - startX));
      setColumnWidths(prev => ({ ...prev, [colKey]: newWidth }));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  }, [dragOverIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const actualDataArray = [...(serverSide ? displayData : data)];
    const fromGlobal = serverSide ? draggedIndex : data.indexOf(paginatedData[draggedIndex]);
    const toGlobal = serverSide ? dropIndex : data.indexOf(paginatedData[dropIndex]);
    
    if (fromGlobal !== -1 && toGlobal !== -1) {
       const [moved] = actualDataArray.splice(fromGlobal, 1);
       actualDataArray.splice(toGlobal, 0, moved);
       if (onRowReorder) onRowReorder(fromGlobal, toGlobal, actualDataArray);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, serverSide, displayData, data, paginatedData, onRowReorder]);

  const buildExportRows = useCallback(() => {
    return searchFilteredData.map((item, index) => {
      const rowData: Record<string, unknown> = {};
      visibleColumns.forEach((col) => {
        let cellText = col.render ? extractTextFromNode(col.render(item, index)) : String((item as any)[col.key] ?? "");
        rowData[typeof col.header === "string" ? col.header : col.key] = cellText.replace(/\s+/g, " ").trim();
      });
      return rowData;
    });
  }, [searchFilteredData, visibleColumns]);

  const handleExport = () => {
    if (onExport) { onExport(searchFilteredData); return; }
    if (!searchFilteredData?.length) { toast.error("No hay datos para exportar"); return; }
    try {
      toast.info("Generando Excel...");
      const ws = XLSX.utils.json_to_sheet(buildExportRows());
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Datos");
      XLSX.writeFile(wb, `Reporte_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Excel exportado correctamente");
    } catch { toast.error("Error al generar Excel"); }
  };

  const handleExportCSV = () => {
    if (!searchFilteredData?.length) { toast.error("No hay datos para exportar"); return; }
    try {
      const rows = buildExportRows();
      const headers = Object.keys(rows[0]);
      const escape = (v: unknown) => { const s = String(v ?? ""); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s; };
      const csv = [headers.map(escape).join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
      const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a'); a.href = url; a.download = `Reporte_${new Date().toISOString().split('T')[0]}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exportado correctamente");
    } catch { toast.error("Error al generar CSV"); }
  };

  const handleCopyToClipboard = async () => {
    if (!searchFilteredData?.length) { toast.error("No hay datos para copiar"); return; }
    try {
      const rows = buildExportRows(); const headers = Object.keys(rows[0]);
      await navigator.clipboard.writeText([headers.join('\t'), ...rows.map(r => headers.map(h => String(r[h] ?? '')).join('\t'))].join('\n'));
      toast.success(`${rows.length} registros copiados al portapapeles`);
    } catch { toast.error("Error al copiar. Verifica los permisos del navegador."); }
  };

  const _onEdit = canManage ? onEdit : undefined;
  const _onDelete = canManage ? onDelete : undefined;
  const hasRowActions = true;

  const handleDeleteRequest = (item: T) => setPendingDeleteItem(item);
  const handleCancelDelete = () => setPendingDeleteItem(null);
  const handleConfirmDelete = async () => {
    if (!pendingDeleteItem || !_onDelete) return;
    setIsDeleting(true);
    try {
      const result = await _onDelete(pendingDeleteItem);
      if (result && !result.ok) toast.error(result.error?.message ?? "Error al eliminar");
      else if (result && result.ok) toast.success("Registro eliminado correctamente");
    } catch { toast.error("Error inesperado al eliminar"); }
    finally { setIsDeleting(false); setPendingDeleteItem(null); }
  };

  const computedDeleteTitle = pendingDeleteItem && deleteConfirmTitle ? (typeof deleteConfirmTitle === "function" ? deleteConfirmTitle(pendingDeleteItem) : deleteConfirmTitle) : "¿Eliminar registro?";
  const computedDeleteDescription = pendingDeleteItem && deleteConfirmDescription ? (typeof deleteConfirmDescription === "function" ? deleteConfirmDescription(pendingDeleteItem) : deleteConfirmDescription) : "Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este elemento?";

  const showToolbar = !!searchFilter || !!onExport || !!actionLabel || !!onAction || columns.length > 0;
  const pageWindow = useMemo(() => buildPageWindow(safeCurrentPage, totalPages), [safeCurrentPage, totalPages]);
  const totalUnfiltered = serverSide && totalCount !== undefined ? totalCount : (displayData?.length ?? 0);
  const totalFiltered = serverSide && totalCount !== undefined ? totalCount : searchFilteredData.length;
  const isFiltered = totalFiltered < totalUnfiltered;
  const statusStart = (safeCurrentPage - 1) * pageSize + 1;
  const statusEnd = Math.min(safeCurrentPage * pageSize, totalFiltered);
  const activeColFilterCount = Object.values(columnFilters).filter(v => v.trim() !== "").length;
  const hasFilterableColumns = visibleColumns.some(c => !!c.filterable);

  const renderColHeader = (col: SpreadsheetColumn<T>) => {
    const sortEntry = sortKeys.find(s => s.key === col.key);
    const sortIndex = sortKeys.findIndex(s => s.key === col.key);
    const isFixedLeft = col.fixed === 'left';
    const isFixedRight = col.fixed === 'right';
    const computedWidth = columnWidths[col.key] ?? col.width;
    return (
      <th
        key={col.key}
        onClick={(e) => { if (col.sortable) handleSortClick(col, e.shiftKey); }}
        className={cn(
          "px-3 py-1.5 font-bold text-slate-700 dark:text-zinc-200 text-[11px] whitespace-nowrap relative group/th",
          "border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 transition-colors select-none",
          col.sortable ? "cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700" : "",
          col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left",
          (isFixedLeft || isFixedRight) && "sticky z-20",
          isFixedLeft && "shadow-[2px_0_6px_rgba(0,0,0,0.04)]",
          isFixedRight && "shadow-[-2px_0_6px_rgba(0,0,0,0.04)]",
        )}
        style={{ width: computedWidth, ...(isFixedLeft ? { left: fixedLeftOffsets[col.key] } : {}), ...(isFixedRight ? { right: fixedRightOffsets[col.key] } : {}) }}
      >
        <div className={cn("flex items-center gap-1", col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start")}>
          {col.header}
          {col.sortable && (
            <div className="flex items-center gap-0.5">
              {sortEntry ? (
                <>
                  {sortEntry.direction === 'asc' ? <ArrowUp className="size-3 text-[#1a5c3a] dark:text-green-400" /> : <ArrowDown className="size-3 text-[#1a5c3a] dark:text-green-400" />}
                  {sortKeys.length > 1 && (
                    <span className="flex size-3.5 items-center justify-center rounded-full bg-[#1a5c3a] text-[8px] font-bold text-white leading-none">
                      {sortIndex + 1}
                    </span>
                  )}
                </>
              ) : (
                <ArrowUpDown className="size-3 opacity-0 group-hover/th:opacity-40" />
              )}
            </div>
          )}
        </div>
        {col.resizable && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#1a5c3a] dark:hover:bg-green-500 z-10 transition-colors"
            onMouseDown={(e) => handleResizeStart(e, col.key)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </th>
    );
  };

  return (
    <div className={cn("bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-[20px] shadow-sm flex flex-col overflow-hidden", className, containerClassName)}>
      {showToolbar && (
        <div className="p-4 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50">
          <DataTableToolbar
            searchPlaceholder={searchPlaceholder}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            actionLabel={canManage ? actionLabel : undefined}
            onAction={canManage ? onAction : undefined}
            onFiltersClick={filters && filters.length > 0 ? () => setIsFiltersMenuOpen(true) : undefined}
            filtersCount={Object.values(activeFilters).filter((val) => { if (val === undefined || val === null || val === '') return false; if (typeof val === 'object' && Object.keys(val).length === 0) return false; return true; }).length}
            extraActions={
              <div className="flex items-center gap-2 flex-wrap">
                <ExportActionsDropdown 
                  onExportExcel={handleExport} 
                  onExportCSV={handleExportCSV} 
                  onCopy={handleCopyToClipboard} 
                />
                <Button variant="outline" className="gap-2" onClick={() => setIsColumnsMenuOpen(true)}><Columns className="size-4" />Columnas</Button>
              </div>
            }
          />
        </div>
      )}

      {hasSelection && selectedIndices.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a5c3a]/5 border-b border-[#1a5c3a]/20 text-sm">
          <span className="text-[#1a5c3a] dark:text-green-400 font-medium">{selectedIndices.size} fila{selectedIndices.size !== 1 ? 's' : ''} seleccionada{selectedIndices.size !== 1 ? 's' : ''}</span>
          <button className="text-xs text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-100 underline" onClick={() => setSelectedIndices(new Set())}>Limpiar selección</button>
        </div>
      )}

      {searchFilteredData.length === 0 && emptyState ? (
        <div className="flex flex-col items-center justify-center py-20 bg-stone-50/50 text-center">
          <div className="size-16 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <emptyState.icon className="size-8 text-stone-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">{emptyState.title}</h3>
          <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">{emptyState.description}</p>
        </div>
      ) : (
        <>
          <div className="overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-500" style={{ maxHeight }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-black/20 sticky top-0 z-20">
                <tr>
                  {draggableRows && (
                    <th className="w-8 px-2 py-1.5 border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 sticky left-0 z-30" />
                  )}
                  {hasSelection && (
                    <th className="w-9 px-2 py-1.5 border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 sticky z-30 cursor-pointer" onClick={handleSelectAll} style={{ left: draggableRows ? 32 : 0 }}>
                      <div className="flex items-center justify-center">
                        {pageSelectionState === 'all' ? <CheckSquare className="size-3.5 text-[#1a5c3a] dark:text-green-400" /> : pageSelectionState === 'some' ? <MinusSquare className="size-3.5 text-[#1a5c3a] dark:text-green-400" /> : <Square className="size-3.5 text-slate-400 dark:text-zinc-500" />}
                      </div>
                    </th>
                  )}
                  {orderedCols.map(renderColHeader)}
                  {hasRowActions && (
                    <th className="px-3 py-1.5 font-semibold text-slate-700 dark:text-zinc-200 text-[11px] whitespace-nowrap border border-slate-300 dark:border-zinc-700 text-right sticky right-0 bg-slate-100 dark:bg-zinc-800 z-30 w-[120px] shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">Acciones</th>
                  )}
                </tr>

                {showColumnFilters && (
                  <tr className="bg-stone-50 dark:bg-zinc-900/50">
                    {draggableRows && <th className="w-8 border border-slate-200 dark:border-zinc-700 px-1 sticky left-0 bg-stone-50 dark:bg-zinc-900/50 z-30" />}
                    {hasSelection && <th className="w-9 border border-slate-200 dark:border-zinc-700 px-1 sticky bg-stone-50 dark:bg-zinc-900/50 z-30" style={{ left: draggableRows ? 32 : 0 }} />}
                    {orderedCols.map((col) => {
                      const isFL = col.fixed === 'left'; const isFR = col.fixed === 'right';
                      return (
                        <th key={`filter-${col.key}`} className={cn("border border-slate-200 dark:border-zinc-700 px-1 py-1", (isFL || isFR) && "sticky z-20 bg-stone-50 dark:bg-zinc-900/50")} style={{ ...(isFL ? { left: fixedLeftOffsets[col.key] } : {}), ...(isFR ? { right: fixedRightOffsets[col.key] } : {}) }}>
                          {col.filterable === 'select' ? (
                            <select className="w-full h-7 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-[11px] text-stone-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#1a5c3a]/30" value={columnFilters[col.key] ?? ''} onChange={e => setColumnFilters(prev => ({ ...prev, [col.key]: e.target.value }))}>
                              <option value="">Todos</option>
                              {(colSelectOptions[col.key] ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          ) : col.filterable === true ? (
                            <input type="text" className="w-full h-7 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-[11px] text-stone-700 dark:text-zinc-200 placeholder:text-stone-300 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#1a5c3a]/30" placeholder="Buscar…" value={columnFilters[col.key] ?? ''} onChange={e => setColumnFilters(prev => ({ ...prev, [col.key]: e.target.value }))} />
                          ) : (
                            <div className="h-7" />
                          )}
                        </th>
                      );
                    })}
                    {hasRowActions && (
                      <th className="border border-slate-200 dark:border-zinc-700 px-2 py-1 sticky right-0 bg-stone-50 dark:bg-zinc-900/50 z-20 w-[120px]">
                        {activeColFilterCount > 0 && <button className="w-full text-[10px] text-red-500 hover:text-red-700 dark:hover:text-red-300 underline whitespace-nowrap" onClick={() => setColumnFilters({})}>Limpiar</button>}
                      </th>
                    )}
                  </tr>
                )}
              </thead>

              <tbody className="text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1d2227]">
                {(isServerFetching || isLoadingProp) ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-b border-gray-200 dark:border-white/10">
                      {draggableRows && <td className="p-2"><div className="h-4 w-4 bg-stone-200 dark:bg-zinc-700 rounded animate-pulse" /></td>}
                      {hasSelection && <td className="p-2"><div className="h-4 w-4 bg-stone-200 dark:bg-zinc-700 rounded animate-pulse" /></td>}
                      {orderedCols.map(col => <td key={col.key} className="p-2"><div className="h-4 w-full bg-stone-200 dark:bg-zinc-700 rounded animate-pulse" /></td>)}
                      {hasRowActions && <td className="p-2"><div className="h-4 w-12 bg-stone-200 dark:bg-zinc-700 rounded animate-pulse ml-auto" /></td>}
                    </tr>
                  ))
                ) : paginatedData.map((row, rowIdx) => {
                  const globalIdx = (safeCurrentPage - 1) * pageSize + rowIdx;
                  const isSelected = selectedIndices.has(globalIdx);
                  return (
                    <tr 
                      key={rowIdx} 
                      onClick={() => onRowClick?.(row, rowIdx)} 
                      draggable={draggableRows}
                      onDragStart={draggableRows ? (e) => handleDragStart(e, rowIdx) : undefined}
                      onDragOver={draggableRows ? (e) => handleDragOver(e, rowIdx) : undefined}
                      onDragEnd={draggableRows ? handleDragEnd : undefined}
                      onDrop={draggableRows ? (e) => handleDrop(e, rowIdx) : undefined}
                      className={cn(
                        "transition-colors group", 
                        isSelected && "bg-[#1a5c3a]/5 dark:bg-green-900/10", 
                        onRowClick ? "cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20" : "hover:bg-gray-50 dark:hover:bg-white/5",
                        draggedIndex === rowIdx && "opacity-50 bg-stone-100 dark:bg-zinc-800",
                        dragOverIndex === rowIdx && "border-t-2 border-[#1a5c3a]"
                      )}
                    >
                      {draggableRows && (
                        <td className="w-8 px-2 py-1.5 border border-gray-200 dark:border-white/10 text-stone-400 hover:text-stone-600 sticky left-0 bg-white dark:bg-[#1d2227] group-hover:bg-green-50 dark:group-hover:bg-green-900/20 z-10 cursor-grab active:cursor-grabbing">
                          <GripVertical className="size-4" />
                        </td>
                      )}
                      {hasSelection && (
                        <td className="w-9 px-2 py-1.5 border border-gray-200 dark:border-white/10 sticky bg-white dark:bg-[#1d2227] group-hover:bg-green-50 dark:group-hover:bg-green-900/20 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleRowCheckbox(rowIdx, e); }} style={{ left: draggableRows ? 32 : 0 }}>
                          <div className="flex items-center justify-center">
                            {isSelected ? <CheckSquare className="size-3.5 text-[#1a5c3a] dark:text-green-400" /> : <Square className="size-3.5 text-stone-300 dark:text-zinc-600 group-hover:text-stone-400" />}
                          </div>
                        </td>
                      )}
                      {orderedCols.map((col) => {
                        const isFL = col.fixed === 'left'; const isFR = col.fixed === 'right';
                        return (
                          <td key={`${rowIdx}-${col.key}`} className={cn("px-3 py-1.5 text-[11px] font-medium border border-gray-200 dark:border-white/10 whitespace-nowrap", col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left", (isFL || isFR) && "sticky z-10 bg-white dark:bg-[#1d2227] group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors", isFL && "shadow-[2px_0_6px_rgba(0,0,0,0.04)]", isFR && "shadow-[-2px_0_6px_rgba(0,0,0,0.04)]")} style={{ ...(isFL ? { left: fixedLeftOffsets[col.key] } : {}), ...(isFR ? { right: fixedRightOffsets[col.key] } : {}) }}>
                            {col.render ? col.render(row, rowIdx) : (row as any)[col.key]}
                          </td>
                        );
                      })}
                      {hasRowActions && (
                        <td className="px-3 py-1.5 text-[11px] font-medium border border-gray-200 dark:border-white/10 text-right sticky right-0 bg-white dark:bg-[#1d2227] group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] w-[120px]" onClick={(e) => e.stopPropagation()}>
                          {dragOverIndex === rowIdx && <div className="absolute inset-x-0 top-0 h-[2px] bg-[#1a5c3a] -mt-[1px] z-20 pointer-events-none" />}
                          <div className="flex items-center justify-end gap-1">
                            <ActionIconButton label="Ver detalle" className="size-8 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100" onClick={(e) => { e.stopPropagation(); if (onView) onView(row); else if (onRowClick) onRowClick(row, rowIdx); }}><Eye className="size-3.5" /></ActionIconButton>
                            {(!canEdit || canEdit(row)) && (<ActionIconButton label="Editar" className="size-8 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100" onClick={(e) => { e.stopPropagation(); if (_onEdit) _onEdit(row); }}><Edit2 className="size-3.5" /></ActionIconButton>)}
                            <ActionIconButton label="Eliminar" className="size-8 text-stone-400 hover:text-red-600 dark:hover:text-red-400" disabled={isDeleting && pendingDeleteItem === row} onClick={(e) => { e.stopPropagation(); if (_onDelete) handleDeleteRequest(row); }}><Trash2 className={`size-3.5 ${isDeleting && pendingDeleteItem === row ? "animate-pulse" : ""}`} /></ActionIconButton>
                            {rowActions?.map((action, index) => {
                              if (action.isVisible && !action.isVisible(row)) return null;
                              const label = typeof action.label === "function" ? action.label(row) : action.label;
                              const icon = typeof action.icon === "function" ? action.icon(row) : action.icon;
                              const customClassName = typeof action.className === "function" ? action.className(row) : action.className;
                              return (<ActionIconButton key={index} label={label} className={cn("size-8 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100", customClassName)} variant={action.variant || "ghost"} disabled={action.disabled?.(row)} onClick={(e) => { e.stopPropagation(); action.onClick(row); }}>{icon}</ActionIconButton>);
                            })}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {searchFilteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-stone-500 dark:text-zinc-400">
                  Mostrando{" "}<span className="font-medium text-stone-700 dark:text-zinc-200">{statusStart}–{statusEnd}</span>{" "}de{" "}<span className="font-medium text-stone-700 dark:text-zinc-200">{totalFiltered}</span>{" "}resultados
                  {isFiltered && <span className="text-stone-400 dark:text-zinc-500"> (filtrado de {totalUnfiltered} total)</span>}
                  {selectedIndices.size > 0 && <span className="ml-2 text-[#1a5c3a] dark:text-green-400 font-medium">· {selectedIndices.size} seleccionada{selectedIndices.size !== 1 ? 's' : ''}</span>}
                </p>
                {!disablePageSizeSelector && (
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-stone-400 dark:text-zinc-500 whitespace-nowrap">Filas:</label>
                    <select className="h-7 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs text-stone-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                      {PAGE_SIZE_OPTIONS.map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="size-8" onClick={() => setCurrentPage(1)} disabled={safeCurrentPage === 1} title="Primera página"><ChevronsLeft className="size-3.5" /></Button>
                  <Button variant="outline" size="icon" className="size-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} title="Página anterior"><ChevronLeft className="size-3.5" /></Button>
                  {pageWindow.map((item, idx) =>
                    item === 'ellipsis-start' || item === 'ellipsis-end'
                      ? <span key={`${item}-${idx}`} className="size-8 flex items-center justify-center text-xs text-stone-400 dark:text-zinc-500">…</span>
                      : <Button key={item} variant="outline" size="icon" className={cn("size-8 text-xs", item === safeCurrentPage ? "bg-[#1a5c3a] text-white hover:bg-[#124029] border-transparent hover:text-white" : "hover:bg-stone-100 dark:hover:bg-zinc-800")} onClick={() => setCurrentPage(item)} aria-current={item === safeCurrentPage ? "page" : undefined}>{item}</Button>
                  )}
                  <Button variant="outline" size="icon" className="size-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} title="Página siguiente"><ChevronRight className="size-3.5" /></Button>
                  <Button variant="outline" size="icon" className="size-8" onClick={() => setCurrentPage(totalPages)} disabled={safeCurrentPage === totalPages} title="Última página"><ChevronsRight className="size-3.5" /></Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Wizard isOpen={isColumnsMenuOpen} onClose={() => setIsColumnsMenuOpen(false)} title="Configurar Columnas" description="Selecciona las columnas que deseas visualizar en la tabla." icon={<Columns className="size-5" />} size="md" showFooter={true} activeStep={0} steps={[{ id: 'columns-step', title: 'Visibilidad', nextLabel: 'Aceptar', onNext: () => setIsColumnsMenuOpen(false), content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {columns.map((col) => (
            <label key={col.key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 select-none ${!hiddenColumns[col.key] ? 'bg-stone-50 border-[#1a5c3a]/30 shadow-sm dark:bg-zinc-800/80 dark:border-primary-container/30' : 'bg-white border-stone-200 hover:bg-stone-50/50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/50'}`}>
              <div className={`flex size-5 items-center justify-center rounded-md border ${!hiddenColumns[col.key] ? 'border-[#1a5c3a] bg-[#1a5c3a] text-white dark:border-primary-container dark:bg-primary-container' : 'border-stone-300 dark:border-zinc-600'}`}>
                {!hiddenColumns[col.key] && <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`text-sm font-medium ${!hiddenColumns[col.key] ? 'text-stone-900 dark:text-zinc-100' : 'text-stone-500 dark:text-zinc-400'}`}>{col.header}</span>
              <input type="checkbox" className="sr-only" checked={!hiddenColumns[col.key]} onChange={(e) => setHiddenColumns(prev => ({ ...prev, [col.key]: !e.target.checked }))} />
            </label>
          ))}
        </div>
      ) }]} />

      <ConfirmDialog isOpen={!!pendingDeleteItem} title={computedDeleteTitle} description={computedDeleteDescription} onConfirm={handleConfirmDelete} onClose={handleCancelDelete} isLoading={isDeleting} confirmLabel="Eliminar" cancelLabel="Cancelar" variant="danger" />

      <Dialog isOpen={isFiltersMenuOpen} onClose={() => setIsFiltersMenuOpen(false)} title="Filtros Avanzados" description="Aplica filtros específicos a los datos." size="md">
        <div className="p-6 pt-0 space-y-4">
          {filters?.map((f) => (
            <div key={f.id} className="space-y-2">
              <Label htmlFor={`filter-${f.id}`}>{f.label}</Label>
              {f.type === 'text' && <Input id={`filter-${f.id}`} value={activeFilters[f.id] || ''} onChange={(e) => setActiveFilters(prev => ({ ...prev, [f.id]: e.target.value }))} placeholder={`Filtrar por ${f.label.toLowerCase()}...`} />}
              {f.type === 'select' && <select id={`filter-${f.id}`} className="w-full h-10 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20" value={activeFilters[f.id] || ''} onChange={(e) => setActiveFilters(prev => ({ ...prev, [f.id]: e.target.value }))}><option value="">Todos</option>{f.options?.map((opt) => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}</select>}
              {f.type === 'date-range' && <div className="grid grid-cols-2 gap-2"><Input type="date" value={activeFilters[f.id]?.start || ''} onChange={(e) => setActiveFilters(prev => ({ ...prev, [f.id]: { ...prev[f.id], start: e.target.value } }))} /><Input type="date" value={activeFilters[f.id]?.end || ''} onChange={(e) => setActiveFilters(prev => ({ ...prev, [f.id]: { ...prev[f.id], end: e.target.value } }))} /></div>}
              {f.type === 'number-range' && <div className="grid grid-cols-2 gap-2"><Input type="number" placeholder="Mínimo" value={activeFilters[f.id]?.min || ''} onChange={(e) => setActiveFilters(prev => ({ ...prev, [f.id]: { ...prev[f.id], min: e.target.value } }))} /><Input type="number" placeholder="Máximo" value={activeFilters[f.id]?.max || ''} onChange={(e) => setActiveFilters(prev => ({ ...prev, [f.id]: { ...prev[f.id], max: e.target.value } }))} /></div>}
              {f.type === 'boolean' && <select id={`filter-${f.id}`} className="w-full h-10 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20" value={activeFilters[f.id] !== undefined ? String(activeFilters[f.id]) : ''} onChange={(e) => { const val = e.target.value; setActiveFilters(prev => ({ ...prev, [f.id]: val === '' ? undefined : val === 'true' })); }}><option value="">Ambos</option><option value="true">Sí</option><option value="false">No</option></select>}
            </div>
          ))}
          <div className="flex justify-end pt-4 gap-2 border-t border-stone-100 dark:border-zinc-800 mt-6">
            <Button variant="outline" onClick={() => setActiveFilters({})}>Limpiar</Button>
            <Button onClick={() => setIsFiltersMenuOpen(false)} className="bg-[#1a5c3a] text-white hover:bg-[#124029]">Aplicar Filtros</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

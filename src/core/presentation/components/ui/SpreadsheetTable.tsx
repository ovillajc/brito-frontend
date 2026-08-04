"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/src/core/infrastructure/utils/cn";
import { DataTableToolbar } from "@/src/core/presentation/components/molecules/data-table-toolbar";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Columns, Edit2, Trash2, Eye } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Wizard } from "@/src/core/presentation/components/organisms/wizard";
import { ConfirmDialog } from "@/src/core/presentation/components/molecules/confirm-dialog";

const extractTextFromNode = (node: React.ReactNode): string => {
  if (node === null || node === undefined) return "";
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromNode).join(" ").trim();
  if (React.isValidElement(node)) {
    const children = (node.props as { children?: React.ReactNode } | null | undefined)?.children;
    if (children) {
      return extractTextFromNode(children);
    }
  }
  return "";
};

interface ActionIconButtonProps {
  label: string;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "ghost" | "outline";
  className?: string;
  disabled?: boolean;
}

function ActionIconButton({
  label,
  children,
  onClick,
  variant = "ghost",
  className,
  disabled = false,
}: ActionIconButtonProps) {
  return (
    <div className="relative group/action">
      <Button
        variant={variant}
        size="icon"
        className={className}
        disabled={disabled}
        title={label}
        aria-label={label}
        onClick={onClick}
      >
        {children}
      </Button>
      <span
        className={cn(
          "pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md",
          "bg-stone-900 px-2 py-1 text-[10px] font-medium text-white shadow-md",
          "opacity-0 transition-opacity group-hover/action:opacity-100 z-50"
        )}
      >
        {label}
        <span className="absolute -bottom-1 right-3 border-4 border-transparent border-t-stone-900" />
      </span>
    </div>
  );
}

export interface SpreadsheetColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string | number;
}

interface SpreadsheetTableProps<T> {
  data: T[];
  columns: SpreadsheetColumn<T>[];
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  containerClassName?: string;
  maxHeight?: string;
  
  // CrudDataTable-like props
  searchPlaceholder?: string;
  searchFilter?: (item: T, term: string) => boolean;
  actionLabel?: string;
  onAction?: () => void;
  onExport?: (data: T[]) => void;
  pageSize?: number;
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
}

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
  pageSize = 10,
  emptyState,
  canManage = true,
  onView,
  onEdit,
  onDelete,
  canEdit,
  rowActions,
  deleteConfirmTitle,
  deleteConfirmDescription,
}: SpreadsheetTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>({});
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const searchFilteredData = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim() || !searchFilter) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) => searchFilter(item, term));
  }, [data, searchTerm, searchFilter]);

  const totalPages = Math.max(1, Math.ceil(searchFilteredData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return searchFilteredData.slice(startIndex, startIndex + pageSize);
  }, [searchFilteredData, safeCurrentPage, pageSize]);

  const itemsPerPage = pageSize;
  const visibleColumns = useMemo(() => columns.filter((c) => !hiddenColumns[c.key]), [columns, hiddenColumns]);

  const handleExport = () => {
    if (onExport) {
      onExport(searchFilteredData);
      return;
    }

    if (!searchFilteredData || searchFilteredData.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    try {
      toast.info("Generando Excel...");
      
      const exportData = searchFilteredData.map((item, index) => {
        const rowData: Record<string, unknown> = {};
        visibleColumns.forEach((col) => {
          let cellText = "";
          if (col.render) {
            cellText = extractTextFromNode(col.render(item, index));
          } else {
            cellText = String((item as any)[col.key] ?? "");
          }
          rowData[typeof col.header === "string" ? col.header : col.key] = cellText.replace(/\s+/g, " ").trim();
        });
        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
      XLSX.writeFile(workbook, `Reporte_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Excel exportado correctamente");
    } catch {
      toast.error("Error al generar Excel");
    }
  };

  const _onEdit = canManage ? onEdit : undefined;
  const _onDelete = canManage ? onDelete : undefined;
  // La columna de acciones siempre debe ser visible por requerimiento
  const hasRowActions = true;

  const handleDeleteRequest = (item: T) => setPendingDeleteItem(item);
  const handleCancelDelete = () => setPendingDeleteItem(null);
  const handleConfirmDelete = async () => {
    if (!pendingDeleteItem || !_onDelete) return;
    setIsDeleting(true);
    try {
      const result = await _onDelete(pendingDeleteItem);
      if (result && !result.ok) {
        toast.error(result.error?.message ?? "Error al eliminar");
      } else if (result && result.ok) {
        toast.success("Registro eliminado correctamente");
      }
    } catch {
      toast.error("Error inesperado al eliminar");
    } finally {
      setIsDeleting(false);
      setPendingDeleteItem(null);
    }
  };

  const computedDeleteTitle = pendingDeleteItem && deleteConfirmTitle
    ? (typeof deleteConfirmTitle === "function" ? deleteConfirmTitle(pendingDeleteItem) : deleteConfirmTitle)
    : "¿Eliminar registro?";
  
  const computedDeleteDescription = pendingDeleteItem && deleteConfirmDescription
    ? (typeof deleteConfirmDescription === "function" ? deleteConfirmDescription(pendingDeleteItem) : deleteConfirmDescription)
    : "Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este elemento?";

  const showToolbar = !!searchFilter || !!onExport || !!actionLabel || !!onAction || columns.length > 0;

  return (
    <div className={cn("bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-[20px] shadow-sm flex flex-col overflow-hidden", className, containerClassName)}>
      {showToolbar ? (
        <div className="p-4 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50">
          <DataTableToolbar
            searchPlaceholder={searchPlaceholder}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            actionLabel={canManage ? actionLabel : undefined}
            onAction={canManage ? onAction : undefined}
            onExport={handleExport}
            onFiltersClick={() => toast.info('Filtros avanzados no configurados en esta vista')}
            extraActions={
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsColumnsMenuOpen(true)}
              >
                <Columns className="size-4" />
                Columnas
              </Button>
            }
          />
        </div>
      ) : null}

      {paginatedData.length === 0 && emptyState ? (
        <div className="flex flex-col items-center justify-center py-20 bg-stone-50/50 text-center">
          <div className="size-16 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <emptyState.icon className="size-8 text-stone-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
            {emptyState.title}
          </h3>
          <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
            {emptyState.description}
          </p>
        </div>
      ) : (
        <>
          <div
            className="overflow-auto 
              [&::-webkit-scrollbar]:w-2 
              [&::-webkit-scrollbar]:h-2 
              [&::-webkit-scrollbar-track]:bg-transparent 
              [&::-webkit-scrollbar-thumb]:bg-slate-300 
              dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 
              [&::-webkit-scrollbar-thumb]:rounded-full 
              hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 
              dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-500"
            style={{ maxHeight }}
          >
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-black/20 sticky top-0 z-20">
                <tr>
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "px-3 py-1.5 font-bold text-slate-700 dark:text-zinc-200 text-[11px] whitespace-nowrap",
                        "border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800",
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      )}
                      style={{ width: col.width }}
                    >
                      {col.header}
                    </th>
                  ))}
                  {hasRowActions && (
                    <th className="px-3 py-1.5 font-semibold text-slate-700 dark:text-zinc-200 text-[11px] whitespace-nowrap border border-slate-300 dark:border-zinc-700 text-right sticky right-0 bg-slate-100 dark:bg-zinc-800 z-30 w-30 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1d2227]">
                {paginatedData.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    onClick={() => onRowClick?.(row, rowIdx)}
                    className={cn(
                      "transition-colors group",
                      onRowClick
                        ? "cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    {visibleColumns.map((col) => (
                      <td
                        key={`${rowIdx}-${col.key}`}
                        className={cn(
                          "px-3 py-1.5 text-[11px] font-medium border border-gray-200 dark:border-white/10 whitespace-nowrap",
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        )}
                      >
                        {col.render ? col.render(row, rowIdx) : (row as any)[col.key]}
                      </td>
                    ))}
                    {hasRowActions && (
                      <td
                        className="px-3 py-1.5 text-[11px] font-medium border border-gray-200 dark:border-white/10 text-right sticky right-0 bg-white dark:bg-[#1d2227] group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] w-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <ActionIconButton
                            label="Ver detalle"
                            className="size-8 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onView) onView(row);
                              else if (onRowClick) onRowClick(row, rowIdx);
                            }}
                          >
                            <Eye className="size-3.5" />
                          </ActionIconButton>
                          
                          {(!canEdit || canEdit(row)) && (
                            <ActionIconButton
                              label="Editar"
                              className="size-8 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (_onEdit) _onEdit(row);
                              }}
                            >
                              <Edit2 className="size-3.5" />
                            </ActionIconButton>
                          )}
                          
                          <ActionIconButton
                            label="Eliminar"
                            className="size-8 text-stone-400 hover:text-red-600 dark:hover:text-red-400"
                            disabled={isDeleting && pendingDeleteItem === row}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (_onDelete) handleDeleteRequest(row);
                            }}
                          >
                            <Trash2
                              className={`size-3.5 ${
                                isDeleting && pendingDeleteItem === row ? "animate-pulse" : ""
                              }`}
                            />
                          </ActionIconButton>
                          
                          {rowActions?.map((action, index) => {
                            if (action.isVisible && !action.isVisible(row)) return null;
                            const label = typeof action.label === "function" ? action.label(row) : action.label;
                            const icon = typeof action.icon === "function" ? action.icon(row) : action.icon;
                            const customClassName = typeof action.className === "function" ? action.className(row) : action.className;

                            return (
                              <ActionIconButton
                                key={index}
                                label={label}
                                className={cn("size-8 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100", customClassName)}
                                variant={action.variant || "ghost"}
                                disabled={action.disabled?.(row)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                              >
                                {icon}
                              </ActionIconButton>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {searchFilteredData.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50">
              <p className="text-sm text-stone-500 dark:text-zinc-400">
                Mostrando {(safeCurrentPage - 1) * itemsPerPage + 1} a {Math.min(safeCurrentPage * itemsPerPage, searchFilteredData.length)} de {searchFilteredData.length} resultados
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm font-medium text-stone-600 dark:text-zinc-300">
                  Página {safeCurrentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Columns Configuration Wizard */}
      <Wizard
        isOpen={isColumnsMenuOpen}
        onClose={() => setIsColumnsMenuOpen(false)}
        title="Configurar Columnas"
        description="Selecciona las columnas que deseas visualizar en la tabla."
        icon={<Columns className="size-5" />}
        size="md"
        showFooter={true}
        activeStep={0}
        steps={[
          {
            id: 'columns-step',
            title: 'Visibilidad',
            nextLabel: 'Aceptar',
            onNext: () => setIsColumnsMenuOpen(false),
            content: (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {columns.map((col) => (
                  <label
                    key={col.key}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                      !hiddenColumns[col.key]
                        ? 'bg-stone-50 border-[#1a5c3a]/30 shadow-sm dark:bg-zinc-800/80 dark:border-primary-container/30'
                        : 'bg-white border-stone-200 hover:bg-stone-50/50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div
                      className={`flex size-5 items-center justify-center rounded-md border ${
                        !hiddenColumns[col.key]
                          ? 'border-[#1a5c3a] bg-[#1a5c3a] text-white dark:border-primary-container dark:bg-primary-container'
                          : 'border-stone-300 dark:border-zinc-600'
                      }`}
                    >
                      {!hiddenColumns[col.key] && (
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${!hiddenColumns[col.key] ? 'text-stone-900 dark:text-zinc-100' : 'text-stone-500 dark:text-zinc-400'}`}>
                      {col.header}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={!hiddenColumns[col.key]}
                      onChange={(e) => {
                        setHiddenColumns(prev => ({
                          ...prev,
                          [col.key]: !e.target.checked
                        }));
                      }}
                    />
                  </label>
                ))}
              </div>
            )
          }
        ]}
      />

      <ConfirmDialog
        isOpen={!!pendingDeleteItem}
        title={computedDeleteTitle}
        description={computedDeleteDescription}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
        isLoading={isDeleting}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}

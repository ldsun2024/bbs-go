"use client"

import * as React from "react"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  EyeIcon,
  GripVerticalIcon,
  Trash2Icon,
} from "lucide-react"

import type { AdminRecord } from "@/lib/api/admin"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"
import { TableRowsSkeleton } from "@/components/common/skeletons"
import { DashboardPagination } from "@/components/dashboard/pagination-controls"

import type { DashboardDataPageConfig } from "./dashboard-data-types"
import {
  DASHBOARD_DATA_DEPTH_KEY,
  DASHBOARD_DATA_HAS_CHILDREN_KEY,
  getDashboardDataValue,
  textValue,
} from "./dashboard-data-utils"

export function DashboardDataTable({
  config,
  records,
  loading,
  page,
  pageCount,
  total,
  limit,
  labels,
  onPageChange,
  onLimitChange,
  onMove,
  onReorder,
  canMove,
  canSort,
  canUpdate,
  canDelete,
  onRunAction,
  onView,
  onEdit,
  onDelete,
  isTreeRecordCollapsed,
  onToggleTreeRecord,
}: {
  config: DashboardDataPageConfig
  records: AdminRecord[]
  loading: boolean
  page: number
  pageCount: number
  total: number
  limit: number
  labels: {
    actions: string
    loading: string
    noData: string
    moveUp: string
    moveDown: string
    expand: string
    collapse: string
    view: string
    edit: string
    delete: string
  }
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onMove: (index: number, direction: -1 | 1) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  canMove: (index: number, direction: -1 | 1) => boolean
  canSort: boolean
  canUpdate: boolean
  canDelete: boolean
  onRunAction: (
    action: NonNullable<DashboardDataPageConfig["rowActions"]>[number],
    record: AdminRecord
  ) => void
  onView: (record: AdminRecord) => void
  onEdit: (record: AdminRecord) => void
  onDelete: (record: AdminRecord) => void
  isTreeRecordCollapsed?: (record: AdminRecord) => boolean
  onToggleTreeRecord?: (record: AdminRecord) => void
}) {
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
  const canDragSort = Boolean(
    config.dragSort && config.sortEndpoint && canSort && !config.tree
  )
  const hasActions =
    Boolean(config.formFields?.length && config.updateEndpoint && canUpdate) ||
    Boolean(config.detailFields?.length) ||
    Boolean(config.deleteEndpoint && canDelete) ||
    Boolean(config.sortEndpoint && canSort) ||
    Boolean(config.rowActions?.length) ||
    Boolean(config.renderRowActions)
  const colSpan = config.columns.length + (hasActions ? 1 : 0)

  return (
    <div className="overflow-hidden rounded-lg border bg-[var(--dashboard-panel)] shadow-xs">
      {/* B2：吸顶表头需要可纵向滚动的祖先，这里给容器封顶高度 */}
      <div className="max-h-[calc(100vh-15rem)] overflow-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--dashboard-panel-muted)] text-muted-foreground">
            <tr>
              {config.columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "h-[38px] px-3 text-left text-xs font-semibold tracking-wide uppercase",
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
              {hasActions ? (
                <th className="h-[38px] w-48 px-3 text-right text-xs font-semibold tracking-wide uppercase">
                  {labels.actions}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowsSkeleton rows={6} columns={colSpan} />
            ) : records.length ? (
              records.map((record, index) => (
                <tr
                  key={String(record.id ?? index)}
                  onDragOver={(event) => {
                    if (!canDragSort || draggingIndex === null) return
                    event.preventDefault()
                    event.dataTransfer.dropEffect = "move"
                    if (dragOverIndex !== index) {
                      setDragOverIndex(index)
                    }
                  }}
                  onDrop={(event) => {
                    if (!canDragSort || draggingIndex === null) return
                    event.preventDefault()
                    onReorder(draggingIndex, index)
                    setDraggingIndex(null)
                    setDragOverIndex(null)
                  }}
                  className={cn(
                    "border-t transition-colors hover:bg-[var(--dashboard-accent-soft)]/45",
                    draggingIndex === index && "opacity-50",
                    dragOverIndex === index &&
                      draggingIndex !== index &&
                      "bg-[var(--dashboard-accent-soft)]/70 outline-2 -outline-offset-2 outline-primary/45"
                  )}
                >
                  {config.columns.map((column) => {
                    const isTreeIndentColumn =
                      config.treeIndentKey === column.key
                    const rawValue = getDashboardDataValue(record, column.key)
                    const content = column.render
                      ? column.render(record)
                      : textValue(rawValue)
                    const depth = Number(record[DASHBOARD_DATA_DEPTH_KEY] || 0)
                    const hasChildren = Boolean(
                      record[DASHBOARD_DATA_HAS_CHILDREN_KEY]
                    )
                    const collapsed = Boolean(isTreeRecordCollapsed?.(record))

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          "h-11 px-3 align-middle",
                          column.className,
                          isTreeIndentColumn && "font-medium",
                          // B2：数字列右对齐 + 等宽，位数不同时也能纵向比较
                          typeof rawValue === "number" &&
                            !column.render &&
                            "text-right tabular-nums"
                        )}
                        style={
                          isTreeIndentColumn
                            ? {
                                paddingLeft: `${12 + depth * 20}px`,
                              }
                            : undefined
                        }
                      >
                        {isTreeIndentColumn ? (
                          <div className="flex min-w-0 items-center gap-1.5">
                            {hasChildren ? (
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                className="size-6 shrink-0"
                                onClick={() => onToggleTreeRecord?.(record)}
                              >
                                {collapsed ? (
                                  <ChevronRightIcon />
                                ) : (
                                  <ChevronDownIcon />
                                )}
                                <span className="sr-only">
                                  {collapsed ? labels.expand : labels.collapse}
                                </span>
                              </Button>
                            ) : (
                              <span className="size-6 shrink-0" />
                            )}
                            <span className="min-w-0 truncate">{content}</span>
                          </div>
                        ) : (
                          content
                        )}
                      </td>
                    )
                  })}
                  {hasActions ? (
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1.5">
                        {canDragSort ? (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="outline"
                            draggable
                            className="cursor-grab active:cursor-grabbing"
                            onDragStart={(event) => {
                              setDraggingIndex(index)
                              setDragOverIndex(index)
                              event.dataTransfer.effectAllowed = "move"
                              event.dataTransfer.setData(
                                "text/plain",
                                String(index)
                              )
                            }}
                            onDragEnd={() => {
                              setDraggingIndex(null)
                              setDragOverIndex(null)
                            }}
                          >
                            <GripVerticalIcon />
                            <span className="sr-only">{labels.moveUp}</span>
                          </Button>
                        ) : null}
                        {config.sortEndpoint && canSort && !canDragSort ? (
                          <>
                            <Button
                              size="icon-sm"
                              variant="outline"
                              disabled={!canMove(index, -1)}
                              onClick={() => onMove(index, -1)}
                            >
                              <ArrowUpIcon />
                              <span className="sr-only">{labels.moveUp}</span>
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="outline"
                              disabled={!canMove(index, 1)}
                              onClick={() => onMove(index, 1)}
                            >
                              <ArrowDownIcon />
                              <span className="sr-only">{labels.moveDown}</span>
                            </Button>
                          </>
                        ) : null}
                        {config.rowActions
                          ?.filter((action) => action.visible?.(record) ?? true)
                          .map((action) => (
                            <Button
                              key={action.label}
                              size="sm"
                              variant="outline"
                              onClick={() => onRunAction(action, record)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        {config.renderRowActions?.(record)}
                        {config.detailFields?.length ? (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => onView(record)}
                          >
                            <EyeIcon />
                            <span className="sr-only">{labels.view}</span>
                          </Button>
                        ) : null}
                        {config.formFields?.length &&
                        config.updateEndpoint &&
                        canUpdate &&
                        (config.canEdit?.(record) ?? true) ? (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => onEdit(record)}
                          >
                            <EditIcon />
                            <span className="sr-only">{labels.edit}</span>
                          </Button>
                        ) : null}
                        {config.deleteEndpoint &&
                        canDelete &&
                        (config.canDelete?.(record) ?? true) ? (
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            onClick={() => onDelete(record)}
                          >
                            <Trash2Icon />
                            <span className="sr-only">{labels.delete}</span>
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colSpan}>
                  <EmptyState title={labels.noData} className="py-8" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {config.listResult !== "array" ? (
        <DashboardPagination
          page={page}
          pageCount={pageCount}
          total={total}
          limit={limit}
          loading={loading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      ) : null}
    </div>
  )
}

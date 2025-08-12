"use client";

import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, Ref, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { createContext, isValidElement, useContext, useState, useMemo } from "react";
import { ArrowDown, ChevronDown, Copy, Edit, HelpCircle, Trash } from "lucide-react";
import type {
    CellProps as AriaCellProps,
    ColumnProps as AriaColumnProps,
    RowProps as AriaRowProps,
    TableHeaderProps as AriaTableHeaderProps,
    TableProps as AriaTableProps,
} from "react-aria-components";
import {
    Cell as AriaCell,
    Collection as AriaCollection,
    Column as AriaColumn,
    Group as AriaGroup,
    Row as AriaRow,
    Table as AriaTable,
    TableBody as AriaTableBody,
    TableHeader as AriaTableHeader,
    useTableOptions,
} from "react-aria-components";
import { cx } from "@/utils/cx";

export const TableRowActionsDropdown = () => (
    <div className="relative">
        <button className="text-white hover:text-gray-300 focus:outline-none">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
            </svg>
        </button>
    </div>
);

const TableContext = createContext<{ size: "sm" | "md" }>({ size: "md" });

const TableCardRoot = ({ children, className, size = "md", ...props }: HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" }) => {
    return (
        <TableContext.Provider value={{ size }}>
            <div {...props} className={cx("overflow-hidden rounded-xl bg-black shadow-lg ring-1 ring-gray-800", className)}>
                {children}
            </div>
        </TableContext.Provider>
    );
};

interface TableCardHeaderProps {
    /** The title of the table card header. */
    title: string;
    /** The badge displayed next to the title. */
    badge?: ReactNode;
    /** The description of the table card header. */
    description?: string;
    /** The content displayed after the title and badge. */
    contentTrailing?: ReactNode;
    /** The class name of the table card header. */
    className?: string;
}

const TableCardHeader = ({ title, badge, description, contentTrailing, className }: TableCardHeaderProps) => {
    const { size } = useContext(TableContext);

    return (
        <div
            className={cx(
                "relative flex flex-col items-start gap-4 border-b border-gray-800 bg-black px-4 md:flex-row",
                size === "sm" ? "py-4 md:px-5" : "py-5 md:px-6",
                className,
            )}
        >
            <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <h2 className={cx("font-semibold text-white", size === "sm" ? "text-md" : "text-lg")}>{title}</h2>
                    {badge ? (
                        isValidElement(badge) ? (
                            badge
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-white">
                                {badge}
                            </span>
                        )
                    ) : null}
                </div>
                {description && <p className="text-sm text-gray-400">{description}</p>}
            </div>
            {contentTrailing}
        </div>
    );
};

interface TableRootProps extends Omit<ComponentPropsWithRef<"table">, "className" | "slot" | "style"> {
    size?: "sm" | "md";
    className?: string;
}

const TableRoot = ({ className, size = "md", ...props }: TableRootProps) => {
    const context = useContext(TableContext);

    return (
        <TableContext.Provider value={{ size: context?.size ?? size }}>
            <div className="overflow-x-auto">
                <table className={cx("w-full overflow-x-hidden", className)} {...props} />
            </div>
        </TableContext.Provider>
    );
};
TableRoot.displayName = "Table";

interface TableHeaderProps<T extends object> extends Omit<ComponentPropsWithRef<"thead">, "children" | "className" | "slot" | "style"> {
    bordered?: boolean;
    children?: ReactNode;
    className?: string;
}

const TableHeader = <T extends object>({ children, bordered = true, className, ...props }: TableHeaderProps<T>) => {
    const { size } = useContext(TableContext);

    return (
        <thead
            className={cx(
                "relative bg-gray-900",
                size === "sm" ? "h-9" : "h-11",
                bordered &&
                    "[&>tr>th]:after:pointer-events-none [&>tr>th]:after:absolute [&>tr>th]:after:inset-x-0 [&>tr>th]:after:bottom-0 [&>tr>th]:after:h-px [&>tr>th]:after:bg-gray-800 [&>tr>th]:focus-visible:after:bg-transparent",
                className
            )}
            {...props}
        >
            <tr>
                {children}
            </tr>
        </thead>
    );
};

TableHeader.displayName = "TableHeader";

interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "children" | "className" | "style" | "id"> {
    label?: string;
    tooltip?: string;
    allowsSorting?: boolean;
    sortDirection?: "ascending" | "descending" | null;
    children?: ReactNode;
    className?: string;
}

const TableHead = ({ className, tooltip, label, allowsSorting, sortDirection, children, ...props }: TableHeadProps) => {
    return (
        <th
            className={cx(
                "relative p-0 px-6 py-2 outline-hidden focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-black focus-visible:ring-inset",
                allowsSorting && "cursor-pointer",
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                    {label && <span className="text-xs font-semibold whitespace-nowrap text-gray-300">{label}</span>}
                    {children}
                </div>

                {tooltip && (
                    <div className="cursor-pointer text-gray-400 transition duration-100 ease-linear hover:text-gray-300">
                        <HelpCircle className="h-4 w-4" />
                    </div>
                )}

                {allowsSorting &&
                    (sortDirection ? (
                        <ArrowDown className={cx("size-3 stroke-[3px] text-gray-400", sortDirection === "descending" && "rotate-180")} />
                    ) : (
                        <ChevronDown size={12} strokeWidth={3} className="text-gray-400" />
                    ))}
            </div>
        </th>
    );
};
TableHead.displayName = "TableHead";

interface TableRowProps<T extends object> {
    highlightSelectedRow?: boolean;
    className?: string;
    children?: ReactNode;
}

const TableRow = <T extends object>({ children, className, highlightSelectedRow = true, ...props }: TableRowProps<T>) => {
    const { size } = useContext(TableContext);

    return (
        <tr
            className={cx(
                "relative outline-blue-500 transition-colors after:pointer-events-none hover:bg-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-2",
                size === "sm" ? "h-14" : "h-18",
                highlightSelectedRow && "selected:bg-gray-900",
                "[&>td]:after:absolute [&>td]:after:inset-x-0 [&>td]:after:bottom-0 [&>td]:after:h-px [&>td]:after:hidden [&>td]:focus-visible:after:opacity-0 focus-visible:[&>td]:after:opacity-0",
                className
            )}
            {...props}
        >
            {children}
        </tr>
    );
};

TableRow.displayName = "TableRow";

interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "children" | "className" | "style" | "id"> {
    ref?: Ref<HTMLTableCellElement>;
    className?: string;
    children?: ReactNode;
}

const TableCell = ({ className, children, ...props }: TableCellProps) => {
    const { size } = useContext(TableContext);

    return (
        <td
            className={cx(
                "relative text-sm text-gray-300 outline-blue-500 focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-2",
                size === "sm" && "px-5 py-3",
                size === "md" && "px-6 py-4",
                className
            )}
            {...props}
        >
            {children}
        </td>
    );
};
TableCell.displayName = "TableCell";

const TableBody = ({ children, className, ...props }: ComponentPropsWithRef<"tbody">) => {
    return (
        <tbody className={className} {...props}>
            {children}
        </tbody>
    );
};
TableBody.displayName = "TableBody";

const TableCard = {
    Root: TableCardRoot,
    Header: TableCardHeader,
};

const Table = TableRoot as typeof TableRoot & {
    Body: typeof TableBody;
    Cell: typeof TableCell;
    Head: typeof TableHead;
    Header: typeof TableHeader;
    Row: typeof TableRow;
};
Table.Body = TableBody;
Table.Cell = TableCell;
Table.Head = TableHead;
Table.Header = TableHeader;
Table.Row = TableRow;

export { Table, TableCard };

import * as React from "react";

import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

const TABLE_WRAPPER_CLASS =
  "overflow-x-scroll overflow-y-auto max-h-[65vh] rounded-xl border border-brand-100 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-brand-50 [&::-webkit-scrollbar-thumb]:bg-brand-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-brand-400";

const Table = React.forwardRef(({ className, wrapperClassName, ...props }, ref) => (
 <div
 className={cn(
 "relative w-full",
 TABLE_WRAPPER_CLASS,
 wrapperClassName
 )}
 >
 <table
 ref={ref}
 className={cn("w-full caption-bottom text-sm", className)}
 {...props}
 />
 </div>
));
Table.displayName = "Table";
Table.propTypes = {
 className: PropTypes.string,
 wrapperClassName: PropTypes.string,
};

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
 <thead
  ref={ref}
  className={cn(
   "sticky top-0 z-10 bg-neutral-50 [&_tr]:border-b [&_th]:bg-neutral-50",
   className
  )}
  {...props}
 />
));
TableHeader.displayName = "TableHeader";
TableHeader.propTypes = { className: PropTypes.string };

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
 <tbody
 ref={ref}
 className={cn("[&_tr:last-child]:border-0", className)}
 {...props}
 />
));
TableBody.displayName = "TableBody";
TableBody.propTypes = { className: PropTypes.string };

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
 <tfoot
 ref={ref}
 className={cn(
 "border-t bg-neutral-100/50 font-medium [&>tr]:last:border-b-0 ",
 className
 )}
 {...props}
 />
));
TableFooter.displayName = "TableFooter";
TableFooter.propTypes = { className: PropTypes.string };

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
 <tr
 ref={ref}
 className={cn(
 "border-b transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100 ",
 className
 )}
 {...props}
 />
));
TableRow.displayName = "TableRow";
TableRow.propTypes = { className: PropTypes.string };

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
 <th
  ref={ref}
  className={cn(
  "h-12 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wider text-neutral-500 [&:has([role=checkbox])]:pr-0 ",
  className
  )}
  {...props}
 />
));
TableHead.displayName = "TableHead";
TableHead.propTypes = { className: PropTypes.string };

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
 <td
  ref={ref}
  className={cn("p-3 align-middle [&:has([role=checkbox])]:pr-0", className)}
  {...props}
 />
));
TableCell.displayName = "TableCell";
TableCell.propTypes = { className: PropTypes.string };

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
 <caption
 ref={ref}
 className={cn(
 "mt-4 text-sm text-neutral-500 ",
 className
 )}
 {...props}
 />
));
TableCaption.displayName = "TableCaption";
TableCaption.propTypes = { className: PropTypes.string };

export {
 Table,
 TableHeader,
 TableBody,
 TableFooter,
 TableHead,
 TableRow,
 TableCell,
 TableCaption,
};

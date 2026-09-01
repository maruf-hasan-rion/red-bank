import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

function Skeleton({ className, ...props }) {
 return (
 <div
 className={cn(
 "animate-pulse rounded-md bg-neutral-200 ",
 className
 )}
 {...props}
 />
 );
}

export { Skeleton };

Skeleton.propTypes = { className: PropTypes.string };

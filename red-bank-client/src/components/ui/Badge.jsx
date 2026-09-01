import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const BADGE_VARIANTS = {
  default: "bg-brand-500 text-white",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  neutral: "bg-neutral-100 text-neutral-600 border border-neutral-200",
  destructive: "bg-red-50 text-red-700 border border-red-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
};

const Badge = ({ className, children, variant = "default" }) => (
  <span
    className={cn(
      "flex px-3 py-1 rounded-full text-xs font-medium",
      BADGE_VARIANTS[variant] || BADGE_VARIANTS.default,
      className
    )}
  >
    {children}
  </span>
);

Badge.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(["default", "success", "neutral", "destructive", "warning"]),
};

export default Badge;
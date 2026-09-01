import Button from "@/components/ui/button";
import { CiEdit, CiTrash } from "react-icons/ci";
import { PiEyeThin } from "react-icons/pi";
import { ImSpinner11 } from "react-icons/im";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

const ACTION_CLASS = "h-8 w-8 text-neutral-500";

export const RowEditButton = ({ to, label }) => (
  <Button
    asChild
    size="icon"
    variant="ghost"
    className={cn(ACTION_CLASS, "hover:bg-brand-50 hover:text-brand-600")}
  >
    <Link to={to} aria-label={label}>
      <CiEdit size={18} aria-hidden="true" />
    </Link>
  </Button>
);

export const RowViewButton = ({ to, label }) => (
  <Button
    asChild
    size="icon"
    variant="ghost"
    className={cn(ACTION_CLASS, "hover:bg-sky-50 hover:text-sky-600")}
  >
    <Link to={to} aria-label={label}>
      <PiEyeThin size={18} aria-hidden="true" />
    </Link>
  </Button>
);

export const RowDeleteButton = ({ label, onClick, isPending }) => (
  <Button
    size="icon"
    variant="ghost"
    className={cn(ACTION_CLASS, "hover:bg-red-50 hover:text-red-600")}
    onClick={onClick}
    aria-label={label}
  >
    {isPending ? (
      <ImSpinner11 size={18} className="animate-spin" />
    ) : (
      <CiTrash size={18} />
    )}
  </Button>
);

RowEditButton.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

RowViewButton.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

RowDeleteButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isPending: PropTypes.bool,
};
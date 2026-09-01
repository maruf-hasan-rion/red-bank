import { AnimatePresence, motion } from "motion/react";
import { SlArrowDown } from "react-icons/sl";
import PropTypes from "prop-types";
import { DONATION_FILTERS } from "@/lib/constants";

const DonationsFilter = ({ filter, onFilterChange, isOpen, onToggleOpen }) => (
  <div className="shrink-0">
    <button
      onClick={onToggleOpen}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
    >
      {`Filtered By ${filter} Status`}
      <SlArrowDown
        size={15}
        className={`${isOpen && "rotate-180"} transition-transform`}
      />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex gap-2 flex-wrap border border-b-0 p-2 font-semibold rounded-r-lg overflow-hidden"
        >
          {DONATION_FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => onFilterChange(item.value)}
              className={`px-5 py-2 rounded-lg text-white transition-colors ${
                item.className
              } ${
                filter === item.value ? "ring-2 ring-offset-2 ring-red-500" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

DonationsFilter.propTypes = {
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggleOpen: PropTypes.func.isRequired,
};

export default DonationsFilter;
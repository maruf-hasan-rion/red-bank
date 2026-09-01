import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

const getPageList = (currentPage, totalPages) => {
  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) {
      result.push("...");
    }
    result.push(page);
    previous = page;
  }
  return result;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!Number.isFinite(totalPages) || totalPages <= 1) {
    return null;
  }

  const pages = getPageList(currentPage, totalPages);

  return (
    <div className="w-full flex justify-center items-center py-5">
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-2 border border-neutral-200 rounded-md px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-neutral-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "p-2 border border-neutral-200 rounded-md px-4",
                currentPage === page &&
                  "bg-brand-500 text-white font-semibold border-brand-500"
              )}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-2 border border-neutral-200 rounded-md px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
};
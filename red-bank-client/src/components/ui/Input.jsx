import React, { forwardRef, useId } from "react";
import PropTypes from "prop-types";

const Input = forwardRef(
  ({ label, errorMessage, children, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {label && (
          <>
            <label htmlFor={inputId} className="block mb-1 font-semibold text-neutral-800">
              {label}
            </label>
            <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
          </>
        )}
        <input
          id={inputId}
          className={`border w-full px-5 py-2 rounded-md ring-offset-1 focus:ring-1 ring-brand-700/60 transition-all focus:border-transparent text-sm placeholder:text-color-1/80 placeholder:font-medium ${className}`}
          aria-invalid={errorMessage ? "true" : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          {...props}
          ref={ref}
        />
        {React.isValidElement(children) &&
          React.cloneElement(children, { error: errorMessage, id: errorId })}
      </div>
    );
  }
);

Input.displayName = "Input";
Input.propTypes = {
  label: PropTypes.node,
  errorMessage: PropTypes.string,
  children: PropTypes.element,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Input;

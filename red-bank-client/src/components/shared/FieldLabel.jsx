import PropTypes from "prop-types";

const FieldLabel = ({ htmlFor, children, className }) => (
  <div className={className}>
    <label
      htmlFor={htmlFor}
      className="block mb-1 font-semibold text-neutral-800"
    >
      {children}
    </label>
    <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
  </div>
);

FieldLabel.propTypes = {
  htmlFor: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default FieldLabel;
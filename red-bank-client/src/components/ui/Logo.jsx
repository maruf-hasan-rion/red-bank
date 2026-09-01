import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const Logo = ({ className, textClass, width = "64px", ...props }) => {
  return (
    <>
      <Link to={"/"} className={`flex items-center gap-2 ${className}`} {...props}>
        <div className="loading">
           <svg className="scale-75" width={width} height="48px" aria-hidden="true">
            <polyline
              points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
              id="back"
            ></polyline>
            <polyline
              points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
              id="front"
            ></polyline>
          </svg>
        </div>
        <p className={`text-2xl font-bold hidden sm:block ${textClass}`}>
          Red. Bank
        </p>
      </Link>
    </>
  );
};

Logo.propTypes = {
  className: PropTypes.string,
  textClass: PropTypes.string,
  width: PropTypes.string,
};

export default Logo;

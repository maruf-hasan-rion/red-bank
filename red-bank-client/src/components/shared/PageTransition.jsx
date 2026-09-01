import { motion } from "motion/react";
import PropTypes from "prop-types";

const PageTransition = ({ className, children, ...props }) => (
  <motion.div
    initial={{ opacity: 0, translateY: 200 }}
    animate={{ opacity: 1, translateY: 0 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

PageTransition.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default PageTransition;
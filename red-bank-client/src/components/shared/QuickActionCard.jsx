import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const QuickActionCard = ({ to, title, description, icon }) => (
  <Link
    to={to}
    className="bg-white p-5 rounded-xl border border-red-100 hover:border-red-300 hover:shadow-md transition-all flex gap-5 items-center"
  >
    {icon}
    <div>
      <h2 className="text-xl font-semibold text-color-1">{title}</h2>
      <p className="text-color-1/70 text-sm">{description}</p>
    </div>
  </Link>
);

QuickActionCard.propTypes = {
  to: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
};

export default QuickActionCard;
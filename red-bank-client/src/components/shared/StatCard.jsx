import NumberTicker from "@/components/ui/number-ticker";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

const StatCard = ({ to, title, value, symbol, icon, className }) => (
  <Link
    to={to}
    className={cn(
      "p-5 rounded-xl border-l-8 border-l-red-500 border-red-500/20 hover:border-l-red-600 transition-all flex justify-between items-center bg-white",
      className
    )}
  >
    <div className="space-y-5">
      <h3 className="font-semibold text-color-1">{title}</h3>
      <h2 className="text-4xl flex items-center font-bold text-color-1">
        <NumberTicker value={value || 0} />
        {symbol && (
          <span className="flex text-2xl -translate-y-2 font-thin">
            {symbol}
          </span>
        )}
      </h2>
    </div>
    {icon && (
      <div className="text-3xl text-red-600 bg-white p-3 rounded-xl ring-8 ring-red-100">
        {icon}
      </div>
    )}
  </Link>
);

StatCard.propTypes = {
  to: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  symbol: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default StatCard;
import Badge from "@/components/ui/Badge";
import { DONATION_STATUS } from "@/lib/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlArrowDown } from "react-icons/sl";
import PropTypes from "prop-types";

const StatusBadge = ({ status, onMarkDone, onCancel }) => {
  switch (status) {
    case DONATION_STATUS.PENDING:
      return <Badge>Pending</Badge>;
    case DONATION_STATUS.DONE:
      return <Badge className="bg-sky-600">Done</Badge>;
    case DONATION_STATUS.CANCELED:
      return <Badge className="!bg-red-500">Canceled</Badge>;
    case DONATION_STATUS.IN_PROGRESS:
    default:
      if (!onMarkDone || !onCancel) {
        return (
          <Badge className="bg-yellow-400 text-yellow-950">In Progress</Badge>
        );
      }
      return (
        <Popover>
          <PopoverTrigger>
            <span className="bg-yellow-400 pl-3 gap-2 items-center cursor-pointer rounded-full flex overflow-hidden text-yellow-950">
              <span className="py-1">InProgress</span>
              <SlArrowDown size={25} className="bg-yellow-600 py-2" />
            </span>
          </PopoverTrigger>
          <PopoverContent className="!shadow-none text-sm flex flex-col items-start text-start mr-6 mt-2 border-red-200 w-[130px]">
            <button onClick={onMarkDone}>Done</button>
            <span className="w-full h-[1px] bg-red-200 my-2"></span>
            <button onClick={onCancel}>Cancel</button>
          </PopoverContent>
        </Popover>
      );
  }
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  onMarkDone: PropTypes.func,
  onCancel: PropTypes.func,
};

export default StatusBadge;
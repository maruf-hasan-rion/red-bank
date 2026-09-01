import PropTypes from 'prop-types';
import { BLOOD_GROUP_OPTIONS } from '@/lib/constants';

const BloodSelect = ({ bloodGroup, setBloodGroup }) => {
  return (
    <div>
      {BLOOD_GROUP_OPTIONS.map((blood) => (
        <button
          onClick={() => setBloodGroup(blood.type)}
          key={blood.type}
          type="button"
          style={{ backgroundColor: blood.color }}
          className={`text-white text-sm hover:ring-2 transition-all ring-red-500 hover:z-20 relative ring-offset-2 font-semibold p-1 px-3 ${
            blood.type === bloodGroup && 'ring-2 z-20'
          }`}
        >
          {blood.type}
        </button>
      ))}
    </div>
  );
};

BloodSelect.propTypes = {
  bloodGroup: PropTypes.string,
  setBloodGroup: PropTypes.func.isRequired,
};

export default BloodSelect;

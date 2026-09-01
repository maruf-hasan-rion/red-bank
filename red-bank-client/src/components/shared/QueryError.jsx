import PropTypes from 'prop-types';
import Button from '@/components/ui/button';

const QueryError = ({ onRetry, message = 'Unable to load this data.' }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center">
    <p className="text-sm text-red-600">{message}</p>
    {onRetry && (
      <Button type="button" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

QueryError.propTypes = {
  onRetry: PropTypes.func,
  message: PropTypes.string,
};

export default QueryError;

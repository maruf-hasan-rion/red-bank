import { Skeleton } from '@/components/ui/skeleton';
import PropTypes from 'prop-types';

function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-4 w-32" />
      <p className="text-muted-foreground mt-4">{text}</p>
    </div>
  );
}

PageLoader.propTypes = { text: PropTypes.string };

export { PageLoader };
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import PropTypes from 'prop-types';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="text-6xl mb-4">😞</div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        An unexpected error occurred. Please try again or contact support if the
        problem persists.
      </p>
       {import.meta.env.DEV && (
        <pre className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg mb-4 max-w-full overflow-auto">
          {error.message}
        </pre>
      )}
      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary} variant="default">
          Try Again
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Page
        </Button>
      </div>
    </div>
  );
}

function ErrorBoundary({ children, fallback }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }),
  resetErrorBoundary: PropTypes.func,
};

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.elementType,
};

export default ErrorBoundary;

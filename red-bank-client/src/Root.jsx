import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { router } from './Routes/Router';
import { AuthContextProvider } from './context/AuthContext';
import ErrorBoundary from './components/shared/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const Root = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <AuthContextProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: '!shadow-none !py-1 !border',
            success: { style: { border: '1px solid #6ed654' } },
            error: { style: { border: '1px solid #ff4c4c' } },
          }}
          limit={2}
        />
      </QueryClientProvider>
    </AuthContextProvider>
  );
};

export default Root;

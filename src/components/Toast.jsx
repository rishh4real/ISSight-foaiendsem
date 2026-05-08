import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        className:
          'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-700 shadow-soft dark:shadow-soft-dark',
      }}
    />
  );
}

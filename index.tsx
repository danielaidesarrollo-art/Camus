import React from 'react';
// Fix: Import from 'react-dom/client' to use the new React 18 root API.
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const ErrorFallback = ({ error }: { error: Error | null }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-gray p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                <h1 className="text-2xl font-bold text-red-600">Algo salió muy mal.</h1>
                <p className="text-gray-700">
                    Ocurrió un error inesperado que impidió que la aplicación se cargara correctamente.
                </p>
                <button
                    onClick={() => {
                        // Clear storage to prevent issues from corrupted data, then reload.
                        try {
                            localStorage.clear();
                        } catch (e) {
                            console.error("Failed to clear localStorage:", e);
                        }
                        window.location.reload();
                    }}
                    className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-md font-semibold hover:bg-brand-lightblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                >
                    Recargar Aplicación
                </button>
            </div>
        </div>
    );
};


// Fix: Use the new React 18 root API. 'ReactDOM.render' is deprecated and can cause typing issues with newer versions of @types/react.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
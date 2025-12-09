
import React from 'react';
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard.tsx';
import { AppProvider, useAppContext } from './context/AppContext.tsx';

const LoadingScreen: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Cargando aplicación...</p>
    </div>
);

const ErrorScreen: React.FC<{ message: string | null }> = ({ message }) => (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray p-4">
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
            <h1 className="text-2xl font-bold text-red-600">Error Crítico</h1>
            <p className="text-gray-700">
                {message || "Ocurrió un error inesperado al iniciar la aplicación."}
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-md font-semibold hover:bg-brand-lightblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            >
                Recargar Aplicación
            </button>
        </div>
    </div>
);

const AppContent: React.FC = () => {
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { isLoading, error, user } = useAppContext();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <ErrorScreen message={error} />;
    }

    return !user ? <Login /> : <Dashboard />;
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <div className="min-h-screen bg-gray-100">
                <AppContent />
            </div>
        </AppProvider>
    );
};

export default App;
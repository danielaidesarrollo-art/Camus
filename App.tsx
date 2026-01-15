import React from 'react';
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard.tsx';
import InstallPrompt from './components/InstallPrompt.tsx';
import { AppProvider, useAppContext } from './context/AppContext.tsx';

const AppContent: React.FC = () => {
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { isLoading, error, user } = useAppContext();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0E14]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin"></div>
                    <p className="text-[#00E5FF] font-medium animate-pulse">Cargando Camus...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] p-4">
                <div className="glass-panel p-8 max-w-lg w-full text-center space-y-6">
                    <h1 className="text-2xl font-bold text-red-500 font-outfit">Error Crítico</h1>
                    <p className="text-gray-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-[#00E5FF] text-[#0B0E14] rounded-xl font-bold hover:bg-[#00B8CC] transition-all"
                    >
                        Recargar Aplicación
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {!user ? <Login /> : <Dashboard />}
            <InstallPrompt />
        </>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
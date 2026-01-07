import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => (
    <div
        className={`glass-card p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
        {children}
    </div>
);

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    glow?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    variant = 'primary',
    glow = false,
    className = '',
    ...props
}) => {
    const baseStyles = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#00E5FF] text-[#0B0E14] hover:bg-[#00B8CC] active:scale-95",
        outline: "border-2 border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#0B0E14]",
        ghost: "text-white hover:bg-white/10"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${glow ? 'glow-cyan' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, className = '', ...props }) => (
    <div className="space-y-2 w-full">
        {label && <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</label>}
        <input
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all ${className}`}
            {...props}
        />
    </div>
);

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: string[];
}

export const GlassSelect: React.FC<GlassSelectProps> = ({ label, options, className = '', ...props }) => (
    <div className="space-y-2 w-full">
        {label && <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</label>}
        <select
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all appearance-none cursor-pointer ${className}`}
            {...props}
        >
            <option value="" disabled className="bg-[#0B0E14] text-gray-400">Seleccionar...</option>
            {options.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0B0E14] text-white">
                    {opt}
                </option>
            ))}
        </select>
    </div>
);

interface GlassRadioGroupProps {
    label: string;
    name: string;
    options: string[];
    selectedValue: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export const GlassRadioGroup: React.FC<GlassRadioGroupProps> = ({
    label, name, options, selectedValue, onChange, className = ''
}) => (
    <div className={`space-y-3 ${className}`}>
        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="space-y-2">
            {options.map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-xl transition-colors">
                    <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${selectedValue === option ? 'border-[#00E5FF]' : 'border-white/20 group-hover:border-white/40'}`}>
                        {selectedValue === option && <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />}
                    </div>
                    <input
                        type="radio"
                        name={name}
                        value={option}
                        checked={selectedValue === option}
                        onChange={onChange}
                        className="hidden"
                    />
                    <span className={`text-sm transition-colors ${selectedValue === option ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {option}
                    </span>
                </label>
            ))}
        </div>
    </div>
);

interface GlassTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export const GlassTextArea: React.FC<GlassTextAreaProps> = ({ label, className = '', ...props }) => (
    <div className="space-y-2 w-full">
        {label && <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</label>}
        <textarea
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all min-h-[100px] ${className}`}
            {...props}
        />
    </div>
);

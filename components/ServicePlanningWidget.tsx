import React from 'react';

export const ServicePlanningWidget: React.FC = () => {
    // Mock Data for Budget vs Real
    const budget = 120; // Planned visits
    const executed = 98; // Actual visits
    const percentage = Math.round((executed / budget) * 100);

    return (
        <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-cyan-400">📊</span> Service Planning (Capacity)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Visual Circle */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#333"
                                strokeWidth="2"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={percentage > 90 ? "#EF4444" : "#00E5FF"}
                                strokeWidth="2"
                                strokeDasharray={`${percentage}, 100`}
                            />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                            {percentage}%
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="col-span-2 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-gray-400">Planned Capacity (Budget)</span>
                        <span className="text-xl font-mono text-white">{budget} Visits</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-gray-400">Executed (Real)</span>
                        <span className="text-xl font-mono text-cyan-400">{executed} Visits</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Variance</span>
                        <span className="text-xl font-mono text-green-400">{(executed - budget)} Visits</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

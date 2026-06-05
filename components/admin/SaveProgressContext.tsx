"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, X } from "lucide-react";

export type SaveStatus = "saving" | "success" | "error";

export interface SaveTask {
    id: string;
    name: string;
    progress: number;
    status: SaveStatus;
    error?: string;
    isViewed?: boolean;
}

interface SaveProgressContextProps {
    tasks: SaveTask[];
    startSave: (
        id: string,
        name: string,
        savePromise: () => Promise<void>
    ) => void;
    removeTask: (id: string) => void;
}

const SaveProgressContext = createContext<SaveProgressContextProps | undefined>(
    undefined
);

export const useSaveProgress = () => {
    const context = useContext(SaveProgressContext);
    if (!context) {
        throw new Error("useSaveProgress must be used within SaveProgressProvider");
    }
    return context;
};

export const SaveProgressProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [tasks, setTasks] = useState<SaveTask[]>([]);

    const removeTask = (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const startSave = async (
        id: string,
        name: string,
        savePromise: () => Promise<void>
    ) => {
        // Add task
        setTasks((prev) => [
            ...prev,
            { id, name, progress: 0, status: "saving" },
        ]);

        // Simulate progress while waiting for the promise
        const progressInterval = setInterval(() => {
            setTasks((prev) =>
                prev.map((t) => {
                    if (t.id === id && t.status === "saving" && t.progress < 90) {
                        // Increment progress slowly up to 90%
                        const increment = Math.max(1, Math.floor((90 - t.progress) / 10));
                        return { ...t, progress: t.progress + increment };
                    }
                    return t;
                })
            );
        }, 500);

        try {
            await savePromise();
            clearInterval(progressInterval);

            setTasks((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, progress: 100, status: "success" } : t
                )
            );

            // Auto remove success toasts after 5 seconds
            setTimeout(() => {
                removeTask(id);
            }, 5000);
        } catch (err: unknown) {
            clearInterval(progressInterval);
            const errorMessage = err instanceof Error ? err.message : "فشل الحفظ";
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === id
                        ? { ...t, status: "error", error: errorMessage }
                        : t
                )
            );
        }
    };

    return (
        <SaveProgressContext.Provider value={{ tasks, startSave, removeTask }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`p-4 rounded-2xl shadow-xl border ${task.status === "saving"
                            ? "bg-white border-blue-100"
                            : task.status === "success"
                                ? "bg-green-50 border-green-100"
                                : "bg-red-50 border-red-100"
                            } overflow-hidden relative transition-all animate-fade-in-up`}
                    >
                        {/* Progress bar background for active savings */}
                        {task.status === "saving" && (
                            <div
                                className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                            />
                        )}

                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                {task.status === "saving" && (
                                    <Loader2 className="animate-spin text-blue-500" size={20} />
                                )}
                                {task.status === "success" && (
                                    <CheckCircle2 className="text-green-500" size={20} />
                                )}
                                {task.status === "error" && (
                                    <XCircle className="text-red-500" size={20} />
                                )}

                                <div>
                                    <h4 className="font-bold text-sm text-gray-800">
                                        {task.status === "saving"
                                            ? "جاري الحفظ..."
                                            : task.status === "success"
                                                ? "تم الحفظ بنجاح"
                                                : "خطأ في الحفظ"}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                        {task.name}
                                    </p>
                                    {task.status === "error" && (
                                        <p className="text-xs text-red-500 mt-1">{task.error}</p>
                                    )}
                                </div>
                            </div>

                            {(task.status === "success" || task.status === "error") && (
                                <button
                                    onClick={() => removeTask(task.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {task.status === "saving" && (
                            <div className="text-xs text-right text-blue-600 font-bold mt-2">
                                {task.progress}%
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </SaveProgressContext.Provider>
    );
};

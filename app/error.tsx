"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-red-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 font-snaga">
                    عذراً، حدث خطأ غير متوقع!
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    نعتذر عن هذا الخلل. فريقنا التقني قد تم إشعاره وسنقوم بحل المشكلة في أقرب وقت.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-4 px-6 rounded-2xl transition-all"
                    >
                        المحاولة مرة أخرى
                    </button>
                    <Link
                        href="/"
                        className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl transition-all"
                    >
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}

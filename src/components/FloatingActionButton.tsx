'use client';

import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
    onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
    return (
        <div className="fixed bottom-8 right-8 z-40 group">
            <button
                aria-label="新しいアイテムを追加"
                onClick={onClick}
                className="fab-button flex items-center justify-center size-14 bg-[#0d59f2] text-white rounded-full shadow-lg shadow-[#0d59f2]/30 hover:shadow-[#0d59f2]/50 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0d59f2]/20"
            >
                <Plus className="fab-icon w-7 h-7 transition-transform duration-300" />
            </button>
            {/* Tooltip for FAB (appears on hover) */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
                新しいアイテムを追加
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
            </div>
        </div>
    );
}

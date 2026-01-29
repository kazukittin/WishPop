'use client';

import { Search, Grid2X2 } from 'lucide-react';
import { Status, STATUS_LABELS } from '@/types/item';

interface HeaderProps {
    activeTab: Status | 'all';
    onTabChange: (tab: Status | 'all') => void;
    totalValue: number;
    itemCounts: {
        all: number;
        want: number;
        pending: number;
        bought: number;
    };
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function Header({
    activeTab,
    onTabChange,
    totalValue,
    itemCounts,
    searchQuery,
    onSearchChange,
}: HeaderProps) {
    const tabs: { id: Status | 'all'; label: string }[] = [
        { id: 'all', label: 'All Items' },
        { id: 'want', label: STATUS_LABELS.want },
        { id: 'pending', label: STATUS_LABELS.pending },
        { id: 'bought', label: STATUS_LABELS.bought },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto">
                {/* Top Row: Logo, Search, Cost Summary */}
                <div className="px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo & Branding */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center size-9 rounded-lg bg-[#0d59f2] text-white shadow-lg shadow-[#0d59f2]/30">
                                <Grid2X2 className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                WishPop
                            </h1>
                        </div>
                        {/* Mobile Action: Search Toggle */}
                        <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar (Pinterest style pill) */}
                    <div className="hidden md:block flex-1 max-w-xl w-full px-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#0d59f2] transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="w-full h-11 pl-11 pr-4 bg-gray-100 dark:bg-gray-800 border-transparent focus:border-transparent rounded-full text-sm font-medium focus:ring-2 focus:ring-[#0d59f2]/20 focus:bg-white dark:focus:bg-gray-900 transition-all placeholder:text-gray-500"
                                placeholder="Search your items..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Right Actions: Total Cost & User */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                Total Value
                            </span>
                            <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                                {formatPrice(totalValue)}
                            </span>
                        </div>
                        <button className="size-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm hover:ring-2 hover:ring-[#0d59f2] hover:ring-offset-2 transition-all bg-gradient-to-br from-[#0d59f2] to-purple-600">
                            <span className="text-white font-bold text-sm">U</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Navigation Tabs */}
                <div className="px-4 md:px-8 mt-1">
                    <nav aria-label="Tabs" className="flex space-x-6 md:space-x-8 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const count = itemCounts[tab.id as keyof typeof itemCounts];

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`group flex items-center gap-2 border-b-[3px] py-3 px-1 text-sm whitespace-nowrap transition-all ${isActive
                                            ? 'border-[#0d59f2] font-bold text-slate-900 dark:text-white'
                                            : 'border-transparent font-medium text-gray-500 hover:text-[#0d59f2] hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`text-xs py-0.5 px-2 rounded-full transition-colors ${isActive
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-[#0d59f2]/10 group-hover:text-[#0d59f2] text-gray-500'
                                            }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
}

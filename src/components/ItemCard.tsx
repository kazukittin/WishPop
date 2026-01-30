'use client';

import { Edit3, MoreHorizontal } from 'lucide-react';
import { WishlistItem, STATUS_LABELS, PRIORITY_LABELS } from '@/types/item';
import Image from 'next/image';

interface ItemCardProps {
    item: WishlistItem;
    onEdit: (item: WishlistItem) => void;
    onMenuClick: (item: WishlistItem) => void;
}

export default function ItemCard({ item, onEdit, onMenuClick }: ItemCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'S':
                return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 border-red-100 dark:border-red-900/30';
            case 'A':
                return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-100 dark:border-yellow-900/30';
            case 'B':
                return 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300 border-gray-200 dark:border-gray-600';
            default:
                return 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300 border-gray-200 dark:border-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'want':
                return 'bg-[#0d59f2]';
            case 'pending':
                return 'bg-yellow-500';
            case 'bought':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const shouldPulse = item.status === 'want';

    // Default placeholder image if imageUrl is empty
    const placeholderImage = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
    const imageSrc = item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : placeholderImage;

    return (
        <div className="masonry-item item-card group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Image Container */}
            <div className="relative w-full">
                <Image
                    src={imageSrc}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                    unoptimized
                />
                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-3 gap-2">
                    <button
                        onClick={() => onEdit(item)}
                        className="bg-white/90 backdrop-blur-sm text-slate-900 p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all"
                        title="Edit Item"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">
                        {item.title}
                    </h3>
                    <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border ${getPriorityStyles(
                            item.priority
                        )}`}
                    >
                        {PRIORITY_LABELS[item.priority]}
                    </span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    {formatPrice(item.price)}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                        <span
                            className={`size-2 rounded-full ${getStatusColor(item.status)} ${shouldPulse ? 'status-pulse' : ''
                                }`}
                        />
                        {STATUS_LABELS[item.status]}
                    </span>
                    <button
                        onClick={() => onMenuClick(item)}
                        className="text-gray-400 hover:text-[#0d59f2] transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

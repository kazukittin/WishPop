'use client';

import { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Link as LinkIcon, Loader2 } from 'lucide-react';
import { WishlistItem, Status, Priority, STATUS_LABELS, PRIORITY_LABELS } from '@/types/item';

interface EditItemModalProps {
    isOpen: boolean;
    item: WishlistItem | null;
    onClose: () => void;
    onSave: (item: WishlistItem) => void;
    onDelete: (id: string) => void;
}

export default function EditItemModal({ isOpen, item, onClose, onSave, onDelete }: EditItemModalProps) {
    const [title, setTitle] = useState(item?.title || '');
    const [description, setDescription] = useState(item?.description || '');
    const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
    const [price, setPrice] = useState(item?.price.toString() || '');
    const [url, setUrl] = useState(item?.url || '');
    const [status, setStatus] = useState<Status>(item?.status || 'want');
    const [priority, setPriority] = useState<Priority>(item?.priority || 'A');
    const [memo, setMemo] = useState(item?.memo || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');

    // Reset form when item changes
    useEffect(() => {
        if (item) {
            setTitle(item.title || '');
            setDescription(item.description || '');
            setImageUrl(item.imageUrl || '');
            setPrice(item.price?.toString() || '');
            setUrl(item.url || '');
            setStatus(item.status || 'want');
            setPriority(item.priority || 'A');
            setMemo(item.memo || '');
        } else {
            // Reset to empty when no item
            setTitle('');
            setDescription('');
            setImageUrl('');
            setPrice('');
            setUrl('');
            setStatus('want');
            setPriority('A');
            setMemo('');
        }
    }, [item]);

    const handleFetchOGP = async () => {
        if (!url.trim()) return;

        setIsFetching(true);
        setFetchError('');

        try {
            const response = await fetch('/api/fetch-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch metadata');
            }

            const data = await response.json();

            if (data.title) setTitle(data.title);
            if (data.description) setDescription(data.description);
            if (data.image) setImageUrl(data.image);
            if (data.price) setPrice(data.price.toString());
        } catch {
            setFetchError('URLからの情報取得に失敗しました。');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!item || !title.trim() || !price) return;

        onSave({
            ...item,
            title: title.trim(),
            description: description.trim() || undefined,
            imageUrl: imageUrl.trim() || 'https://via.placeholder.com/400x300?text=No+Image',
            price: parseFloat(price) || 0,
            url: url.trim(),
            status,
            priority,
            memo: memo.trim() || undefined,
            updatedAt: new Date(),
        });

        onClose();
    };

    const handleDelete = () => {
        if (item) {
            onDelete(item.id);
            setShowDeleteConfirm(false);
            onClose();
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="modal-content relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-[#0d59f2]" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Edit Item
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Delete Item"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 m-4 shadow-2xl max-w-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                Delete Item?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                This action cannot be undone. Are you sure you want to delete &quot;{item.title}&quot;?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 h-10 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 h-10 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* URL Input with Fetch Button */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Product URL
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <LinkIcon className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/product"
                                    className="w-full h-11 pl-10 pr-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0d59f2]/20 focus:border-[#0d59f2] transition-all"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleFetchOGP}
                                disabled={isFetching || !url.trim()}
                                className="px-4 h-11 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isFetching ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Re-fetch'
                                )}
                            </button>
                        </div>
                        {fetchError && (
                            <p className="mt-2 text-sm text-red-500">{fetchError}</p>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Product name"
                            required
                            className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0d59f2]/20 focus:border-[#0d59f2] transition-all"
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Image URL
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0d59f2]/20 focus:border-[#0d59f2] transition-all"
                        />
                        {imageUrl && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-32 object-cover rounded-lg"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Price (¥) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            required
                            min="0"
                            className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0d59f2]/20 focus:border-[#0d59f2] transition-all"
                        />
                    </div>

                    {/* Status & Priority Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Status)}
                                className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0d59f2]/20 focus:border-[#0d59f2] transition-all"
                            >
                                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0d59f2]/20 focus:border-[#0d59f2] transition-all"
                            >
                                {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label} ({key})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Memo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Memo
                        </label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="Notes about this item..."
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0d59f2]/20 focus:border-[#0d59f2] transition-all resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !price}
                            className="flex-1 h-12 bg-[#0d59f2] text-white rounded-xl font-semibold text-sm hover:bg-[#0d59f2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#0d59f2]/30"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

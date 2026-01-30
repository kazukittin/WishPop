'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Status, Priority, STATUS_LABELS, PRIORITY_LABELS } from '@/types/item';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: {
        title: string;
        description?: string;
        imageUrl: string;
        price: number;
        url: string;
        status: Status;
        priority: Priority;
        memo?: string;
    }) => void;
}

export default function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [price, setPrice] = useState('');
    const [status, setStatus] = useState<Status>('want');
    const [priority, setPriority] = useState<Priority>('A');
    const [memo, setMemo] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');

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
            setFetchError('URLからの情報取得に失敗しました。手動で入力してください。');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !price) return;

        onAdd({
            title: title.trim(),
            description: description.trim() || undefined,
            imageUrl: imageUrl.trim() || 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image',
            price: parseFloat(price) || 0,
            url: url.trim(),
            status,
            priority,
            memo: memo.trim() || undefined,
        });

        // Reset form
        setUrl('');
        setTitle('');
        setDescription('');
        setImageUrl('');
        setPrice('');
        setStatus('want');
        setPriority('A');
        setMemo('');
        setFetchError('');
        onClose();
    };

    const handleClose = () => {
        setUrl('');
        setTitle('');
        setDescription('');
        setImageUrl('');
        setPrice('');
        setStatus('want');
        setPriority('A');
        setMemo('');
        setFetchError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="modal-content relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        新しいアイテムを追加
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* URL Input with Fetch Button */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            商品URL
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
                                className="px-4 h-11 bg-[#0d59f2] text-white rounded-xl font-semibold text-sm hover:bg-[#0d59f2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isFetching ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        取得中...
                                    </>
                                ) : (
                                    '情報取得'
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
                            商品名 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="商品名を入力"
                            required
                            className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0d59f2]/20 focus:border-[#0d59f2] transition-all"
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            画像URL
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
                                    alt="プレビュー"
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
                            価格（円） <span className="text-red-500">*</span>
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
                                ステータス
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
                                優先度
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
                            メモ
                        </label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="メモを入力..."
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0d59f2]/20 focus:border-[#0d59f2] transition-all resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 h-12 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !price}
                            className="flex-1 h-12 bg-[#0d59f2] text-white rounded-xl font-semibold text-sm hover:bg-[#0d59f2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#0d59f2]/30"
                        >
                            追加する
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

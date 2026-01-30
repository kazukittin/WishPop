'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import ItemCard from '@/components/ItemCard';
import AddItemModal from '@/components/AddItemModal';
import EditItemModal from '@/components/EditItemModal';
import FloatingActionButton from '@/components/FloatingActionButton';
import { WishlistItem, Status, Priority } from '@/types/item';

// Initial sample data based on the mock
const initialItems: WishlistItem[] = [
  {
    id: '1',
    title: 'Ergonomic Office Chair',
    description: 'Black ergonomic mesh office chair for comfortable work',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6vrEJVgUDAoBYerBTXbpXUI2KwuphfCZsxKPvl-Io_4GFuaiHPBUYoKwkSnSHvBVdCD5d52BZXzVSwRJphctY-Kg6kS1C7hrCbI4GJKriSbjKGd7THwM4G6YZZ0IxobdOFl7hVgBZYlAqw4OONuYmnJfWNHqpW3S0XzteRp_oEnnBzMH0CjN69RAnF42f81sCUC9xlsTR_BGKLliHf6MiQlKOJkS0_LeCM_3l9vtU12-z4a-xUzfZkxuxcI4Befdk_TonxChmxCA',
    price: 35000,
    url: 'https://example.com/chair',
    status: 'want',
    priority: 'S',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Mechanical Keyboard',
    description: 'Mechanical keyboard with colorful keycaps',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbfQ_IaND0bheqTcU2OIDmAL7BrJf4VIlFgjQmylkpjtSjac0ltw3LUkvuBRItmFTSPLCKSom6SBpPxf1-rQsVuQLp996ZZcKRYK9ZUNi4B5ZPqqVqjw8EQ2GkgxK62exztc00Dk_1vK-_kucUDs9Gy-8Sxj-0mp4j6t1VTvr1YO5KXIUeRx6y51xJ3XR5tibkuAWt1ngdjB5JnI96s0rvC7VfTUOzpurgxSPR75YigLIkZqqVIkQFM3MH8tnmIxt3lQZbR194wRE',
    price: 12000,
    url: 'https://example.com/keyboard',
    status: 'pending',
    priority: 'A',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Noise Cancelling Headphones',
    description: 'Silver over-ear headphones with active noise cancellation',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvUxXQyYIQUPWKLf_RoQND4bwWDa4vDAAnVlOy1lSZVFfBDmMmxLvt5i9O1uzq_sCiXdueygLpFB3YohV8F5PJq9dW9SCaDengkdyybRnx0ULwscoCizjzp1aMasdwDkGSMWXc69IRfQU3Fh1Qc6WfsCmmy5EP5h-JSo1kwt4KULwMQ2hsxwrQQttpBceUyT9mgNq5Coa0SPAt7uL2mhK58RQ6_e00C8hU0bj5FWy3A-iZyiHzTjw2yeQ2cO1-a6lKyHPEl3yttfY',
    price: 29900,
    url: 'https://example.com/headphones',
    status: 'bought',
    priority: 'B',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Ultrawide Monitor',
    description: 'A modern ultrawide monitor for coding and productivity',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-XR6uk_dd57r6LTyfW-ZaelR51cBTRkxI-S2aEUDGs2vcfM_vmPcfUax0m9wQmC9rnIcSdW3MaIL2ih8Qv2TQRmEsIiihPX0x_UF1R4fkMOrEpqXflE-stywznAzFs0oY_2r4_FxZbSaEczSpOyFJzuaf9M1RQPWitKgrDua4vrOV1Kum8Ooccpy6cgJ0d8vSNgvugKyu53uNE-9tX0C7KwofalRixnIseN5wcqhm63ZmLaEftZIELN4jiXUdbiDzEMyh2sqWwBU',
    price: 45000,
    url: 'https://example.com/monitor',
    status: 'want',
    priority: 'S',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Mid-Century Sofa',
    description: 'Green velvet sofa in a vintage mid-century style',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmOpw2JdE1s2b-rV-8lOIW0v2M5iKwFoogWob4-l-pbg1no_ngkePijf1NLXmJClzBHSIYhYT7I-hrmIOQ0UYVUe4nShW7jevtBxHS-KP4bD2nd3_6PZu1aLyQ4AfkCfLNbU0jIcHDid04sANaj_J1PkWsQWH9tEitUA1c6ZDI3knbHES1qUJ06Pucz-fSqVyx1GdtJFHEKqUagHlKM8waa6bEtmldE51hHPbSywGqHfoztfvuEa4sVIepI_ZeUsRkIGeOvjpBcrI',
    price: 89900,
    url: 'https://example.com/sofa',
    status: 'pending',
    priority: 'A',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: 'iPad Air',
    description: 'Tablet computer with stylus support',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzOSiJ1U5D0T5_32Ko0Mg5rsDZjw1tKkcKmzydcfrSKTiHkboxWms9aH_E6_ZZtT2ijdCGNqiq-GrG2Pp8muWKmKqqwjcYXLRYd7GOxTI_n8WfgMX8X6xOlNzWb5zHzdfQujA36U-oPq5r-VMjGXB1J1pfUMvyXAzeFeTW6RbAdpR4cEYjA6IdQQ1GduxsCR3tn01g0gwQzwCuf40gYDEuE3HKnBpuzvqHNY1mxhFPkADlEzKq7XLtilO6KFa9itd7Dgr7WdXL0tQ',
    price: 59900,
    url: 'https://example.com/ipad',
    status: 'want',
    priority: 'B',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    title: 'Sony Alpha a7 III',
    description: 'Professional full-frame mirrorless camera',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiBi32xmdbVV32i9OdO7rv9F7hQatPwDk8VZ_hPuiMhgBTJS_sMVo7uzEusI7OD9PxsO0lybiufYZ_atj0_bUciHx-wh_lmkC9tcp7AeDRR1CyCl5sh4buTfuwSRshLBHcS0-3tSQUIN-muWAwMxXKOt4UxDel4mq2idRnWOXJOz9M1DKfBQrRSdzisX2bMBrfmWnuE-DmhvqkYYkdYVY29RpUMsahmDcTbRTJ1II6sxJ4AYpAGwDJ2kOIFrLhZq213wAWpVWO_Uk',
    price: 199800,
    url: 'https://example.com/camera',
    status: 'want',
    priority: 'S',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Local storage key
const STORAGE_KEY = 'wishpop_items';

export default function Home() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [activeTab, setActiveTab] = useState<Status | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load items from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const itemsWithDates = parsed.map((item: WishlistItem) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setItems(itemsWithDates);
      } catch {
        setItems(initialItems);
      }
    } else {
      setItems(initialItems);
    }
    setIsLoaded(true);
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Filtered items based on active tab and search query
  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by status
    if (activeTab !== 'all') {
      result = result.filter((item) => item.status === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.memo?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [items, activeTab, searchQuery]);

  // Calculate item counts for each tab
  const itemCounts = useMemo(() => {
    return {
      all: items.length,
      want: items.filter((item) => item.status === 'want').length,
      pending: items.filter((item) => item.status === 'pending').length,
      bought: items.filter((item) => item.status === 'bought').length,
    };
  }, [items]);

  // Calculate total value (excluding purchased items)
  const totalValue = useMemo(() => {
    return filteredItems
      .filter((item) => item.status !== 'bought')
      .reduce((sum, item) => sum + item.price, 0);
  }, [filteredItems]);

  // Add new item
  const handleAddItem = (newItem: {
    title: string;
    description?: string;
    imageUrl: string;
    price: number;
    url: string;
    status: Status;
    priority: Priority;
    memo?: string;
  }) => {
    const item: WishlistItem = {
      id: generateId(),
      ...newItem,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems((prev) => [item, ...prev]);
  };

  // Edit existing item
  const handleEditItem = (item: WishlistItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  // Save edited item
  const handleSaveItem = (updatedItem: WishlistItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Menu click handler (for future dropdown functionality)
  const handleMenuClick = (item: WishlistItem) => {
    // For now, open edit modal
    handleEditItem(item);
  };

  // Show loading state while hydrating
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#101622]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-[#0d59f2] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalValue={totalValue}
        itemCounts={itemCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        {filteredItems.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery ? 'アイテムが見つかりません' : 'まだアイテムがありません'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              {searchQuery
                ? '検索条件を変更してお試しください。'
                : '下の＋ボタンをクリックして、欲しいものを追加しましょう。'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-[#0d59f2] text-white rounded-xl font-semibold text-sm hover:bg-[#0d59f2]/90 transition-all shadow-lg shadow-[#0d59f2]/30"
              >
                最初のアイテムを追加
              </button>
            )}
          </div>
        ) : (
          // Masonry grid
          <div className="masonry-grid pb-20">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onMenuClick={handleMenuClick}
              />
            ))}
          </div>
        )}
      </main>

      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </>
  );
}

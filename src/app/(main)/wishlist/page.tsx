"use client";

import { useState, useEffect } from "react";
import WishItemModal from "@/components/wishlist/wishItemModal";
import { IWishlistItem } from "@/types/wishlist";
import { WishlistService } from "@/services/wishlistService";
import { useUser } from "@/contexts/UserContext";

export default function WishlistPage() {
  const [items, setItems] = useState<IWishlistItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    // 初期データ取得
    WishlistService.fetchWishlist(user.id).then(setItems);
  }, [user]);

  // itemData: { name: string, price: number }
  const handleAdd = async (itemData: { name: string; price: number }) => {
    if (!user) return;
    const newItem = await WishlistService.addWishlistItem(user?.id, itemData);
    if (newItem) {
      setItems([newItem, ...items]);
    }
    setShowModal(false);
  };

  // 名称を切り詰める関数
  const truncateText = (text: string, maxLength: number = 16) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="relative p-4 sm:p-8 bg-gray-50">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        {/* デスクトップ表示: テーブル */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  値段
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center"
                    colSpan={2}
                  >
                    まだ登録されていません
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-xs font-medium">
                      {truncateText(item.name, 16)}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className="text-blue-600 font-medium">
                        ¥{item.price.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* モバイル表示: カードUI */}
        <div className="md:hidden">
          {items.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              まだ登録されていません
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {truncateText(item.name, 12)}
                    </h3>
                  </div>
                  <span className="font-medium text-blue-600 text-sm">
                    ¥{item.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            {items.length}件のほしいものを表示
          </div>
        )}
      </div>

      {/* プラスボタン: フッターに被らないように調整 */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-3xl"
        aria-label="追加"
      >
        <svg
          className="w-6 h-6 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* モーダル */}
      {showModal && (
        <WishItemModal setShowModal={setShowModal} handleAdd={handleAdd} />
      )}
    </div>
  );
}

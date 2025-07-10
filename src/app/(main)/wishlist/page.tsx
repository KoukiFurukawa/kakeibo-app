"use client";

import { useState } from "react";

interface IWishlistItem {
  id: string;
  name: string;
  price: number;
}

export default function WishlistPage() {
  const [items, setItems] = useState<IWishlistItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name,
        price: Number(price),
      },
    ]);
    setName("");
    setPrice("");
    setShowModal(false);
  };

  return (
    <div className="relative min-h-screen p-4 sm:p-8 bg-gray-50">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">ほしいものリスト</h1>
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            まだ登録されていません
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-2 border-b">名称</th>
                <th className="py-2 px-2 border-b">値段</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 px-2 border-b">{item.name}</td>
                  <td className="py-2 px-2 border-b">
                    {item.price.toLocaleString()} 円
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* プラスボタン */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-3xl"
        aria-label="追加"
      >
        ＋
      </button>

      {/* 追加モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={handleAdd}
            className="bg-white rounded-lg shadow-lg p-6 w-80 space-y-4"
          >
            <h2 className="text-lg font-semibold mb-2">ほしいものを追加</h2>
            <div>
              <label className="block text-sm mb-1">名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">値段</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
                min={0}
                required
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                追加
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";

interface Props {
  setShowModal: (show: boolean) => void;
  handleAdd: (item: { name: string; price: number }) => void;
}

function WishItemModal({ setShowModal, handleAdd }: Props) {
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd({ name, price: Number(price) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">ほしいものを追加</h2>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm"
              placeholder="ほしいものの名前"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              値段
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                ¥
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-8 p-3 border border-gray-300 rounded-md text-sm"
                placeholder="0"
                min={0}
                required
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-3 px-4 rounded-md font-medium text-sm bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-md font-medium text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WishItemModal;

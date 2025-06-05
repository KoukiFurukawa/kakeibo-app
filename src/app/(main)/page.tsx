export default function Home() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">家計簿ダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">今月の収支</h2>
          <div className="flex justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">収入</p>
              <p className="text-base sm:text-lg font-bold text-green-600">¥0</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">支出</p>
              <p className="text-base sm:text-lg font-bold text-red-600">¥0</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">残高</p>
              <p className="text-base sm:text-lg font-bold">¥0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">支出の内訳</h2>
          <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-100 rounded">
            <p className="text-gray-500 text-sm">ここに円グラフが表示されます</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">最近の取引</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">種類</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タグ</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">データがありません</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500"></td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500"></td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

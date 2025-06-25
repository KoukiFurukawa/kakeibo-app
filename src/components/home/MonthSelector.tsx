interface MonthSelectorProps {
    selectedYear: number;
    selectedMonth: number;
    salaryDay: number; // 給料日（デフォルトは1日）
    onMonthChange: (year: number, month: number) => Promise<void>;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
    selectedYear,
    selectedMonth,
    salaryDay, // 給料日
    onMonthChange
}) => {
    // 現在の日付に基づいて適切な月度を計算する関数
    const getCurrentPeriod = () => {
        const now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1; // JavaScriptの月は0から始まるので+1
        
        if (salaryDay > 1) {
            const currentDay = now.getDate();
            
            // 現在が給料日以降なら、次の月度に
            if (currentDay >= salaryDay) {
                month += 1;
                if (month > 12) {
                    month = 1;
                    year += 1;
                }
            }
        }
        
        return { year, month };
    };
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">月選択</h2>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedYear}
                        onChange={async (e) => {
                            const year = Number(e.target.value);
                            await onMonthChange(year, selectedMonth);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        {Array.from({ length: 5 }, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                                <option key={year} value={year}>
                                    {year}年
                                </option>
                            );
                        })}
                    </select>
                    <select
                        value={selectedMonth}
                        onChange={async (e) => {
                            const month = Number(e.target.value);
                            await onMonthChange(selectedYear, month);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}月度
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={async () => {
                            const { year, month } = getCurrentPeriod();
                            await onMonthChange(year, month);
                        }}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                    >
                        今月
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MonthSelector;

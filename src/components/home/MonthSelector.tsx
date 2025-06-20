interface MonthSelectorProps {
    selectedYear: number;
    selectedMonth: number;
    onMonthChange: (year: number, month: number) => Promise<void>;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
    selectedYear,
    selectedMonth,
    onMonthChange
}) => {
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
                                {i + 1}月
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={async () => {
                            const now = new Date();
                            await onMonthChange(now.getFullYear(), now.getMonth() + 1);
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

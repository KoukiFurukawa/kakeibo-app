interface IBudgetProgressChartProps {
    used: number;
    budget: number;
    label: string;
    isSavings?: boolean;
}

const BudgetProgressChart: React.FC<IBudgetProgressChartProps> = ({
    used,
    budget,
    label,
    isSavings = false
}) => {
    const percentage = budget > 0 ? Math.min((used / budget) * 100, 100) : 0;
    const remaining = Math.max(budget - used, 0);

    const getColor = () => {
        if (isSavings) {
            // 貯金の場合は達成度に応じて色を変える
            if (percentage >= 100) return 'bg-green-500';
            if (percentage >= 80) return 'bg-blue-500';
            return 'bg-gray-400';
        } else {
            // 支出の場合は予算オーバーを警告
            if (percentage >= 100) return 'bg-red-500';
            if (percentage >= 80) return 'bg-yellow-500';
            return 'bg-green-500';
        }
    };

    const getStatusText = () => {
        if (isSavings) {
            return percentage >= 100 ? '目標達成！' : `目標まで ¥${remaining.toLocaleString()}`;
        } else {
            return percentage >= 100 ? '予算オーバー' : `残り ¥${remaining.toLocaleString()}`;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-gray-600">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className={`h-3 rounded-full transition-all duration-300 ${getColor()}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
                <span>
                    {isSavings ? '貯金' : '支出'}: ¥{used.toLocaleString()}
                </span>
                <span>{getStatusText()}</span>
            </div>
        </div>
    );
};

export default BudgetProgressChart;

import { PieChartData } from "@/types/transaction";

interface PieChartProps {
    data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-100 rounded">
                <p className="text-gray-500 text-sm">支出データがありません</p>
            </div>
        );
    }

    const strokeWidth = 12;

    // モバイルとデスクトップの設定を統一
    const mobileConfig = { cx: 80, cy: 80, r: 60, size: 160 };
    const desktopConfig = { cx: 80, cy: 80, r: 60, size: 200 };

    let accumulatedAngle = 0;

    const createPath = (startAngle: number, endAngle: number, centerX: number, centerY: number, radius: number) => {
        const start = polarToCartesian(centerX, centerY, radius, endAngle);
        const end = polarToCartesian(centerX, centerY, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    return (
        <div className="h-48 sm:h-64 flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-2">
            {/* グラフ部分 */}
            <div className="flex-shrink-0">
                <svg width={mobileConfig.size} height={mobileConfig.size} className="sm:w-[200px] sm:h-[200px]">
                    {/* 背景円 */}
                    <circle
                        cx={mobileConfig.cx}
                        cy={mobileConfig.cy}
                        r={mobileConfig.r}
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth={strokeWidth}
                        className="sm:cx-[100] sm:cy-[100] sm:r-[75]"
                    />

                    {data.map((item, index) => {
                        const angle = (item.value / total) * 360;
                        const startAngle = accumulatedAngle;
                        const endAngle = accumulatedAngle + angle;

                        const pathData = createPath(startAngle, endAngle, mobileConfig.cx, mobileConfig.cy, mobileConfig.r);
                        accumulatedAngle += angle;

                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill="none"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                className="sm:hidden"
                            />
                        );
                    })}

                    {/* デスクトップ用のパス */}
                    {data.map((item, index) => {
                        const angle = (item.value / total) * 360;
                        const startAngle = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0);
                        const endAngle = startAngle + angle;

                        const pathData = createPath(startAngle, endAngle, desktopConfig.cx, desktopConfig.cy, desktopConfig.r);

                        return (
                            <path
                                key={`desktop-${index}`}
                                d={pathData}
                                fill="none"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                className="hidden sm:block"
                            />
                        );
                    })}

                    {/* 中央のテキスト */}
                    <text x={mobileConfig.cx} y={mobileConfig.cy - 4} textAnchor="middle" className="text-xs sm:text-sm font-medium fill-gray-700 sm:x-[100] sm:y-[94]">
                        総支出
                    </text>
                    <text x={mobileConfig.cx} y={mobileConfig.cy + 8} textAnchor="middle" className="text-xs fill-gray-600 sm:x-[100] sm:y-[108]">
                        ¥{total.toLocaleString()}
                    </text>
                </svg>
            </div>

            {/* 凡例部分 */}
            <div className="flex-1 min-w-0 max-w-full sm:max-w-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    {data.slice(0, 6).map((item, index) => (
                        <div key={index} className="flex items-center min-w-0">
                            <div
                                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="truncate">
                                {item.label}: ¥{item.value.toLocaleString()} ({((item.value / total) * 100).toFixed(1)}%)
                            </span>
                        </div>
                    ))}
                    {data.length > 6 && (
                        <div className="text-xs text-gray-500 sm:col-span-2 mt-1">
                            他 {data.length - 6} 項目
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PieChart;

import {
  IMonthlyStats,
  IPieChartData,
  IUserFinance,
} from "@/types/transaction";
import BudgetProgressChart from "./BudgetProgressChart";

interface IBudgetProgressProps {
  userFinance: IUserFinance | null;
  expenseByTag: IPieChartData[];
  monthlyStats: IMonthlyStats;
}

const BudgetProgress: React.FC<IBudgetProgressProps> = ({
  userFinance,
  expenseByTag,
  monthlyStats,
}) => {
  if (!userFinance) return null;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">
        予算・目標の進捗
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BudgetProgressChart
          used={expenseByTag.find((item) => item.label === "食費")?.value || 0}
          budget={userFinance.food}
          label="食費"
        />
        <BudgetProgressChart
          used={expenseByTag.find((item) => item.label === "娯楽")?.value || 0}
          budget={userFinance.entertainment}
          label="娯楽"
        />
        <BudgetProgressChart
          used={expenseByTag.find((item) => item.label === "衣服")?.value || 0}
          budget={userFinance.clothing}
          label="衣服"
        />
        <BudgetProgressChart
          used={
            expenseByTag.find((item) => item.label === "日用品")?.value || 0
          }
          budget={userFinance.daily_goods}
          label="日用品"
        />
        <BudgetProgressChart
          used={expenseByTag
            .filter(
              (item) =>
                !["食費", "娯楽", "衣服", "日用品"].includes(item.label),
            )
            .reduce((sum, item) => sum + item.value, 0)}
          budget={userFinance.other}
          label="その他"
        />
        <BudgetProgressChart
          used={Math.max(monthlyStats.balance, 0)}
          budget={userFinance.savings_goal}
          label="貯金目標"
          isSavings={true}
        />
      </div>
    </div>
  );
};

export default BudgetProgress;

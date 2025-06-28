import { IPieChartData, ITransaction } from "@/types/transaction";

export function generateExpenseByTag(transactions: ITransaction[]): IPieChartData[] {
    const expenseTransactions = transactions.filter(t => !t.is_income);
    const tagTotals: { [key: string]: number } = {};

    expenseTransactions.forEach(transaction => {
        tagTotals[transaction.tag] = (tagTotals[transaction.tag] || 0) + transaction.amount;
    });

    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280',
        '#14b8a6', '#f97316', '#a855f7', '#22c55e'
    ];

    return Object.entries(tagTotals)
        .map(([tag, amount], index) => ({
            label: tag,
            value: amount,
            color: colors[index % colors.length]
        }))
        .sort((a, b) => b.value - a.value);
}

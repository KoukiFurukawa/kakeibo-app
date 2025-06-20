export interface Transaction {
    id: string;
    title: string;
    description?: string;
    amount: number;
    tag: string;
    is_income: boolean;
    date?: string;
    created_at: string;
}

export interface MonthlyStats {
    income: number;
    expense: number;
    balance: number;
}

export interface PieChartData {
    label: string;
    value: number;
    color: string;
}

export interface TransactionInput {
    title: string;
    description: string;
    amount: number;
    tag: string;
    is_income: boolean;
    date: string;
}

export interface UserFinance {
    id?: string;
    user_id?: string;
    savings_goal: number;
    food: number;
    entertainment: number;
    clothing: number;
    daily_goods: number;
    other: number;
}

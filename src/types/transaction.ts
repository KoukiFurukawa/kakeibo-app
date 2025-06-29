export interface ITransaction {
    id: string;
    title: string;
    description?: string;
    amount: number;
    tag: string;
    is_income: boolean;
    date?: string;
    created_at: string;
}

export interface IMonthlyStats {
    income: number;
    expense: number;
    balance: number;
}

export interface IPieChartData {
    label: string;
    value: number;
    color: string;
}

export interface ITransactionInput {
    title: string;
    description: string;
    amount: number;
    tag: string;
    is_income: boolean;
    date: string;
}

export interface IUserFinance {
    id?: string;
    user_id?: string;
    savings_goal: number;
    food: number;
    entertainment: number;
    clothing: number;
    daily_goods: number;
    other: number;
}

export interface  IDateStatus {
    year: number;
    month: number;
    isThisMonth: boolean;
}
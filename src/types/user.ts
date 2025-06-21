export interface UserProfile {
    id: string;
    email: string;
    username: string | null;
    target_month_savings?: number;
    notifications?: boolean;
    created_at?: string;
    updated_at?: string;
    group_id?: string | null;
}

export interface UserNotificationSettings {
    id: string;
    todo: boolean;
    system: boolean;
    event: boolean;
    created_at?: string;
}

export interface UserFinance {
    savings_goal: number;
    food: number;
    entertainment: number;
    clothing: number;
    daily_goods: number;
    other: number;
}

export interface FixedCost {
    id: string;
    created_by?: string;
    title: string;
    cost: number;
    tag: string;
    debit_date: number;
    created_at?: string;
}

export interface UserTransaction {
    id: string;
    created_by: string;
    title: string;
    description: string;
    amount: number;
    tag: string;
    is_income: boolean;
    date: string;
    created_at: string;
}
export interface UserGroup {
    id: string;
    group_name: string;
    description?: string;
    author_user_id: string;
    invited_user_id?: string;
    created_at?: string;
}
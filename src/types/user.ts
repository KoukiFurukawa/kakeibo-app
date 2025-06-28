export interface IUserProfile {
    id: string;
    email: string;
    username: string | null;
    created_at?: string;
    updated_at?: string;
    group_id?: string | null;
    salary_day?: number;
}

export interface IUserNotificationSettings {
    id: string;
    todo: boolean;
    system: boolean;
    event: boolean;
    created_at?: string;
}

export interface IUserFinance {
    savings_goal: number;
    food: number;
    entertainment: number;
    clothing: number;
    daily_goods: number;
    other: number;
}

export interface IFixedCost {
    id: string;
    created_by?: string;
    title: string;
    cost: number;
    tag: string;
    debit_date: number;
    created_at?: string;
}

export interface IUserTransaction {
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
export interface IUserGroup {
    id: string;
    group_name: string;
    description?: string;
    author_user_id: string;
    invited_user_id?: string;
    created_at?: string;
}

export interface IGroupMember {
    id: string;
    username: string | null;
    email: string;
    created_at: string;
    isAdmin: boolean;
}

export interface IGroupInvite {
    id: string;
    group_id: string;
    code: string;
    created_by: string;
    created_at: string;
    expires_at: string;
    used_by?: string | null;
    used_at?: string | null;
}
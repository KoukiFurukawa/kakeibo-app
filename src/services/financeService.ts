import { supabase } from '@/utils/manage_supabase';
import { IUserFinance, IFixedCost, IUserTransaction } from '@/types/user';
import { retryWithBackoff } from '@/utils/retryWithBackoff';

export class FinanceService {
    static async fetchUserFinance(userId: string): Promise<IUserFinance | null> {
        return retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('finance')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        });
    }

    static async updateUserFinance(userId: string, updates: Partial<IUserFinance>): Promise<IUserFinance | null> {
        return retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('finance')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        });
    }

    static async fetchFixedCosts(userId: string): Promise<IFixedCost[]> {
        const result = await retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('fixed_costs')
                .select('*')
                .eq('created_by', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        });

        return result || [];
    }

    static async addFixedCost(userId: string, fixedCostData: Omit<IFixedCost, 'id' | 'created_by' | 'created_at'>): Promise<IFixedCost | null> {
        return retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('fixed_costs')
                .insert({
                    created_by: userId,
                    ...fixedCostData
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        });
    }

    static async updateFixedCost(userId: string, id: string, fixedCostData: Partial<IFixedCost>): Promise<boolean> {
        const result = await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('fixed_costs')
                .update(fixedCostData)
                .eq('id', id)
                .eq('created_by', userId);

            if (error) throw error;
            return true;
        });

        return result || false;
    }

    static async deleteFixedCost(userId: string, id: string): Promise<boolean> {
        const result = await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('fixed_costs')
                .delete()
                .eq('id', id)
                .eq('created_by', userId);

            if (error) throw error;
            return true;
        });

        return result || false;
    }

    static async fetchTransactions(userId: string, year?: number, month?: number, salary_day: number = 1): Promise<IUserTransaction[]> {
        const result = await retryWithBackoff(async () => {
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('created_by', userId);

            if (year && month) {
                const startDate = new Date(year, month - 1, salary_day + 1).toISOString().split('T')[0];
                const endDate = new Date(year, month, salary_day).toISOString().split('T')[0];

                console.log(startDate, endDate);
                
                try {
                    query = query
                        .gte('date', startDate)
                        .lte('date', endDate);
                }
                catch (error: unknown) {
                    const startDateTime = new Date(year, month - 1, salary_day).toISOString();
                    const endDateTime = new Date(year, month, salary_day - 1, 23, 59, 59).toISOString();
                    query = query
                        .gte('created_at', startDateTime)
                        .lte('created_at', endDateTime);
                    if (error instanceof Error) {
                        console.warn('日付フィールドの変換に失敗、created_atを使用:', error.message);
                    }
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        });

        return result || [];
    }

    static async addTransaction(userId: string, transactionData: Omit<IUserTransaction, 'id' | 'created_by' | 'created_at'>): Promise<IUserTransaction | null> {
        return retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    created_by: userId,
                    ...transactionData
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        });
    }

    static async updateTransaction(userId: string, id: string, transactionData: Partial<IUserTransaction>): Promise<boolean> {
        const result = await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('transactions')
                .update(transactionData)
                .eq('id', id)
                .eq('created_by', userId);

            if (error) throw error;
            return true;
        });

        return result || false;
    }

    static async deleteTransaction(userId: string, id: string): Promise<boolean> {
        const result = await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('created_by', userId);

            if (error) throw error;
            return true;
        });

        return result || false;
    }

    static getMonthlyStats(transactions: IUserTransaction[], year: number, month: number, salaryDay: number = 1) {
        // 給料日ベースでの期間計算
        let startDate, endDate;
        
        if (salaryDay === 1) {
            // 給料日が1日の場合は通常の月の初めから月末
            startDate = new Date(year, month - 1, 1, 0, 0, 0);
            endDate = new Date(year, month, 0, 23, 59, 59);
        } else {
            // 給料日ベースの期間
            // 開始: 当月の給料日
            const prevMonth = month === 1 ? 12 : month - 1;
            const prevYear = month === 1 ? year - 1 : year;
            startDate = new Date(prevYear, prevMonth - 1, salaryDay, 0, 0, 0);
            
            // 終了: 翌月の給料日前日
            endDate = new Date(year, month - 1, salaryDay - 1, 23, 59, 59);
            
            // 給料日が月末より大きい場合の調整
            if (salaryDay > new Date(year, month, 0).getDate()) {
                endDate = new Date(year, month, 0, 23, 59, 59);
            }
        }

        const monthlyTransactions = transactions.filter(transaction => {
            const dateToUse = transaction.date || transaction.created_at;
            const transactionDate = new Date(dateToUse);
            
            // 日付の比較で、同じ日付（時間差あり）もカバーするための調整
            const transactionDateOnly = new Date(
                transactionDate.getFullYear(),
                transactionDate.getMonth(),
                transactionDate.getDate(),
                0, 0, 0
            );
            const startDateOnly = new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate(),
                0, 0, 0
            );
            
            // 開始日を含み、終了日を含む範囲で比較
            return transactionDateOnly >= startDateOnly && transactionDate <= endDate;
        });

        const income = monthlyTransactions
            .filter(t => t.is_income)
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthlyTransactions
            .filter(t => !t.is_income)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income,
            expense,
            balance: income - expense
        };
    }
}

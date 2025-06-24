import { supabase } from '@/utils/manage_supabase';
import { UserFinance, FixedCost, UserTransaction } from '@/types/user';
import { retryWithBackoff } from '@/utils/retryWithBackoff';

export class FinanceService {
    static async fetchUserFinance(userId: string): Promise<UserFinance | null> {
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

    static async updateUserFinance(userId: string, updates: Partial<UserFinance>): Promise<UserFinance | null> {
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

    static async fetchFixedCosts(userId: string): Promise<FixedCost[]> {
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

    static async addFixedCost(userId: string, fixedCostData: Omit<FixedCost, 'id' | 'created_by' | 'created_at'>): Promise<FixedCost | null> {
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

    static async updateFixedCost(userId: string, id: string, fixedCostData: Partial<FixedCost>): Promise<boolean> {
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

    static async fetchTransactions(userId: string, year?: number, month?: number): Promise<UserTransaction[]> {
        const result = await retryWithBackoff(async () => {
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('created_by', userId);

            if (year && month) {
                const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
                const endDate = new Date(year, month, 0).toISOString().split('T')[0];
                
                try {
                    query = query
                        .gte('date', startDate)
                        .lte('date', endDate);
                } catch (error) {
                    const startDateTime = new Date(year, month - 1, 1).toISOString();
                    const endDateTime = new Date(year, month, 0, 23, 59, 59).toISOString();
                    query = query
                        .gte('created_at', startDateTime)
                        .lte('created_at', endDateTime);
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        });

        return result || [];
    }

    static async addTransaction(userId: string, transactionData: Omit<UserTransaction, 'id' | 'created_by' | 'created_at'>): Promise<UserTransaction | null> {
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

    static async updateTransaction(userId: string, id: string, transactionData: Partial<UserTransaction>): Promise<boolean> {
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

    static getMonthlyStats(transactions: UserTransaction[], year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const monthlyTransactions = transactions.filter(transaction => {
            const dateToUse = transaction.date || transaction.created_at;
            const transactionDate = new Date(dateToUse);
            return transactionDate >= startDate && transactionDate <= endDate;
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

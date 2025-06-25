'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserService } from '@/services/userService';
import { useUser } from '@/contexts/UserContext';
import toast from 'react-hot-toast';

export default function SalaryDaySettingsPage() {
    const router = useRouter();
    const { user, userProfile, refreshUserProfile } = useUser();
    const [salaryDay, setSalaryDay] = useState<number>(userProfile?.salary_day || 25);
    const [isLoading, setIsLoading] = useState(false);

    // Generate days for the dropdown (1-31)
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            await UserService.updateUserProfile(user.id, {
                salary_day: salaryDay,
            });
            
            await refreshUserProfile();
            toast.success('給料日を設定しました');
            router.push('/settings/finance');
        } catch (error) {
            console.error('Failed to update salary day:', error);
            toast.error('給料日の設定に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // Load user's current salary day
    useEffect(() => {
        if (userProfile?.salary_day) {
            setSalaryDay(userProfile.salary_day);
        }
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/settings/finance" className="p-2 hover:bg-gray-100 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">給料日設定</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="salary-day" className="block text-sm font-medium text-gray-700 mb-1">
                            給料日（毎月）
                        </label>
                        <div className="flex items-center space-x-2">
                            <select
                                id="salary-day"
                                value={salaryDay}
                                onChange={(e) => setSalaryDay(Number(e.target.value))}
                                className="block w-24 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                {daysInMonth.map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                            <span className="text-gray-700">日</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            ホーム画面の月次表示が給料日から次の給料日前日までの期間で表示されるようになります。
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? '保存中...' : '保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

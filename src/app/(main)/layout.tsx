import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUserServer } from "@/utils/auth-server";
import { UserProvider, useUser  } from "@/contexts/UserContext";
import { redirect } from 'next/navigation';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // サーバーサイドで認証チェック
    const user = await getCurrentUserServer();
    
    // 認証されていない場合はログインページにリダイレクト
    if (!user) {
        redirect('/login');
    }
    
    // 認証されている場合はメインレイアウトを表示
    return (
        <>
            <Navbar />
            <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 mb-20 md:mb-0">
                {children}
            </main>
            <Footer />
        </>
    );
}

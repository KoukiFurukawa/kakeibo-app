import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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

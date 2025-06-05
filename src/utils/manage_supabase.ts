import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';

export const supabase = createClient();

export const useHandleLogout = () => {
    const router = useRouter();
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };
    
    return handleLogout;
};
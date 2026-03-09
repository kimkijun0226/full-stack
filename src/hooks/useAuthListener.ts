import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores"
import { useEffect } from "react";

export default function useAuthListener() {
    const { setUser } = useAuthStore();

    useEffect(() => {
        const checkSession = async () => {
            const {data: { session }} = await supabase.auth.getSession();

            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || "",
                    role: session.user.role || "",
                })
            }

        }
        checkSession();

        // 실시간으로 세션 변경 감지
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || "",
                    role: session.user.role || "",
                })
            } else {
                setUser(null);
            }
        })

        return () => authListener?.subscription.unsubscribe();
    },[])
}

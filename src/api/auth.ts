import supabase from "@/lib/supabase";

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  nickname?: string;
  profile_image?: string | File | null;
  service_agreed: boolean;
  privacy_agreed: boolean;
  marketing_agreed: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

async function signInWithPassword(payload: SignInPayload): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });
  if (error) throw error;
  const { user } = data;
  if (!user) throw new Error("로그인에 실패했습니다.");
  return {
    id: user.id,
    email: (user.email ?? "") as string,
    role: (user.role ?? "") as string,
  };
}

async function signUp(payload: SignUpPayload): Promise<void> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
  });
  if (authError) throw authError;
  const { user } = authData;
  if (!user) throw new Error("회원 가입에 실패했습니다.");

  const { error: insertError } = await supabase.from("user").upsert(
    [
      {
        id: user.id,
        email: user.email ?? "",
        nickname: payload.nickname ?? "",
        profile_image: payload.profile_image ?? "",
        service_agreed: payload.service_agreed,
        privacy_agreed: payload.privacy_agreed,
        marketing_agreed: payload.marketing_agreed,
      },
    ],
    { onConflict: "id" },
  );

  if (insertError) throw insertError;
}

async function checkEmailDuplicate(email: string): Promise<boolean> {
  const { data, error } = await supabase.from("user").select("id").eq("email", email).maybeSingle();
  if (error) throw error;
  return data !== null;
}

async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: { access_type: "offline", prompt: "consent" },
      redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
    },
  });
  if (error) throw error;
}

async function supabaseGetSession(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const session = data.session;
  if (!session?.user) return null;

  const { error: upsertError } = await supabase.from("user").upsert(
    [
      {
        id: session.user.id,
        email: session.user.email ?? "",
        service_agreed: true,
        privacy_agreed: true,
        marketing_agreed: false,
      },
    ],
    { onConflict: "id" },
  );

  if (upsertError) throw upsertError;

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    role: (session.user as { role?: string }).role ?? "",
  };
}

export const authApi = {
  signInWithPassword,
  signUp,
  signInWithGoogle,
  supabaseGetSession,
  checkEmailDuplicate,
};

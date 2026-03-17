import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider.tsx";

import RootLayout from "./layout.tsx"; // 전역 레이아웃
import App from "./pages"; // 앱 컴포넌트
import SignIn from "./pages/sign-in"; // 로그인 페이지
import SignUp from "./pages/sign-up"; // 회원가입 페이지
import AuthCallback from "./pages/auth/callback.tsx"; // OAuth 콜백 페이지
import CreateTopic from "./pages/topics/[topic_id]/create.tsx"; // 토픽 작성 페이지
import UpdateTopic from "./pages/topics/[topic_id]/update.tsx";
import { TopicDetail } from "./pages/topics/[topic_id]/detail.tsx";
import DmPage from "./pages/dm/index.tsx";
import { queryClient } from "./lib/queryClient";
import "./index.css";
import { Toaster } from "./components/ui";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<App />} />
              <Route path="sign-in" element={<SignIn />} />
              <Route path="sign-up" element={<SignUp />} />
              <Route path="auth/callback" element={<AuthCallback />} />
              <Route path="topics/:id/create" element={<CreateTopic />} />
              <Route path="topics/:id/update" element={<UpdateTopic />} />
              <Route path="topics/:id/detail" element={<TopicDetail />} />
              <Route path="dm" element={<DmPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);

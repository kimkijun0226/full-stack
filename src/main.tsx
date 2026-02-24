import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider.tsx";

import RootLayout from "./layout.tsx"; // 전역 레이아웃
import App from "./pages"; // 앱 컴포넌트
import SignIn from "./pages/sign-in"; // 로그인 페이지
import SignUp from "./pages/sign-up"; // 회원가입 페이지
import CreateTopic from "./pages/topics/create.tsx"; // 토픽 작성 페이지
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<App />} />
            <Route path="sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="topics/create" element={<CreateTopic />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);

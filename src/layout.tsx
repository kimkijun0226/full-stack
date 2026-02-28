import { Outlet } from "react-router-dom";
import { AuthSync } from "./components/auth-sync";
import { AppFooter, AppHeader } from "./components/common";

export default function RootLayout() {
  return (
    <div className="page">
      <AuthSync />
      <AppHeader />
      <div className="container">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  );
}

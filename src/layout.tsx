import { Outlet } from "react-router-dom";
import { AppFooter, AppHeader } from "./components/common";

export default function RootLayout() {
  return (
    <div className="page">
      <AppHeader />
      <div className="container">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  );
}

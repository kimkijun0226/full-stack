import { Outlet } from "react-router-dom";
import { AppFooter, AppHeader } from "./components/common";
import useAuthListener from "./hooks/useAuthListener";

export default function RootLayout() {
  useAuthListener();
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

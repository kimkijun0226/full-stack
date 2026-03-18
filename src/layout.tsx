import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/common";
import useAuthListener from "./hooks/useAuthListener";

export default function RootLayout() {
  useAuthListener();
  return (
    <div className="page">
      <AppHeader />
      <div className="app-layout">
        <Outlet />
      </div>
      {/* <AppFooter /> */}
    </div>
  );
}

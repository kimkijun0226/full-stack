import { Separator } from "../ui";

function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 w-full flex items-center justify-center bg-[#121212]">
      <div className="w-full max-w-[1328px] h-full flex items-center justify-between px-6 py-3">
        {/* 로고 & 네비게이션 UI */}
        <div className="flex items-center gap-5">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=80&h=80&fit=crop"
            alt="@logo"
            className="w-6 h-6 cursor-pointer"
          />
          <div className="flex items-center gap-5">
            <div className="font-semibold">토픽 인사이트</div>
            <Separator orientation="vertical" className="!h-4" />
            <div className="font-semibold">포트폴리오</div>
          </div>
        </div>
        {/* 로그인 UI */}
        <div className="font-semibold text-muted-foreground hover:text-white transition-all duration-500">로그인</div>
      </div>
    </header>
  );
}

export { AppHeader };

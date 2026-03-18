import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CLASS_CATEGORY } from "@/constants/category.constant";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  variant?: "mobile";
}

function AppSidebar({ variant }: AppSidebarProps) {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");
  const currentCategory = searchParams.get("category") ?? "";
  const isCommunityView = view === "community";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    if (variant !== "mobile") return;
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [variant]); // eslint-disable-line react-hooks/exhaustive-deps

  const makeSearch = (category: string) => {
    const params = new URLSearchParams();
    if (isCommunityView) params.set("view", "community");
    if (category) params.set("category", category);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  // 모바일 - 가로 스크롤 필 바
  if (variant === "mobile") {
    return (
      <div className="relative flex items-center">
        {canScrollLeft && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollRef.current?.scrollBy({ left: -160, behavior: "smooth" })}
            className="absolute left-1 z-10 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-white dark:bg-background shadow-sm text-primary hover:bg-primary/10 transition"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingLeft: canScrollLeft ? "36px" : "8px",
            paddingRight: canScrollRight ? "36px" : "8px",
            paddingTop: "8px",
            paddingBottom: "8px",
            transition: "padding 0.15s",
          }}
        >
          {CLASS_CATEGORY.map((menu) => {
            const isActive = currentCategory === menu.category;
            return (
              <Link
                key={menu.id}
                to={{ pathname: "/", search: makeSearch(menu.category) }}
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[12px] font-medium transition",
                  isActive
                    ? "border-primary/80 bg-primary text-primary-foreground"
                    : "border-border bg-white dark:bg-foreground/5 text-foreground/60 hover:border-primary/30 hover:bg-primary/8 hover:text-primary",
                )}
              >
                {menu.label}
              </Link>
            );
          })}
        </div>
        {canScrollRight && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollRef.current?.scrollBy({ left: 160, behavior: "smooth" })}
            className="absolute right-1 z-10 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-white dark:bg-background shadow-sm text-primary hover:bg-primary/10 transition"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  // 데스크탑 - 세로 리스트
  return (
    <div className="w-full flex flex-col gap-0.5">
      <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase">카테고리</p>
      {CLASS_CATEGORY.map((menu) => {
        const isActive = currentCategory === menu.category;
        const to = { pathname: "/", search: makeSearch(menu.category) };

        return (
          <Link
            key={menu.id}
            to={to}
            className={cn(
              "flex items-center px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-150",
              isActive
                ? "bg-primary/15 text-primary font-semibold"
                : "text-foreground/65 hover:bg-foreground/6 hover:text-foreground",
            )}
          >
            <span className="truncate">{menu.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export { AppSidebar };

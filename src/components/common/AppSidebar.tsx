import { CLASS_CATEGORY } from "@/constants/category.constant";
import { Link, useSearchParams } from "react-router-dom";

function AppSidebar() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");
  const currentCategory = searchParams.get("category") ?? "";
  const isCommunityView = view === "community";

  const makeSearch = (category: string) => {
    const params = new URLSearchParams();
    if (isCommunityView) params.set("view", "community");
    if (category) params.set("category", category);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  return (
    <div className="w-full flex flex-col gap-1">
      <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase">카테고리</p>
      {CLASS_CATEGORY.map((menu) => {
        const isActive = currentCategory === menu.category;
        const to = { pathname: "/", search: makeSearch(menu.category) };

        return (
          <Link
            key={menu.id}
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors duration-150 [&>svg]:size-[18px] [&>svg]:shrink-0 ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground/70 hover:bg-foreground/6 hover:text-foreground"
            }`}
          >
            {menu.icon}
            <span className="truncate">{menu.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export { AppSidebar };

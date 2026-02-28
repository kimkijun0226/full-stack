import { CLASS_CATEGORY } from "@/constants/category.constant";
import { ChevronDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../ui";

function AppSidebar() {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "";

  return (
    <aside className="min-w-60 w-60 flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">카테고리</h4>
        <ChevronDown className="mt-1" />
      </div>
      <div className="w-full flex flex-col gap-2">
        {CLASS_CATEGORY.map((menu) => {
          const isActive = currentCategory === menu.category;
          const to = menu.category ? { pathname: "/", search: `category=${menu.category}` } : { pathname: "/" };

          return (
            <Button
              variant="ghost"
              className={`justify-start text-muted-foreground hover:text-white hover:pl-6 transition-all duration-500 ${isActive ? "bg-muted text-white pl-6" : ""}`}
              key={menu.id}
              asChild
            >
              <Link to={to}>
                {menu.icon}
                {menu.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </aside>
  );
}

export { AppSidebar };

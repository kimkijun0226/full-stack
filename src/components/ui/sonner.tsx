import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "border border-slate-200/70 bg-white/70 text-slate-950 shadow-2xl shadow-black/10 backdrop-blur-xl supports-backdrop-filter:bg-white/75 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-black/40",
          title: "text-sm font-semibold",
          description: "text-xs text-slate-600 dark:text-slate-400",
          actionButton:
            "bg-slate-700 text-white hover:bg-slate-600 shadow-sm dark:bg-slate-600 dark:hover:bg-slate-500",
          cancelButton:
            "bg-white/60 text-slate-900 hover:bg-white/80 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15",
          closeButton: "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronRight,
  ArrowUpDown,
  Tag,
  ListChecks,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/sidebar-context";

const NAV_ITEMS = [
  { href: "/", label: "Active Sprint", icon: LayoutDashboard },
  { href: "/backlogs", label: "Backlogs", icon: KanbanSquare },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    children: [
      { href: "/settings/priorities", label: "Priorities", icon: ArrowUpDown },
      { href: "/settings/labels", label: "Labels", icon: Tag },
      {
        href: "/settings/work-item-types",
        label: "Work item types",
        icon: ListChecks,
      },
    ],
  },
];

type NavChild = { href: string; label: string; icon: React.ElementType };
type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavChild[];
};

function NavExpandableItem({
  item,
  collapsed,
  isChildActive,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  isChildActive: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const Icon = item.icon;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={collapsed ? item.label : undefined}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isChildActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon className="size-4.5 shrink-0" />
        <span className={cn("flex-1 text-left", collapsed && "hidden")}>
          {item.label}
        </span>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-90",
            collapsed && "hidden",
          )}
        />
      </button>

      {!collapsed && open && (
        <ul className="mt-1 flex flex-col gap-1 pl-6">
          {item.children!.map((child) => {
            const ChildIcon = child.icon;
            const isActive = pathname.startsWith(child.href);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <ChildIcon className="size-4 shrink-0" />
                  <span>{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebar();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <span
          className={cn(
            "truncate text-sm font-semibold tracking-tight",
            collapsed && "hidden",
          )}
        >
          Vibed Lite Jira
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-md p-1.5 hover:bg-sidebar-accent lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children?.length;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  (!hasChildren && pathname.startsWith(item.href));
            const isChildActive =
              hasChildren &&
              item.children!.some((child) => pathname.startsWith(child.href));
            const Icon = item.icon;

            if (!hasChildren) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive &&
                        "bg-sidebar-accent text-sidebar-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className="size-4.5 shrink-0" />
                    <span className={cn(collapsed && "hidden")}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            }

            return (
              <NavExpandableItem
                key={item.href}
                item={item}
                collapsed={collapsed}
                isChildActive={isChildActive}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function AppSidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } =
    useSidebar();

  return (
    <>
      {/* Desktop / tablet: static, full-height, collapsible rail */}
      <aside
        className={cn(
          "relative hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 ease-in-out lg:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} />
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute top-3 -right-3 z-10 flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-3.5" />
          ) : (
            <PanelLeftClose className="size-3.5" />
          )}
        </button>
      </aside>

      {/* Mobile / tablet-portrait: off-canvas drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[80vw] transition-transform duration-200 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarContent collapsed={false} />
        </div>
      </div>
    </>
  );
}

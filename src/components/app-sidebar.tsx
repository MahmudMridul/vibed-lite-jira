"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/sidebar-context"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/boards", label: "Boards", icon: KanbanSquare },
  { href: "/issues", label: "Issues", icon: ListTodo },
  { href: "/settings", label: "Settings", icon: Settings },
]

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()
  const { setMobileOpen } = useSidebar()

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <span
          className={cn(
            "truncate text-sm font-semibold tracking-tight",
            collapsed && "hidden"
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
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            const Icon = item.icon
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
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="size-4.5 shrink-0" />
                  <span className={cn(collapsed && "hidden")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export function AppSidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } =
    useSidebar()

  return (
    <>
      {/* Desktop / tablet: static, full-height, collapsible rail */}
      <aside
        className={cn(
          "relative hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 ease-in-out lg:block",
          collapsed ? "w-16" : "w-64"
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
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[80vw] transition-transform duration-200 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent collapsed={false} />
        </div>
      </div>
    </>
  )
}

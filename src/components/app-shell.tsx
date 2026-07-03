"use client"

import { Menu } from "lucide-react"

import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { AppSidebar } from "@/components/app-sidebar"

function MobileTopBar() {
  const { setMobileOpen } = useSidebar()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 lg:hidden">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="rounded-md p-1.5 hover:bg-muted"
      >
        <Menu className="size-5" />
      </button>
      <span className="text-sm font-semibold tracking-tight">
        Vibed Lite Jira
      </span>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

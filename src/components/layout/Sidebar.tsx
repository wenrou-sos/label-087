"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Radio,
  Map,
  Activity,
  ClipboardList,
  Shield,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "指挥总览" },
  { href: "/incidents", icon: FileText, label: "警情管理" },
  { href: "/dispatch", icon: Radio, label: "智能调度" },
  { href: "/map", icon: Map, label: "地图指挥" },
  { href: "/monitor", icon: Activity, label: "实时监测" },
  { href: "/post-incident", icon: ClipboardList, label: "事后管理" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-16 flex-col bg-bg-secondary border-r border-border md:flex">
        <div className="flex flex-col items-center py-4 border-b border-border">
          <Shield className="h-7 w-7 text-accent-red" />
          <span className="mt-1 text-[8px] font-bold tracking-wider text-accent-red">
            FIRE COMMAND
          </span>
        </div>

        <nav className="flex-1 flex flex-col items-center gap-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-accent-blue/20 text-accent-blue border-l-2 border-accent-blue"
                    : "text-text-muted hover:bg-bg-hover hover:text-text-primary"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md bg-bg-tertiary px-2 py-1 text-xs text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center py-4 border-t border-border">
          <Link
            href="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-border bg-bg-secondary md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-1 ${
                isActive ? "text-accent-blue" : "text-text-muted"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

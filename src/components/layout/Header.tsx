"use client";

import { useEffect, useState } from "react";
import { Bell, User } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-bg-secondary px-4">
      <h1 className="text-base font-semibold text-text-primary">{title}</h1>

      <div className="hidden items-center gap-2 sm:flex">
        <span className="h-2 w-2 rounded-full bg-accent-green" />
        <span className="text-sm text-accent-green">系统运行正常</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-text-secondary">{time}</span>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary">
          <User className="h-4 w-4 text-text-secondary" />
        </div>
      </div>
    </header>
  );
}

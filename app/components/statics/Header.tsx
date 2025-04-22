"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ThemeSwitcher from "../ThemeSwitcher";
import AddForm from "../add form/AddForm";
import { useUserStore } from "@/app/context/useUserStore";
import Search from "./Search";

export default function Header() {
  const { setUser } = useUserStore(); // ✅ استخدام Zustand
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.replace("/login");
    }
    setLoading(false);
  }, [router, setUser]);

  if (loading || pathname === "/login") return null;

  const getTitle = () => {
    switch (pathname) {
      case "/":
        return "الصفحة الرئيسية";
      case "/list":
        return "قائمة الأجهزة";
      case "/profile":
        return "الملف الشخصي";
      case "/users":
        return "المستخدمين";
      case "/help":
        return "المساعدة";
      default:
        return "الصفحة الرئيسية";
    }
  };

  return (
    <header>
      <h1 className="title flex-1">{getTitle()}</h1>
      <AddForm />
      <Search />
      <ThemeSwitcher />
    </header>
  );
}

"use client";
import {
  Bolt,
  ClipboardList,
  House,
  Info,
  LogOut,
  User,
  Users,
} from "lucide-react";
import "./statics.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserStore } from "@/app/context/useUserStore";

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  const { user, setUser, logout } = useUserStore();

  // Cache Buster for Avatar
  const [cacheBuster, setCacheBuster] = useState("");

  useEffect(() => {
    setCacheBuster(`?t=${Date.now()}`); // يعمل فقط على العميل
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // ✅ تحديث Zustand
      } else {
        router.push("/login");
      }
    }
  }, [router, setUser]);

  if (!user || path === "/login") return null; // ✅ إخفاء القائمة عند عدم تسجيل الدخول

  const handleLogout = () => {
    localStorage.removeItem("user");
    logout();
    router.replace("/login");
  };

  return (
    <>
      <nav className="hideable">
        <div className="avatar">
          <Image
            src={`${user.avatar}${cacheBuster}` || "/avatar.png"}
            alt="avatar"
            width={45}
            height={45}
          />
          <div className="info">
            <h1>{user.fullname}</h1>
            <p>{user.role}</p>
          </div>
        </div>

        <div className="links flex-1">
          <Link href="/" className={path === "/" ? "active" : ""}>
            <House />
            الصفحة الرئيسية
          </Link>

          <Link href="/list" className={path === "/list" ? "active" : ""}>
            <ClipboardList />
            قائمة الأجهزة
          </Link>

          <Link href="/spares" className={path === "/spares" ? "active" : ""}>
            <Bolt />
            الاسبيرات
          </Link>

          <Link href="/profile" className={path === "/profile" ? "active" : ""}>
            <User />
            الملف الشخصي
          </Link>

          {/* حماية من من لا يملك صلاحيات مدير نظام او مطور */}
          {(user.role === "مدير النظام" || user.role === "المطور") && (
            <Link href="/users" className={path === "/users" ? "active" : ""}>
              <Users />
              المستخدمين
            </Link>
          )}

          <Link href="/help" className={path === "/help" ? "active" : ""}>
            <Info />
            المساعدة
          </Link>
        </div>

        <button className="btn outline" onClick={handleLogout}>
          <LogOut />
          تسجيل الخروج
        </button>
      </nav>

      <div className="mobile-nav ">
        <Link href="/" className={path === "/" ? "active" : ""}>
          <House />
        </Link>

        <Link href="/list" className={path === "/list" ? "active" : ""}>
          <ClipboardList />
        </Link>

        <Link href="/spares" className={path === "/spares" ? "active" : ""}>
          <Bolt />
        </Link>

        <Link href="/profile" className={path === "/profile" ? "active" : ""}>
          <User />
        </Link>

        {/* حماية من من لا يملك صلاحيات مدير نظام او مطور */}
        {(user.role === "مدير النظام" || user.role === "المطور") && (
          <Link href="/users" className={path === "/users" ? "active" : ""}>
            <Users />
          </Link>
        )}

        {/* <Link href="/help" className={path === "/help" ? "active" : ""}>
          <Info />
        </Link> */}
      </div>
    </>
  );
}

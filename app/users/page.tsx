"use client";
import { CodeXml, ShieldUser, UserCog, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AddNewUser, getAllUsers } from "../actions";
import { UserType, useUserStore } from "../context/useUserStore";
import "./users.css";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Users() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [status, setStatus] = useState<string>("جارٍ تحميل المستخدمين...");
  const [isLoading, setIsLoading] = useState(false);

  // التحقق من الصلاحيات للوصول للصفحة
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const allowedRoles = ["مدير النظام", "المطور"];

    if (user && !allowedRoles.includes(user.role)) {
      router.push("/");
      alert("ليس لديك صلاحيات للوصول لهذه الصفحة");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data || []);

        if (!data || data.length === 0) {
          setStatus("لم يتم العثور على مستخدمين مسجلين");
        } else {
          setStatus("");
        }
      } catch (err) {
        setStatus("فشل في تحميل المستخدمين");
        const errorMessage =
          err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        toast.error(errorMessage);
        console.error("Failed to fetch users:", errorMessage);
      }
    };

    fetchUsers();
  }, []);

  const getStyles = (user: UserType) => {
    switch (user.role) {
      case "المطور":
        return {
          icon: <CodeXml aria-hidden="true" />,
          color: "#3b82f6",
          className: "dev",
        };
      case "مدير النظام":
        return {
          icon: <ShieldUser aria-hidden="true" />,
          color: "#f59e0b",
          className: "man",
        };
      case "مشرف":
        return {
          icon: <UserCog aria-hidden="true" />,
          color: "#10b981",
          className: "adm",
        };
      default:
        return {
          icon: <UserCog aria-hidden="true" />,
          color: "#10b981",
          className: "adm",
        };
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("كملة السر غير متطابقة");
      return;
    }

    setIsLoading(true);

    try {
      const result = await toast.promise(AddNewUser(formData), {
        loading: "جارٍ اضافة المستخدم",
        success: (result) => {
          if (result?.success && result.user) {
            formRef.current?.reset();
            setUsers((prev) => [...prev, result.user]);
            return "تمت اضافة المستخدم بنجاح!";
          }
          throw new Error(result?.error || "فشلت اضافة المستخدم!");
        },
        error: (err) => err.message || "حدث خطأ أثناء اضافة المستخدم!",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      toast.error(errorMessage);
      console.error("Error adding user:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="users">
      <div className="user head">
        <div>البروفايل</div>
        <p>الاسم الكامل</p>
        <p>اسم المستخدم</p>
        <span>الدور</span>
      </div>

      {status && <div className="status">{status}</div>}

      {users.map((usr) => (
        <div className="user card" key={usr.username}>
          <div>
            <img
              src={usr.avatar || "/avtr.png"}
              alt={`صورة ${usr.username}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avtr.png";
              }}
            />
          </div>
          <b>{usr.fullname}</b>
          <p>@{usr.username}</p>
          <span className={getStyles(usr).className}>
            <div className="badge">
              {getStyles(usr).icon} {usr.role}
            </div>
          </span>
        </div>
      ))}

      <div className="addUserForm">
        <h1>اضافة مستخدم جديد</h1>
        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="half">
            <label htmlFor="fullname" className="required">
              الاسم الكامل
            </label>
            <input
              id="fullname"
              type="text"
              name="fullname"
              required
              placeholder="ادخل الاسم الكامل للمستخدم"
              minLength={3}
            />
          </div>

          <div className="half">
            <label htmlFor="username" className="required">
              اسم المستخدم
            </label>
            <input
              id="username"
              type="text"
              name="username"
              required
              placeholder="ادخل اسم المستخدم (لتسجيل الدخول)"
              minLength={3}
            />
          </div>

          <div className="half">
            <label htmlFor="password" className="required">
              كلمة السر
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              placeholder="ادخل كلمة سر قوية"
              minLength={6}
            />
          </div>

          <div className="half">
            <label htmlFor="confirmPassword" className="required">
              تاكيد كلمة السر
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              required
              placeholder="اعد ادخال كلمة السر"
              minLength={6}
            />
          </div>

          <div className="half">
            <label htmlFor="role">الدور</label>
            <select name="role" id="role" required>
              <option value="">اختر دور المستخدم</option>
              <option value="مشرف">مشرف</option>
              <option value="مدير النظام">مدير النظام</option>
            </select>
          </div>

          <button
            className="btn primary mt-2"
            disabled={isLoading}
            aria-label="إضافة مستخدم جديد"
          >
            <UserPlus aria-hidden="true" />
            {isLoading ? "جاري الإضافة..." : "اضافة المستخدم"}
          </button>
        </form>
      </div>
    </div>
  );
}

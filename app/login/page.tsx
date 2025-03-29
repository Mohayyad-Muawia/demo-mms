"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { server_login } from "../actions";
import toast from "react-hot-toast";
import "./login.css";
import { UserType, useUserStore } from "../context/useUserStore";

type LoginState = {
  success?: boolean;
  error?: string;
  user?: UserType;
};

export default function Login() {
  const [state, setState] = useState<LoginState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
      router.push("/");
    } else if (state?.error) {
    }
  }, [state, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    toast
      .promise(server_login(formData), {
        loading: "جاري تسجيل الدخول",
        success: (result) => {
          if (result.success && result.user) {
            useUserStore.getState().setUser(result.user as UserType);
            localStorage.setItem("user", JSON.stringify(result.user));
            router.push("/");
            return "تم تسجيل الدخول بنجاح!";
          }
          throw new Error(result.error || "فشل تسجيل الدخول!");
        },
        error: (err) => err.message || "حدث خطأ أثناء تسجيل الدخول!",
      })
      .catch((error) => {
        toast.error(error.message);
      });

    setIsLoading(false);
  };

  return (
    <div className="login">
      <div className="card">
        <h1>تسجيل الدخول</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>اسم المستخدم</label>
            <input
              type="text"
              name="username"
              placeholder="ادخل اسم المستخدم"
              required
            />
          </div>
          <div>
            <label>كلمة المرور</label>
            <input
              type="password"
              name="password"
              placeholder="ادخل كلمة المرور"
              required
            />
          </div>
          <button type="submit" className="btn primary" disabled={isLoading}>
            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}

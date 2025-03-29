"use client";
import "./profile.css";
import { Camera, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUserStore } from "../context/useUserStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { server_editProfile } from "../actions";

type Avatar = {
  file: File | null;
  url: string;
};

export default function Profile() {
  // Cache Buster for Avatar
  const [cacheBuster, setCacheBuster] = useState("");

  useEffect(() => {
    setCacheBuster(`?t=${Date.now()}`); // يعمل فقط على العميل
  }, []);

  const unKnown = "غير معروف";
  const { user, setUser, logout } = useUserStore();
  const [fullname, setFullname] = useState<string>(user?.fullname || unKnown);
  const [username, setUsername] = useState<string>(user?.username || unKnown);
  const [avatar, setAvatar] = useState<Avatar>({
    file: null,
    url: user?.avatar || "",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setFullname(user?.fullname || unKnown);
    setUsername(user?.username || unKnown);
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        router.push("/login");
      }
    }
  }, [router, setUser]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setAvatar({ file, url: newUrl });
      setCacheBuster(`?t=${Date.now()}`); // تحديث الصورة
    }
  };

  const handleClick = () => {
    if (editMode) {
      fileInputRef.current?.click();
    }
  };

  const toggleEdit = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setAvatar({ file: null, url: user?.avatar + cacheBuster || "" });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("fullname", fullname);
      formData.append("avatar", avatar.file || "");

      toast.promise(server_editProfile(formData), {
        loading: "جاري حفظ التعديلات",
        success: (result) => {
          if (result.success) {
            setUser(result.user);
            setAvatar({ file: null, url: result.user.avatar });
            localStorage.setItem("user", JSON.stringify(result.user));
            setCacheBuster(`?t=${Date.now()}`); // تحديث `cacheBuster` بعد حفظ التعديلات
            toggleEdit();
            return "تم حفظ التعديلات بنجاح!";
          }
          throw new Error(result.error || "فشل حفظ التعديلات!");
        },
        error: (err) => err.message || "حدث خطأ أثناء حفظ التعديلات!",
      });
    } catch (error) {
      console.error("خطأ غير متوقع:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    logout();
    setUser(null);
    router.replace("/login");
  };

  return (
    <div className="profile">
      {editMode ? (
        <form className="card edit" onSubmit={handleSave}>
          <div className="avatar">
            <img
              src={user?.avatar ? avatar.url : `${user?.avatar}${cacheBuster}`}
              alt="avatar"
            />
            <input
              type="file"
              name="avatar"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatar}
              style={{ display: "none" }}
            />
            <label htmlFor="file">
              <button
                className="btn primary"
                type="button"
                onClick={handleClick}
              >
                <Camera />
              </button>
            </label>
          </div>
          <div className="info">
            <div>
              <h1>الاسم:</h1>
              <input
                type="text"
                name="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
            <div>
              <h1>اسم المستخدم:</h1>
              <p>@{user?.username}</p>
            </div>
            <div>
              <h1>الدور:</h1>
              <p>{user?.role}</p>
            </div>
            <div className="btns">
              <button type="submit" className="btn primary">
                حفظ التعديلات
              </button>
              <button className="btn outline" onClick={toggleEdit}>
                إلغاء
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="card show">
          <div className="avatar">
            <img
              src={`${user?.avatar}${cacheBuster}` || "/avtr.png"}
              alt="avatar"
            />
          </div>
          <div className="info">
            <div>
              <h1>الاسم:</h1>
              <p>{fullname}</p>
            </div>
            <div>
              <h1>اسم المستخدم:</h1>
              <p>@{username}</p>
            </div>
            <div>
              <h1>الدور:</h1>
              <p>{user?.role}</p>
            </div>
            <div className="btns">
              <button className="btn primary" onClick={toggleEdit}>
                تعديل الملف الشخصي
              </button>
              <button className="btn outline" onClick={handleLogout}>
                تسجيل الخروج <LogOut />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

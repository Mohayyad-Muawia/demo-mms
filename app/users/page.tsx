"use client";
import { CodeXml, ShieldUser, UserCog, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllUsers } from "../actions";
import { UserType } from "../context/useUserStore";
import "./users.css";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState<UserType[] | undefined>(undefined);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
          console.error(err.message);
        }
      }
    };

    fetchUsers();
  }, []);

  const getStyles = (user: UserType) => {
    switch (user.role) {
      case "المطور":
        return { icon: <CodeXml />, color: "#3b82f6", className: "dev" };
      case "مدير النظام":
        return { icon: <ShieldUser />, color: "#f59e0b", className: "man" };
      case "مشرف":
        return { icon: <UserCog />, color: "#10b981", className: "adm" };
      default:
        return { icon: <UserCog />, color: "#10b981", className: "adm" };
    }
  };

  if (users && users.length === 0) {
    return <div>No users found</div>;
  }
  return (
    <div className="users">
      <div className="user head">
        <div>البروفايل</div>
        <p>الاسم الكامل</p>
        <p>اسم المستخدم</p>
        <span>الدور</span>
      </div>
      {users?.map((usr) => (
        <div className="user card" key={usr.username}>
          <div>
            <img src={usr.avatar || "/avtr.png"} alt={usr.username} />
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

      <button className="primary btn mt-2">
        <UserPlus />
        اضافة مستخدم جديد
      </button>
    </div>
  );
}

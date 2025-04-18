"use client";

import { searchDevices } from "@/app/actions";
import { Device } from "@/app/context/useDevicesStore";
import { SearchIcon } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import EditForm from "../add form/EditForm";

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searchType, setSearchType] = useState<"name" | "organization">("name"); // ✅ نوع البحث

  // 🔹 البحث باستخدام Server Actions
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredDevices([]);
      return;
    }

    startTransition(async () => {
      const result = await searchDevices(query, searchType); // ✅ تمرير نوع البحث

      if (result.error) {
        toast.error(result.error);
      } else {
        setFilteredDevices(result.devices);
      }
    });
  };

  return (
    <div className="search">
      {/* 🔹 زر فتح البحث */}
      <button
        className="btn secondary open-btn"
        type="button"
        aria-label="بحث"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon />
      </button>

      {/* 🔸 إغلاق البحث عند النقر خارج المربع */}
      <div
        className={`overlay ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* 🔹 مربع البحث */}
      <div className={`search-container ${isOpen ? "show" : ""}`}>
        <div className="top">
          {/* ✅ اختيار نوع البحث */}
          <select
            value={searchType}
            onChange={(e) =>
              setSearchType(e.target.value as "name" | "organization")
            }
            className="type-selector"
          >
            <option value="name"> الاسم</option>
            <option value="organization">المؤسسة</option>
          </select>

          <form className="search-box" onSubmit={(e) => e.preventDefault()}>
            {/* ✅ إدخال نص البحث */}
            <input
              type="text"
              placeholder="ابحث هنا..."
              required
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
            <button className="icon" type="submit">
              <SearchIcon />
            </button>
          </form>
        </div>

        <div className="head">
          <p>اسم الجهاز</p>
          <p>المؤسسة</p>
          <span>تفاصيل</span>
        </div>

        {/* 🔹 عرض النتائج */}
        <div className="result">
          {isPending ? (
            <p className="loading">جاري البحث...</p>
          ) : filteredDevices.length > 0 ? (
            filteredDevices.map((device) => (
              <div key={device.id} className="result-item">
                <h4>{device.name} </h4>
                <p>{device.organization}</p>
                <EditForm device={device} />
              </div>
            ))
          ) : searchQuery ? (
            <p className="no-results">لا توجد نتائج</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

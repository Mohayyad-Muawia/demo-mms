"use client";

import { useEffect, useState } from "react";
import Switch from "./Switch";
import { Device } from "../context/useDevicesStore";
import { server_getAvailableMonths, server_getDevicesInDate } from "../actions";
import toast from "react-hot-toast";
import "./list.css";

export default function List() {
  const [months, setMonths] = useState<{ month: number; year: number }[]>([]);
  const [devices, setDevices] = useState<Device[] | null>([]);
  const [selectedMonth, setSelectedMonth] = useState<{
    month: number;
    year: number;
  } | null>(null);

  // تخزين الأجهزة المحملة في الذاكرة
  const [devicesCache, setDevicesCache] = useState<Map<string, Device[]>>(
    new Map()
  );

  useEffect(() => {
    const fetchMonths = async () => {
      const toastId = toast.loading("جارِ تحميل الأشهر");
      const { months, error } = await server_getAvailableMonths();

      if (error) {
        toast.error("حدث خطأ أثناء جلب الأشهر المتاحة.", { id: toastId });
      } else {
        setMonths(months);
        toast.success("تم تحميل الأشهر بنجاح!", { id: toastId });
      }
    };

    fetchMonths();
  }, []);

  const fetchDevicesForMonth = async (month: number, year: number) => {
    const monthYearKey = `${month}-${year}`;

    // التحقق من وجود البيانات في الكاش
    if (devicesCache.has(monthYearKey)) {
      // استخدام الأجهزة المخزنة في الكاش
      setDevices(devicesCache.get(monthYearKey) || []);
      setSelectedMonth({ month, year });
      return;
    }

    // إذا لم تكن البيانات موجودة في الكاش، نقوم بتحميلها من الـ Supabase
    setSelectedMonth({ month, year });
    const toastId = toast.loading("جارِ تحميل الأجهزة");

    const { devices, error } = await server_getDevicesInDate(month, year);
    if (error) {
      toast.error("حدث خطأ أثناء جلب الأجهزة.", { id: toastId });
    } else {
      // تخزين الأجهزة في الكاش
      setDevices(devices);
      setDevicesCache((prevCache) =>
        new Map(prevCache).set(monthYearKey, devices ? devices : [])
      );
      toast.success("تم تحميل الأجهزة بنجاح!", { id: toastId });
    }
  };

  return (
    <div className="list">
      <div className="months-container">
        {months.map(({ month, year }) => (
          <button
            key={`${year}-${month}`}
            onClick={() => fetchDevicesForMonth(month, year)}
            className={
              selectedMonth?.month === month && selectedMonth?.year === year
                ? "selected"
                : ""
            }
          >
            {new Intl.DateTimeFormat("ar", {
              month: "long",
              year: "numeric",
            }).format(new Date(year, month - 1))}
          </button>
        ))}
      </div>

      <Switch all_devices={devices} />
    </div>
  );
}

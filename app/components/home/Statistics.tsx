"use client";
import { useDevicesStore } from "@/app/context/useDevicesStore";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  CalendarDays,
  CheckCheck,
  PackageCheck,
  Printer,
  Wrench,
} from "lucide-react";

// Define the type for StatBox props
interface StatBoxProps {
  label: string;
  value: number | "--";
  color: string;
  svg: React.ReactNode;
}

export default function Statistics() {
  const today = new Date();
  const dayName = format(today, "EEEE", { locale: arSA });
  const hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  //   get statistics
  const { devices } = useDevicesStore();

  const statistics = {
    all_devices: devices?.length,
    received: devices?.filter((d) => d.status === "مستلمة").length,
    ready: devices?.filter((d) => d.status === "جاهزة للاستلام").length,
    repairing: devices?.filter((d) => d.status === "تحت الصيانة").length,
  };

  return (
    <div className="statistics">
      <div className="info">
        <h2>التقويم</h2>
        <div className="date">
          <h1>{dayName}</h1>
          <p>{format(new Date(), "yyyy/MM/dd")}</p>
          <p>{hijriDate}</p>
        </div>
        <CalendarDays />
      </div>
      <div className="numbers">
        <StatBox
          label="الاجهزة المستلمة"
          value={statistics.received || "--"}
          color="#52b788"
          svg={<CheckCheck />}
        />
        <StatBox
          label="الاجهزة الجاهزة"
          value={statistics.ready || "--"}
          color="#f2cb05"
          svg={<PackageCheck />}
        />
        <StatBox
          label="الاجهزة تحت الصيانة"
          value={statistics.repairing || "--"}
          color="#e63946"
          svg={<Wrench />}
        />
        <StatBox
          label="إجمالي الأجهزة"
          value={statistics.all_devices || "--"}
          color="#4e89ae"
          svg={<Printer />}
        />
      </div>
    </div>
  );
}

// Reusable StatBox Component with TypeScript
function StatBox({ label, value, color, svg }: StatBoxProps) {
  return (
    <div className="stat-box" style={{ "--c": color } as React.CSSProperties}>
      <div className="text">
        <span className="label">
          {svg}
          <p>{label}</p>
        </span>
        <span className="value">{value}</span>
      </div>
    </div>
  );
}

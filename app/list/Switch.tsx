"use client";
import React, { useState, useEffect } from "react";
import { CheckCheck, PackageCheck, Printer, Wrench } from "lucide-react";
import { Device } from "../context/useDevicesStore";
import Table from "../components/table/Table";
import { useSearchParams } from "next/navigation";

type SwitchProps = {
  all_devices: Device[] | null;
};

export default function Switch({ all_devices }: SwitchProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [filteredDevices, setFilteredDevices] = useState<Device[]>(
    all_devices || []
  );

  useEffect(() => {
    // تحقق من وجود معلمة tab في URL عند التحميل
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['all', 'maintenance', 'ready', 'received'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    filterDevices(activeTab);
  }, [all_devices, activeTab]);

  const filterDevices = (tab: string) => {
    if (!all_devices) {
      setFilteredDevices([]);
      return;
    }

    let devices = all_devices;

    if (tab !== "all") {
      devices = all_devices.filter((device) => {
        switch (tab) {
          case "maintenance":
            return device.status === "تحت الصيانة";
          case "ready":
            return device.status === "جاهزة للاستلام";
          case "received":
            return device.status === "مستلمة";
          default:
            return true;
        }
      });
    }

    setFilteredDevices(devices);
  };

  return (
    <div>
      <div className="switch card">
        <a
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          <Printer />
          <span>الجميع</span>
        </a>
        <a
          className={activeTab === "maintenance" ? "active" : ""}
          onClick={() => setActiveTab("maintenance")}
        >
          <Wrench />
          <span>تحت الصيانة</span>
        </a>
        <a
          className={activeTab === "ready" ? "active" : ""}
          onClick={() => setActiveTab("ready")}
        >
          <PackageCheck />
          <span>جاهزة</span>
        </a>
        <a
          className={activeTab === "received" ? "active" : ""}
          onClick={() => setActiveTab("received")}
        >
          <CheckCheck />
          <span>المستلمة</span>
        </a>
      </div>

      <Table devices={filteredDevices} title={null} />
    </div>
  );
}
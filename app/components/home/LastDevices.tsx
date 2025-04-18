"use client";
import toast from "react-hot-toast";
import { server_getDevices } from "../../actions";
import { Device, useDevicesStore } from "../../context/useDevicesStore";
import Table from "../table/Table";
import { useEffect } from "react";

export default function LastDevices() {
  const { devices, setDevices } = useDevicesStore();
  let lastDevices: Device[] = [];

  if (devices && devices.length > 0) {
    const sortedDevices = [...devices].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    lastDevices = sortedDevices.slice(0, 3);
  }

  useEffect(() => {
    const fetchDevices = async () => {
      const { devices: fetchedDevices, error } = await server_getDevices();
      if (error) {
        toast.error("خطأ اثناء جلب الاجهزة");
      }
      if (fetchedDevices) {
        setDevices(fetchedDevices);
      }
    };

    fetchDevices();
  }, [setDevices]);

  return (
    <div>
      <Table devices={lastDevices} title="آخر الاجهزة" />
    </div>
  );
}

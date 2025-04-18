import { create } from "zustand";

export type Device = {
  id?: number;
  created_at?: Date;
  name: string;
  organization: string;
  phone: string;
  status: "تحت الصيانة" | "جاهزة للاستلام" | "مستلمة";
  paymentStatus: "بنكك" | "كاش" | "فاتورة" | "لم يدفع";
  paymentProof: string;
  description: string;
  price: number;
};

type DevicesState = {
  devices: Device[] | null;
  setDevices: (devices: Device[] | null) => void;
  addDevice: (device: Device) => void; // ✅ تأكد من إضافة `addDevice` هنا
  updateDevice: (updatedDevice: Device) => void; // دالة لتحديث الجهاز
};

export const useDevicesStore = create<DevicesState>((set) => ({
  devices: null,
  setDevices: (devices) => set({ devices }),

  // ✅ تحديث `devices` عند إضافة جهاز جديد
  addDevice: (device) =>
    set((state) => ({
      devices: state.devices ? [...state.devices, device] : [device], // ← تجنب `null`
    })),

  // دالة لتحديث الجهاز
  updateDevice: (updatedDevice) =>
    set((state) => ({
      devices:
        state.devices?.map((device) =>
          device.id === updatedDevice.id ? updatedDevice : device
        ) || [], // التأكد من أنه إذا كانت `devices` null، سيتم إرجاع مصفوفة فارغة
    })),
}));

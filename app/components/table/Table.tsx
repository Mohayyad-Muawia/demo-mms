import {
  Banknote,
  CheckCheck,
  CircleX,
  PackageCheck,
  ReceiptText,
  Smartphone,
  Wrench,
} from "lucide-react";
import "./table.css";
import { Device } from "@/app/context/useDevicesStore";
import { format } from "date-fns";
import EditForm from "../add form/EditForm";

interface TableProps {
  devices: Device[] | null;
  title: string | null;
}

export default function Table({ devices, title }: TableProps) {
  // Helper function for device status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "تحت الصيانة":
        return { class: "maintenance", icon: <Wrench /> };
      case "جاهزة للاستلام":
        return { class: "ready", icon: <PackageCheck /> };
      case "مستلمة":
        return { class: "delivered", icon: <CheckCheck /> };
      default:
        return { class: "maintenance", icon: <Wrench /> };
    }
  };

  // Helper function for payment status
  const getPaymentStatusClass = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "بنكك":
        return { class: "bank", icon: <Smartphone /> };
      case "كاش":
        return { class: "cash", icon: <Banknote /> };
      case "فاتورة":
        return { class: "receipt", icon: <ReceiptText /> };
      case "لم يدفع":
        return { class: "unpaid", icon: <CircleX /> };

      default:
        return { class: "unpaid", icon: <CircleX /> };
    }
  };

  return (
    <div className="table-box card">
      {title && <h2>{title}</h2>}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>الجهاز</th>
            <th className="hideable">التاريخ</th>
            <th>المؤسسة</th>
            <th className="hideable">رقم الهاتف</th>
            <th>الحالة</th>
            <th className="hideable">نوع الدفع</th>
            <th>تعديل</th>
          </tr>
        </thead>
        <tbody>
          {devices && devices.length > 0 ? (
            devices.map((device, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{device.name}</td>
                <td className="hideable">
                  {device.created_at
                    ? format(device.created_at, "yyyy/MM/dd")
                    : "0/0/0000"}
                </td>
                <td>{device.organization}</td>
                <td className="hideable">{device.phone}</td>
                <td className={`badge ${getStatusClass(device.status).class}`}>
                  <p>
                    <span className="hideable">{device.status}</span>{" "}
                    {getStatusClass(device.status).icon}
                  </p>
                </td>
                <td
                  className={`badge hideable ${
                    getPaymentStatusClass(device.paymentStatus).class
                  }`}
                >
                  <p>
                    <span className="hideable">{device.paymentStatus}</span>{" "}
                    {getPaymentStatusClass(device.paymentStatus).icon}
                  </p>
                </td>
                <td>
                  <EditForm device={device} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="font-bold pt-5 text-xl">
                لا توجد أجهزة لعرضها حاليا
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

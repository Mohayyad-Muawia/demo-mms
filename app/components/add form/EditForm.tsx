"use client"; // Required in Next.js 15 if using state in components

import { MouseEvent, useRef, useState } from "react";
import "./addForm.css";
import { Eye, SquarePen, X } from "lucide-react";
import toast from "react-hot-toast";
import { server_updateDevice } from "@/app/actions"; // Assuming you have an update function
import { Device, useDevicesStore } from "@/app/context/useDevicesStore";

const EditForm = ({ device }: { device: Device }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showFileBtn, setShowFileBtn] = useState(
    device.paymentProof ? true : false
  );
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string | null>(
    device.paymentProof
  );
  const { updateDevice } = useDevicesStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setPaymentProof(reader.result as string); // حفظ الصورة كـ Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setShowFileBtn(selectedValue === "فاتورة" || selectedValue === "بنكك");

    // إذا قام المستخدم بتغيير الاختيار، امسح الصورة السابقة
    if (selectedValue !== "فاتورة" && selectedValue !== "بنكك") {
      setPaymentProof(null);
    }
  };

  const openImg = () => {
    if (paymentProof) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
<html>
<head>
<title>عرض المرفق</title>
</head>
<body style="margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000;">
<img src="${paymentProof}" alt="مرفق الدفع" style="max-width: 100%; max-height: 100%;"/>
</body>
</html>
`);
        newWindow.document.close();
      }
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    setPrice(value ? Number(value).toLocaleString() : ""); // إظهار فارغ عند عدم الإدخال
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const updatedDevice: Device = {
      id: device.id, // Assuming you have an `id` field
      name: (formData.get("name") as string) || device.name,
      organization:
        (formData.get("organization") as string) || device.organization,
      phone: (formData.get("phone") as string) || device.phone,
      status:
        (formData.get("status") as
          | "تحت الصيانة"
          | "جاهزة للاستلام"
          | "مستلمة") || device.status,
      paymentStatus:
        (formData.get("paymentStatus") as
          | "لم يدفع"
          | "كاش"
          | "بنكك"
          | "فاتورة") || device.paymentStatus,
      paymentProof: paymentProof || "",
      description:
        (formData.get("description") as string) || device.description,
      price:
        parseFloat(
          (formData.get("price") as string).replace(/,/g, "") || "0"
        ) || device.price, // Update price with formatted value
    };

    toast
      .promise(server_updateDevice(updatedDevice), {
        // Assuming this is the update function
        loading: "جارٍ تحديث الجهاز",
        success: (result) => {
          if (result && result.success && result.device) {
            updateDevice(result.device);
            setIsOpen(false);
            setLoading(false);

            // Reset form fields after successful update
            setPrice(result.device.price.toLocaleString());
            if (formRef.current) {
              formRef.current.reset(); // Reset form using reference
            }

            return "تم تحديث الجهاز بنجاح";
          }
          throw new Error(result?.error || "حدث خطأ اثناء تحديث الجهاز");
        },
        error: (err) => err.message || "حدث خطأ اثناء تحديث الجهاز",
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <div className="addForm">
      <button className="btn primary" onClick={() => setIsOpen(true)}>
        <SquarePen />
      </button>

      <div className={`overlay ${isOpen ? "show" : ""}`}></div>

      <div className={`popup ${isOpen ? "show" : ""}`}>
        <h2>تعديل بيانات الجهاز</h2>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="half">
            <label className="required">اسم الجهاز </label>
            <input
              type="text"
              name="name"
              required
              placeholder="مثال: HP LaserJet 2055 White"
              defaultValue={device.name}
            />
          </div>

          <div className="half">
            <label className="required">المؤسسة / الجهة</label>
            <input
              type="text"
              name="organization"
              required
              placeholder="مثال: كلية التربية - دنقلا"
              defaultValue={device.organization}
            />
          </div>

          <div className="half">
            <label className="required">رقم الهاتف</label>
            <input
              type="tel"
              name="phone"
              pattern="[0-9]{10}"
              inputMode="numeric"
              placeholder="مثال: 0912345678"
              dir="rtl"
              maxLength={10}
              required
              defaultValue={device.phone}
            />
          </div>

          <div className="half">
            <label>حالة الجهاز</label>
            <select name="status" defaultValue={device.status}>
              <option value="تحت الصيانة">تحت الصيانة</option>
              <option value="جاهزة للاستلام">جاهزة للاستلام</option>
              <option value="مستلمة">مستلمة</option>
            </select>
          </div>

          <div className="half">
            <label>الدفع</label>
            <select
              name="paymentStatus"
              onChange={handleSelectChange}
              defaultValue={device.paymentStatus}
            >
              <option value="لم يدفع">لم يدفع</option>
              <option value="كاش">كاش</option>
              <option value="بنكك">بنكك</option>
              <option value="فاتورة">فاتورة</option>
            </select>
          </div>

          {showFileBtn && (
            <div className="half">
              <label>مرفق الدفع</label>
              {paymentProof ? (
                <div className="proof-btns">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={openImg}
                  >
                    <Eye size={18} />{" "}
                    <span className="hideable"> عرض الصورة</span>
                  </button>

                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => setPaymentProof(null)}
                  >
                    <X size={18} style={{ stroke: "var(--primary)" }} />{" "}
                    <span className="hideable"> حذف الصورة</span>
                  </button>
                </div>
              ) : (
                <input
                  id="filebtn"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              )}
            </div>
          )}

          <div className="half">
            <label>وصف العطل</label>
            <input
              placeholder="مثال: تعبئة حبر ومراجعة عامة"
              name="description"
              defaultValue={device.description}
            />
          </div>

          <div className="half">
            <label>التكلفة</label>
            <input
              type="text"
              name="price"
              placeholder="مثال: 30,000"
              value={price}
              onChange={handlePriceChange}
            />
          </div>
          <div className="btns">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "جارٍ التحديث" : "تحديث"}
            </button>
            <button
              className="btn outline"
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                setIsOpen(false);
              }}
            >
              اغلاق
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForm;

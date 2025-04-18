"use client";

import { MouseEvent, useRef, useState } from "react";
import "./addForm.css";
import { CirclePlus, Eye, X } from "lucide-react";
import toast from "react-hot-toast";
import { server_addDevice } from "@/app/actions";
import { Device, useDevicesStore } from "@/app/context/useDevicesStore";
import uploadProof from "@/app/supabase/uploadProof";

const PopupForm = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showFileBtn, setShowFileBtn] = useState(false);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const { addDevice } = useDevicesStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();

      reader.onload = () => {
        setPaymentProof(reader.result as string); // حفظ الصورة كـ Base64
      };
      if (file) reader.readAsDataURL(file);
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
    const value = e.target.value.replace(/\D/g, "");
    setPrice(value ? Number(value).toLocaleString() : ""); // إظهار فارغ عند عدم الإدخال
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // رفع الصورة
    let fileUrl = "";
    try {
      if (file) {
        fileUrl = await uploadProof(file);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Upload error:", err.message);
        toast.error(err.message);
      } else {
        console.error("Unexpected error:", err);
        toast.error("حدث خطأ غير متوقع أثناء رفع الصورة!");
      }
      setLoading(false);
      return;
    }

    // استخراج بيانات الجهاز
    const device: Device = {
      name: (formData.get("name") as string) || "",
      organization: (formData.get("organization") as string) || "",
      phone: (formData.get("phone") as string) || "",
      status:
        (formData.get("status") as
          | "تحت الصيانة"
          | "جاهزة للاستلام"
          | "مستلمة") || "تحت الصيانة",
      paymentStatus:
        (formData.get("paymentStatus") as
          | "لم يدفع"
          | "كاش"
          | "بنكك"
          | "فاتورة") || "لم يدفع",
      paymentProof: fileUrl,
      description: (formData.get("description") as string) || "",
      price:
        parseFloat(
          (formData.get("price") as string).replace(/,/g, "") || "0"
        ) || 0,
    };

    toast
      .promise(server_addDevice(device), {
        loading: "جارٍ اضافة الجهاز...",
        success: (result) => {
          if (result && result.success && result.device) {
            addDevice(result.device);
            setIsOpen(false);
            setLoading(false);

            // إعادة تعيين القيم
            setPrice("");
            setPaymentProof(null);
            if (formRef.current) {
              formRef.current.reset();
            }

            return "تم اضافة الجهاز بنجاح";
          }
          throw new Error(result?.error || "حدث خطأ أثناء إضافة الجهاز");
        },
        error: (err) => err.message || "حدث خطأ أثناء إضافة الجهاز",
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <div className="addForm">
      <button className="btn primary" onClick={() => setIsOpen(true)}>
        <CirclePlus aria-hidden="true" />{" "}
        <span className="hideable">اضافة جهاز</span>
      </button>

      <div className={`overlay ${isOpen ? "show" : ""}`}></div>

      <div className={`popup ${isOpen ? "show" : ""}`}>
        <h2>اضافة جهاز جديد</h2>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="half">
            <label className="required">اسم الجهاز </label>
            <input
              type="text"
              name="name"
              required
              placeholder="مثال: HP LaserJet 2055 White"
            />
          </div>

          <div className="half">
            <label className="required">المؤسسة / الجهة</label>
            <input
              type="text"
              name="organization"
              required
              placeholder="مثال: كلية التربية - دنقلا"
            />
          </div>

          <div className="half">
            <label className="required">رقم الهاتف</label>
            <input
              type="tel"
              name="phone"
              pattern="[0-9]{10}"
              inputMode="numeric"
              placeholder="0912345678"
              dir="rtl"
              maxLength={10}
              required
            />
          </div>

          <div className="half">
            <label>حالة الجهاز</label>
            <select name="status">
              <option value="تحت الصيانة">تحت الصيانة</option>
              <option value="جاهزة للاستلام">جاهزة للاستلام</option>
              <option value="مستلمة">مستلمة</option>
            </select>
          </div>

          <div className="half">
            <label>الدفع</label>
            <select name="paymentStatus" onChange={handleSelectChange}>
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
                    <span className="hideable">عرض الصورة</span>
                  </button>

                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => setPaymentProof(null)}
                  >
                    <X size={18} style={{ stroke: "var(--primary)" }} />
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
              اضافة
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

export default PopupForm;

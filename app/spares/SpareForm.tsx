import { Dispatch, SetStateAction, useState } from "react";
import { SparePart } from "./page";

export default function SpareForm({
  spare,
  type,
  setShowSpareForm,
}: {
  spare?: SparePart | null;
  type: "edit" | "add";
  setShowSpareForm: Dispatch<SetStateAction<boolean>>;
}) {
  const [formData, setFormData] = useState<SparePart>(
    spare || {
      name: "",
      category: "",
      quantity: 0,
      maxQuantity: 0,
      price: 0,
    }
  );
  const [price, setPrice] = useState(spare?.price.toLocaleString());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "maxQuantity" || name === "price"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا يمكن حفظ البيانات أو إرسالها إلى الخادم
    console.log("تم الحفظ:", formData);
    setShowSpareForm(false);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPrice(value ? Number(value).toLocaleString() : ""); // إظهار فارغ عند عدم الإدخال
  };

  return (
    <div className="spare-form">
      <form onSubmit={handleSubmit} className="popup">
        <h1>{type === "edit" ? "تعديل" : "إضافة"} اسبير</h1>

        <div className="half">
          <label htmlFor="name" className="required">
            اسم الاسبير
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            placeholder="ادخل اسم الاسبير"
            required
          />
        </div>

        <div className="half">
          <label htmlFor="category" className="required">
            الفئة
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">اختر الفئة</option>
            <option value="طابعات">طابعات</option>
            <option value="أحبار">أحبار</option>
            <option value="ماكينات تصوير">ماكينات تصوير</option>
            <option value="مستلزمات">مستلزمات</option>
            <option value="ملحقات">ملحقات</option>
          </select>
        </div>

        <div className="half">
          <label htmlFor="quantity" className="required">
            الكمية الحالية
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            required
            min={0}
          />
        </div>

        <div className="half">
          <label htmlFor="maxQuantity" className="required">
            الكمية القصوى
          </label>
          <input
            id="maxQuantity"
            name="maxQuantity"
            type="number"
            value={formData.maxQuantity}
            onChange={handleChange}
            required
            min={0}
          />
        </div>

        <div className="half">
          <label htmlFor="price" className="required">
            السعر
          </label>
          <input
            type="text"
            name="price"
            placeholder="مثال: 30,000"
            value={price}
            onChange={handlePriceChange}
          />
        </div>

        <div className="btns">
          <button type="submit" className="btn primary">
            حفظ
          </button>
          <button
            type="button"
            className="btn outline"
            onClick={() => setShowSpareForm(false)}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

import { Dispatch, SetStateAction, useRef, useState } from "react";
import { SparePart } from "./page";
import toast from "react-hot-toast";
import { addNewSpare, updateSpare } from "../actions";

export default function SpareForm({
  spare,
  type,
  setShowSpareForm,
  setSpares,
}: {
  spare?: SparePart | null;
  type: "edit" | "add";
  setShowSpareForm: Dispatch<SetStateAction<boolean>>;
  setSpares: Dispatch<SetStateAction<SparePart[]>>;
}) {
  const [formData, setFormData] = useState<SparePart>({
    name: spare?.name || "",
    category: spare?.category || "",
    quantity: spare?.quantity || 0,
    maxQuantity: spare?.maxQuantity || 0,
    price: spare?.price || 0,
    id: spare?.id || "",
  });

  const [price, setPrice] = useState(
    spare?.price ? spare.price.toLocaleString() : ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "maxQuantity" ? Number(value) : value,
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "").replace(/\D/g, "");
    const numericValue = Number(rawValue);

    setPrice(rawValue ? numericValue.toLocaleString() : "");
    setFormData((prev) => ({
      ...prev,
      price: numericValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataToSend = new FormData(e.currentTarget);
    setIsLoading(true);

    try {
      await toast.promise(
        type === "add"
          ? addNewSpare(formData)
          : updateSpare(formData.id, formData),
        {
          loading: type === "add" ? "جارٍ إضافة الاسبير" : "جارٍ تعديل الاسبير",
          success: (result) => {
            if (result?.success && result.spare) {
              formRef.current?.reset();

              setSpares((prev) => {
                if (type === "add") {
                  return [...prev, result.spare];
                } else {
                  return prev.map((s) =>
                    s.id === result.spare.id ? result.spare : s
                  );
                }
              });

              return type === "add"
                ? "تمت إضافة الاسبير بنجاح!"
                : "تم تعديل الاسبير بنجاح!";
            }
            throw new Error(result?.error || "حدث خطأ في العملية!");
          },
          error: (err) => err.message || "حدث خطأ أثناء العملية!",
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      toast.error(errorMessage);
      console.error("Error:", errorMessage);
    } finally {
      setIsLoading(false);
      setShowSpareForm(false);
    }
  };

  return (
    <div className="spare-form">
      <form onSubmit={handleSubmit} className="popup" ref={formRef}>
        <h1>{type === "edit" ? "تعديل" : "إضافة"} اسبير</h1>

        <div className="half name">
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
          <label htmlFor="price" className="required">
            السعر
          </label>
          <input
            id="price"
            name="price"
            type="text"
            value={price}
            onChange={handlePriceChange}
            placeholder="ادخل السعر"
            required
          />
        </div>

        <div className="btns">
          <button type="submit" className="btn primary" disabled={isLoading}>
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

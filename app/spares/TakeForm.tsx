"use client";
import "react-circular-progressbar/dist/styles.css";
import "./spares.css";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import toast from "react-hot-toast";
import { SparePart } from "./page";
import { takeSpare } from "../actions";

export const TakeForm = ({
  spare,
  setShowTakeForm,
  setSpares,
}: {
  spare: SparePart;
  setShowTakeForm: Dispatch<SetStateAction<boolean>>;
  setSpares: Dispatch<SetStateAction<SparePart[]>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get("quantity"));

    if (!quantity || quantity <= 0) {
      toast.error("الرجاء إدخال كمية صحيحة");
      return;
    }

    if (quantity > spare.quantity) {
      toast.error("الكمية المدخلة أكبر من الكمية المتاحة");
      return;
    }

    setIsLoading(true);

    try {
      await toast.promise(takeSpare(spare.id!, quantity), {
        loading: "جارٍ تحديث الكمية",
        success: (result) => {
          if (result.success && result.spare) {
            // تحديث القائمة
            setSpares((prev) =>
              prev.map((s) => (s.id === result.spare.id ? result.spare : s))
            );

            return "تم خصم الكمية بنجاح!";
          }

          throw new Error(result?.error || "فشل أثناء خصم الكمية");
        },
        error: (err) => err.message || "حدث خطأ أثناء خصم الكمية",
      });

      formRef.current?.reset();
      setShowTakeForm(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="takeForm">
      <div className="popup">
        <div className="info">
          <h2>{spare.name}</h2>
        </div>

        <form onSubmit={handleSubmit} ref={formRef}>
          <input
            type="number"
            name="quantity"
            max={spare.quantity}
            inputMode="numeric"
            required
            placeholder={`ادخل الكمية، اقصى عدد: ${spare.quantity}`}
          />
          <div className="btns">
            <button className="btn primary" type="submit" disabled={isLoading}>
              {isLoading ? "جارٍ الخصم..." : "متابعة"}
            </button>
            <button
              className="btn outline"
              type="button"
              onClick={() => setShowTakeForm(false)}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

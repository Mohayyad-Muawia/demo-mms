"use client";
import "react-circular-progressbar/dist/styles.css";
import "./spares.css";
import { Dispatch, SetStateAction } from "react";

export type SparePart = {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  maxQuantity: number;
  price: number;
};

export const TakeForm = ({
  spare,
  setShowTakeForm,
}: {
  spare: SparePart;
  setShowTakeForm: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="takeForm">
      <div className="popup">
        <div className="info">
          <h2>{spare.name}</h2>
        </div>

        <form>
          <input
            type="number"
            name="quantity"
            max={spare.quantity}
            inputMode="numeric"
            required
            placeholder={`ادخل الكمية، اقصى عدد: ${spare.quantity}`}
          />
          <div className="btns">
            <button className="btn primary" type="submit">
              متابعة
            </button>
            <button
              className="btn outline"
              onClick={() => setShowTakeForm(false)}
            >
              الغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

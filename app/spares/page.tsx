"use client";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./spares.css";
import { Bolt, PackageMinus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { TakeForm } from "./TakeForm";
import SpareForm from "./SpareForm";

export type SparePart = {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  maxQuantity: number;
  price: number;
};

const categoryColors: {
  [key: string]: string;
} = {
  أحبار: "#0d6efd",
  طابعات: "#16a34a",
  "ماكينات تصوير": "#f59e0b",
  مستلزمات: "#9333ea",
  ملحقات: "#e11d48",
};

const spareParts: SparePart[] = [
  {
    name: "طابعة HP 1102 رأس",
    category: "طابعات",
    quantity: 10,
    maxQuantity: 10,
    price: 15000,
  },
  {
    name: "حبر كانون 737",
    category: "أحبار",
    quantity: 12,
    maxQuantity: 20,
    price: 8000,
  },
  {
    name: "درم ماكينة تصوير Ricoh",
    category: "ماكينات تصوير",
    quantity: 3,
    maxQuantity: 5,
    price: 22000,
  },
  {
    name: "سخان طابعة HP 1020",
    category: "طابعات",
    quantity: 2,
    maxQuantity: 6,
    price: 10000,
  },
  {
    name: "مخزن ورق A4",
    category: "مستلزمات",
    quantity: 10,
    maxQuantity: 15,
    price: 500,
  },
  {
    name: "سير ماكينة تصوير",
    category: "ماكينات تصوير",
    quantity: 1,
    maxQuantity: 3,
    price: 25000,
  },
  {
    name: "وحدة تغذية أوراق",
    category: "ملحقات",
    quantity: 6,
    maxQuantity: 10,
    price: 3500,
  },
  {
    name: "لوحة تشغيل طابعة كانون",
    category: "طابعات",
    quantity: 4,
    maxQuantity: 7,
    price: 9000,
  },
  {
    name: "شريحة حبر HP",
    category: "أحبار",
    quantity: 8,
    maxQuantity: 12,
    price: 3000,
  },
  {
    name: "عدسة سكانر",
    category: "ملحقات",
    quantity: 2,
    maxQuantity: 4,
    price: 7000,
  },
  {
    name: "رأس طابعة Epson",
    category: "طابعات",
    quantity: 3,
    maxQuantity: 6,
    price: 18000,
  },
  {
    name: "حبر Epson T6641",
    category: "أحبار",
    quantity: 15,
    maxQuantity: 20,
    price: 2500,
  },
  {
    name: "كابل USB طابعة",
    category: "مستلزمات",
    quantity: 25,
    maxQuantity: 30,
    price: 1500,
  },
  {
    name: "بكرة ماكينة تصوير",
    category: "ماكينات تصوير",
    quantity: 5,
    maxQuantity: 8,
    price: 9000,
  },
  {
    name: "حساس ورق",
    category: "ملحقات",
    quantity: 7,
    maxQuantity: 10,
    price: 2800,
  },
  {
    name: "محرك سحب ورق",
    category: "ماكينات تصوير",
    quantity: 2,
    maxQuantity: 4,
    price: 13000,
  },
  {
    name: "وحدة حبر ملونة",
    category: "أحبار",
    quantity: 6,
    maxQuantity: 10,
    price: 9500,
  },
  {
    name: "مفتاح تشغيل طابعة",
    category: "طابعات",
    quantity: 9,
    maxQuantity: 12,
    price: 1200,
  },
  {
    name: "كارت باور ماكينة تصوير",
    category: "ماكينات تصوير",
    quantity: 1,
    maxQuantity: 2,
    price: 30000,
  },
  {
    name: "شاشة عرض",
    category: "ملحقات",
    quantity: 2,
    maxQuantity: 3,
    price: 11000,
  },
];

export default function Spares() {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [showTakeForm, setShowTakeForm] = useState(false);
  const [showSpareForm, setShowSpareForm] = useState(false);
  const [spareFormType, setSpareFormType] = useState<"add" | "edit">("edit");
  const [selectedSpare, setSelectedSpare] = useState<SparePart | null>(null);

  const handleFlip = (index: number) => {
    if (flippedIndex === index) {
      // لو ضغط مرة ثانية على نفس البطاقة، اقفل النافذة كمان
      setShowTakeForm(false);
      setSelectedSpare(null);
      setFlippedIndex(null);
    } else {
      setFlippedIndex(index);
      setShowTakeForm(false); // اقفل أي نافذة مفتوحة قبل فتح بطاقة جديدة
    }
  };

  const openTakeForm = (spare: SparePart) => {
    setSelectedSpare(spare);
    setShowTakeForm(true);
  };

  const openSpareForm = (spare: SparePart | null, type: "edit" | "add") => {
    setSelectedSpare(spare);
    setShowSpareForm(true);
    setSpareFormType(type);
  };

  return (
    <div className="spares">
      <div className="legend">
        {Object.entries(categoryColors).map(([cat, color]) => (
          <a
            href={`#${cat}`}
            key={cat}
            className="legend-item card"
            style={{ borderColor: color }}
          >
            <b style={{ color }}>
              {spareParts.filter((part) => part.category === cat).length}
            </b>
            <span>{cat}</span>
          </a>
        ))}
        <button
          className="btn primary"
          onClick={() => openSpareForm(null, "add")}
        >
          <Bolt />
          اضافة اسبير
        </button>
      </div>

      <div className="list">
        {Object.keys(categoryColors).map((category) => {
          const partsInCategory = spareParts.filter(
            (part) => part.category === category
          );

          if (partsInCategory.length === 0) return null;

          return (
            <div key={category} id={category} className="category-group">
              <h2
                className="category-title"
                style={{ color: categoryColors[category] }}
              >
                {category}
              </h2>
              <div className="category-list">
                {partsInCategory.map((part, index) => {
                  const percent = Math.round(
                    (part.quantity / part.maxQuantity) * 100
                  );
                  const color = categoryColors[part.category] || "#e5e7eb";
                  const isFlipped = flippedIndex === spareParts.indexOf(part);

                  return (
                    <div
                      key={index}
                      className={`spare ${isFlipped ? "fliped" : ""}`}
                      onClick={() => handleFlip(spareParts.indexOf(part))}
                    >
                      <div
                        className={`card card-inner ${
                          isFlipped ? "fliped" : ""
                        }`}
                      >
                        {/* front */}
                        <div className="card-front">
                          <div className="bar">
                            <CircularProgressbar
                              strokeWidth={8}
                              value={percent}
                              styles={{
                                path: { stroke: color },
                                trail: { stroke: "#e5e7eb", opacity: 0.1 },
                              }}
                            />
                            <p>
                              <b className="q">{part.quantity}</b>
                              <span>/</span>
                              <b className="mq">{part.maxQuantity}</b>
                            </p>
                          </div>
                          <div className="info">
                            <h2>{part.name}</h2>
                            <p style={{ color }}>
                              {part.price.toLocaleString()} ج
                            </p>
                          </div>
                        </div>

                        {/* back */}
                        <div className="card-back">
                          <div className="options">
                            <button
                              className="btn primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTakeForm(part);
                              }}
                            >
                              <PackageMinus />
                              اخذ اسبير
                            </button>

                            <button
                              className="btn outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSpareForm(part, "edit");
                              }}
                            >
                              <Bolt />
                              تعديل
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showTakeForm && selectedSpare && (
        <TakeForm spare={selectedSpare} setShowTakeForm={setShowTakeForm} />
      )}

      {showSpareForm && (
        <SpareForm
          spare={selectedSpare}
          setShowSpareForm={setShowSpareForm}
          type={spareFormType}
        />
      )}
    </div>
  );
}

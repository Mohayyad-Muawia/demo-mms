"use client";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./spares.css";
import { Bolt, PackageMinus } from "lucide-react";
import { useEffect, useState } from "react";
import { TakeForm } from "./TakeForm";
import SpareForm from "./SpareForm";
import { getAllSpares } from "../actions";
import toast from "react-hot-toast";

export type SparePart = {
  id: string;
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

export default function Spares() {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [status, setStatus] = useState<string | null>(
    "جارٍ تحميل الاسبيرات..."
  );
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [showTakeForm, setShowTakeForm] = useState(false);
  const [showSpareForm, setShowSpareForm] = useState(false);
  const [spareFormType, setSpareFormType] = useState<"add" | "edit">("edit");
  const [selectedSpare, setSelectedSpare] = useState<SparePart | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllSpares();
        setSpareParts(data || []);

        if (!data || data.length === 0) {
          setStatus("لم يتم العثور على اسبيرات");
        } else {
          setStatus(null);
        }
      } catch (err) {
        setStatus("فشل في تحميل الاسبيرات");
        const errorMessage =
          err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        toast.error(errorMessage);
        console.error("Failed to fetch Spares:", errorMessage);
      }
    };

    fetchUsers();
  }, []);

  const handleFlip = (
    index: number,
    e: React.TouchEvent | React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (flippedIndex === index) {
      setShowTakeForm(false);
      setSelectedSpare(null);
      setFlippedIndex(null);
    } else {
      setFlippedIndex(index);
      setShowTakeForm(false);
    }
  };

  const openTakeForm = (
    spare: SparePart,
    e: React.TouchEvent | React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSpare(spare);
    setShowTakeForm(true);
  };

  const openSpareForm = (
    spare: SparePart | null,
    type: "edit" | "add",
    e: React.TouchEvent | React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
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
          onClick={(e) => openSpareForm(null, "add", e)}
        >
          <Bolt />
          اضافة اسبير
        </button>
      </div>

      {status && <div className="status">{status}</div>}

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
                      onClick={(e) => handleFlip(spareParts.indexOf(part), e)}
                      onTouchEnd={(e) =>
                        handleFlip(spareParts.indexOf(part), e)
                      }
                    >
                      {" "}
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
                              onClick={(e) => openTakeForm(part, e)}
                              onTouchEnd={(e) => openTakeForm(part, e)}
                            >
                              <PackageMinus />
                              اخذ اسبير
                            </button>
                            <button
                              className="btn outline"
                              onClick={(e) => openSpareForm(part, "edit", e)}
                              onTouchEnd={(e) => openSpareForm(part, "edit", e)}
                            >
                              <Bolt />
                              تعديل
                            </button>{" "}
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
        <TakeForm
          spare={selectedSpare}
          setShowTakeForm={setShowTakeForm}
          setSpares={setSpareParts}
        />
      )}

      {showSpareForm && (
        <SpareForm
          spare={selectedSpare}
          setShowSpareForm={setShowSpareForm}
          type={spareFormType}
          setSpares={setSpareParts}
        />
      )}
    </div>
  );
}

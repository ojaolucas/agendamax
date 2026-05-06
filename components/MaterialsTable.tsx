"use client";

import { useState, useEffect } from "react";
import styles from "./MaterialsTable.module.css";

export type MaterialRow = {
  item: string;
  quantity: string;
  unit: "un" | "m";
};

function parseMaterials(raw: string): MaterialRow[] {
  if (!raw || raw.trim() === "") return [{ item: "", quantity: "", unit: "un" }];
  return raw.split("\n").map(line => {
    // Expected format: "Item - 5 un" or "Item - 10 m"
    const match = line.match(/^(.+?)\s*-\s*([\d.,]+)\s*(un|m)$/i);
    if (match) {
      return { item: match[1].trim(), quantity: match[2].trim(), unit: match[3].toLowerCase() as "un" | "m" };
    }
    return { item: line.trim(), quantity: "", unit: "un" };
  }).filter(r => r.item);
}

export function serializeMaterials(rows: MaterialRow[]): string {
  return rows
    .filter(r => r.item.trim() !== "")
    .map(r => `${r.item} - ${r.quantity || "0"} ${r.unit}`)
    .join("\n");
}

interface MaterialsTableProps {
  initialValue?: string;
  onChange: (value: string) => void;
}

export default function MaterialsTable({ initialValue = "", onChange }: MaterialsTableProps) {
  const [rows, setRows] = useState<MaterialRow[]>(() => parseMaterials(initialValue));

  useEffect(() => {
    onChange(serializeMaterials(rows));
  }, [rows]);

  const addRow = () => setRows([...rows, { item: "", quantity: "", unit: "un" }]);

  const removeRow = (index: number) => {
    if (rows.length === 1) return; // Keep at least one row
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof MaterialRow, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableHeader}>
        <span className={styles.colNum}>#</span>
        <span className={styles.colItem}>Equipamento / Material</span>
        <span className={styles.colQty}>Quantidade</span>
        <span className={styles.colUnit}>Unidade</span>
        <span className={styles.colAction}></span>
      </div>

      {rows.map((row, index) => (
        <div key={index} className={styles.tableRow}>
          <span className={styles.colNum}>{index + 1}</span>

          <input
            className={`${styles.input} ${styles.colItem}`}
            type="text"
            placeholder="Ex: Climatizador"
            value={row.item}
            onChange={e => updateRow(index, "item", e.target.value)}
          />

          <input
            className={`${styles.input} ${styles.colQty}`}
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            value={row.quantity}
            onChange={e => updateRow(index, "quantity", e.target.value)}
          />

          <select
            className={`${styles.select} ${styles.colUnit}`}
            value={row.unit}
            onChange={e => updateRow(index, "unit", e.target.value as "un" | "m")}
          >
            <option value="un">Unitário</option>
            <option value="m">Metros</option>
          </select>

          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => removeRow(index)}
            disabled={rows.length === 1}
          >
            ✕
          </button>
        </div>
      ))}

      <button type="button" className={styles.addBtn} onClick={addRow}>
        + Adicionar Item
      </button>
    </div>
  );
}

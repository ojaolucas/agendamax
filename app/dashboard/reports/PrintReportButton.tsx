"use client";

import styles from "./reports.module.css";

export default function PrintReportButton() {
  return (
    <button type="button" onClick={() => window.print()} className={styles.printBtn}>
      Imprimir PDF
    </button>
  );
}

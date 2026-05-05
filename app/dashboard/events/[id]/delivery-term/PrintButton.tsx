"use client";

import styles from "./delivery-term.module.css";

export default function PrintButton() {
  return (
    <div className={styles.noPrint}>
      <button onClick={() => window.print()} className={styles.printBtn}>
        Imprimir Documento
      </button>
    </div>
  );
}

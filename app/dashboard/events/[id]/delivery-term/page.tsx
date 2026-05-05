import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import styles from "./delivery-term.module.css";
import PrintButton from "./PrintButton";
import { processTemplate } from "@/lib/templates";

export default async function DeliveryTermPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) notFound();

  const settings = await prisma.companySettings.findUnique({
    where: { id: "settings" },
  });

  // Parse materials into table rows
  const materialsRows = event.materials.split("\n").filter(line => line.trim() !== "").map((line, index) => {
    // Simple parsing logic: looks for a quantity at the end (e.g. "Item - 05")
    const parts = line.split("-");
    const qty = parts.length > 1 ? parts.pop()?.trim() : "";
    const desc = parts.join("-").trim() || line.trim();
    return `
      <tr>
        <td style="border: 1px solid #000; padding: 5px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #000; padding: 5px;">${desc}</td>
        <td style="border: 1px solid #000; padding: 5px; text-align: center;">${qty}</td>
      </tr>
    `;
  }).join("");

  const materialsTable = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="border: 1px solid #000; padding: 5px; width: 50px;">ITEM</th>
          <th style="border: 1px solid #000; padding: 5px;">DESCRIÇÃO</th>
          <th style="border: 1px solid #000; padding: 5px; width: 80px;">QTDE</th>
        </tr>
      </thead>
      <tbody>
        ${materialsRows}
      </tbody>
    </table>
  `;

  const templateData = {
    companyName: settings?.companyName || "Padrão",
    clientName: event.clientName,
    eventName: event.eventName,
    location: event.location,
    address: event.address || "",
    clientContact: event.clientContact || "",
    materialsTable: materialsTable,
    date: format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
    eventDate: `${format(new Date(event.startDatetime), "dd/MM/yyyy")}`,
  };

  const defaultTemplate = `
    <h2 style="text-align: center; margin-top: 20px;">Termo de Entrega</h2>
    
    <div style="margin-top: 30px; line-height: 1.8;">
      <p><strong>Cliente:</strong> {{clientName}}</p>
      <p><strong>Data do evento:</strong> {{eventDate}}</p>
      <p><strong>Local:</strong> {{location}}</p>
      <p><strong>Endereço:</strong> {{address}}</p>
      <p><strong>Contato:</strong> {{clientContact}}</p>
    </div>

    <div style="margin-top: 30px;">
      <p><strong>MATERIAIS:</strong></p>
      {{materialsTable}}
    </div>

    <div style="text-align: center; margin-top: 50px;">
      <p>Maceió, {{date}}.</p>
    </div>

    <div style="margin-top: 100px; display: flex; flex-direction: column; align-items: center; gap: 60px;">
      <div style="text-align: center; width: 300px;">
        <div style="border-top: 1px solid #000; margin-bottom: 5px;"></div>
        <p style="font-size: 0.8rem; font-weight: bold;">RESPONSÁVEL PELA A ENTREGA</p>
      </div>
      <div style="text-align: center; width: 300px;">
        <div style="border-top: 1px solid #000; margin-bottom: 5px;"></div>
        <p style="font-size: 0.8rem; font-weight: bold;">RESPONSÁVEL PELO RECEBIMENTO</p>
      </div>
    </div>
  `;

  const htmlContent = processTemplate(
    settings?.deliveryTemplate || defaultTemplate,
    templateData
  );

  return (
    <div className={styles.page}>
      <div className={styles.document}>
        <header className={styles.docHeader}>
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" className={styles.logo} style={{ margin: "0 auto", display: "block", maxHeight: "120px" }} />
          ) : (
             <div style={{ textAlign: "center", width: "100%" }}>
                <h1 style={{ margin: 0 }}>{settings?.companyName || "Padrão"}</h1>
                <p>A MONTADORA DO SEU EVENTO</p>
             </div>
          )}
        </header>

        <div 
          className={styles.dynamicContent}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <footer className={styles.docFooter}>
          <p>Avenida Alice Karoline, 48 – QD 4 LT 4 - Cidade Universitária - Maceió - AL</p>
          <p>CEP: 57.073-415 CNPJ: 07.684.405/0001-35 Fone: (82) 3372-2530</p>
          <p>Email: eventospadrao@hotmail.com</p>
        </footer>
      </div>
      <PrintButton />
    </div>
  );
}

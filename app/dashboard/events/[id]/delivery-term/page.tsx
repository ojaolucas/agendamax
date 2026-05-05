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

  const templateData = {
    companyName: settings?.companyName || "agendaMAX",
    clientName: event.clientName,
    eventName: event.eventName,
    materials: event.materials,
    date: format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
    address: event.address || event.location,
  };

  const htmlContent = processTemplate(
    settings?.deliveryTemplate || "<h1>TERMO DE ENTREGA</h1><p>Cliente: {{clientName}}</p><p>Evento: {{eventName}}</p><h3>Materiais:</h3><p>{{materials}}</p>",
    templateData
  );

  return (
    <div className={styles.page}>
      <div className={styles.document}>
        <header className={styles.docHeader}>
          {settings?.logo && <img src={settings.logo} alt="Logo" className={styles.logo} />}
          <div className={styles.companyInfo}>
            <h2>{settings?.companyName}</h2>
            <p>{settings?.address}</p>
            <p>{settings?.phone} | {settings?.email}</p>
          </div>
        </header>

        <div 
          className={styles.dynamicContent}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <footer className={styles.footer}>
          <div className={styles.signatures}>
            <div className={styles.signatureLine}>
              <div className={styles.line}></div>
              <p>Entregador</p>
            </div>
            <div className={styles.signatureLine}>
              <div className={styles.line}></div>
              <p>Responsável pelo Recebimento</p>
            </div>
          </div>
        </footer>
      </div>
      <PrintButton />
    </div>
  );
}

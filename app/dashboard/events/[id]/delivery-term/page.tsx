import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import styles from "./delivery-term.module.css";
import PrintButton from "./PrintButton";

// Parse "Item - 6 un" format into table rows
function parseMaterials(raw: string) {
  return raw.split("\n").filter(l => l.trim()).map((line, index) => {
    const match = line.match(/^(.+?)\s*-\s*([\d.,]+)\s*(un|m)$/i);
    if (match) {
      return { index: index + 1, desc: match[1].trim().toUpperCase(), qty: match[2] + " " + match[3].toLowerCase() };
    }
    return { index: index + 1, desc: line.trim().toUpperCase(), qty: "-" };
  });
}

export default async function DeliveryTermPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [event, settings] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    prisma.companySettings.findUnique({ where: { id: "settings" } }),
  ]);

  if (!event) notFound();

  const materials = parseMaterials(event.materials || "");
  const city = settings?.address?.split(",")[0]?.split("-")[0]?.trim() || "Maceió";

  return (
    <div className={styles.page}>
      <div className={styles.document}>

        {/* ── CABEÇALHO ── */}
        <div className={styles.docTop}>
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" className={styles.logo} />
          ) : (
            <div className={styles.logoPlaceholder}>
              <strong>{settings?.companyName || "Sua Empresa"}</strong>
              <span>A MONTADORA DO SEU EVENTO</span>
            </div>
          )}
        </div>

        {/* ── TÍTULO ── */}
        <h1 className={styles.title}>Termo de Entrega</h1>

        {/* ── DADOS DO EVENTO ── */}
        <div className={styles.infoSection}>
          <p><strong>Cliente:</strong> {event.clientName}</p>
          <p>
            <strong>Data do evento:</strong>&nbsp;
            {format(new Date(event.startDatetime), "dd/MM/yyyy")}
            {event.endDatetime && event.endDatetime !== event.startDatetime
              ? ` e ${format(new Date(event.endDatetime), "dd/MM/yyyy")}`
              : ""}
          </p>
          <p><strong>Local:</strong> {event.location}</p>
          {event.address && <p><strong>Endereço:</strong> {event.address}</p>}
          {event.clientContact && <p><strong>Contato:</strong> {event.clientContact}</p>}
        </div>

        {/* ── MATERIAIS ── */}
        <div className={styles.materialsSection}>
          <p className={styles.materialsLabel}>MATERIAIS:</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thItem}>ITEM</th>
                <th className={styles.thDesc}>DESCRIÇÃO</th>
                <th className={styles.thQty}>QTDE</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((row) => (
                <tr key={row.index}>
                  <td className={styles.tdCenter}>{row.index}</td>
                  <td>{row.desc}</td>
                  <td className={styles.tdCenter}>{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── DATA DA CIDADE ── */}
        <p className={styles.cityDate}>
          {city}, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
        </p>

        {/* ── ASSINATURAS ── */}
        <div className={styles.signatures}>
          <div className={styles.signatureLine}>
            <div className={styles.line} />
            <p>RESPONSÁVEL PELA A ENTREGA</p>
          </div>
          <div className={styles.signatureLine}>
            <div className={styles.line} />
            <p>RESPONSÁVEL PELO RECEBIMENTO</p>
          </div>
        </div>

        {/* ── RODAPÉ ── */}
        {(settings?.address || settings?.email || settings?.phone) && (
          <footer className={styles.docFooter}>
            {settings.address && <p>{settings.address}</p>}
            {settings.phone && settings.email && (
              <p>Fone: {settings.phone} &nbsp;|&nbsp; Email: {settings.email}</p>
            )}
            {settings.phone && !settings.email && <p>Fone: {settings.phone}</p>}
            {!settings.phone && settings.email && <p>Email: {settings.email}</p>}
          </footer>
        )}
      </div>

      <div className={styles.noPrint}>
        <PrintButton />
      </div>
    </div>
  );
}

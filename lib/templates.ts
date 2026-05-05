export function processTemplate(template: string, data: Record<string, string>) {
  let processed = template;
  
  // Mapping of common Portuguese aliases to the system keys
  const aliases: Record<string, string> = {
    "nome": "clientName",
    "cliente": "clientName",
    "evento": "eventName",
    "local": "location",
    "endereco": "address",
    "endereço": "address",
    "contato": "clientContact",
    "materiais": "materialsTable",
    "data_evento": "eventDate",
    "data_hoje": "date",
    "empresa": "companyName",
    "periodo": "period",
    "conteudo": "content"
  };

  // Replace all keys (both original and aliases)
  const allData = { ...data };
  for (const [alias, key] of Object.entries(aliases)) {
    if (data[key]) {
      allData[alias] = data[key];
    }
  }

  for (const [key, value] of Object.entries(allData)) {
    // Support both {{key}} and <<key>>
    const regexCurly = new RegExp(`{{${key}}}`, "gi");
    const regexChevrons = new RegExp(`<<${key}>>`, "gi");
    
    processed = processed.replace(regexCurly, value || "");
    processed = processed.replace(regexChevrons, value || "");
  }
  
  return processed;
}

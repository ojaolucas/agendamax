export function processTemplate(template: string, data: Record<string, string>) {
  let processed = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    processed = processed.replace(regex, value || "");
  }
  return processed;
}

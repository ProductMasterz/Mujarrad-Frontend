export function getMessageText(message: any): string {
  if (!message) return "";

  if (Array.isArray(message.parts)) {
    return message.parts.map((p: any) => p.text ?? "").join("").trim();
  }

  if (typeof message.content === "string") {
    return message.content;
  }

  if (message.content?.text) {
    return message.content.text;
  }

  return "";
}
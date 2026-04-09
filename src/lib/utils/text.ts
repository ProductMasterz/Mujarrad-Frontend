export function getMessageText(message: any): string {
  const content = message?.content;

  if (!content) return "";

  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.text ?? "";
      })
      .join("");
  }

  return "";
}
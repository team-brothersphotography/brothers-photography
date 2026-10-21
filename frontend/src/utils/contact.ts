export function waLink(number: string, message = ""): string {
  const digits = number.replace(/[^0-9]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function telLink(number: string): string {
  return `tel:${number.replace(/\s+/g, "")}`;
}

export function mapsLink(url: string, address: string): string {
  if (url) return url;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

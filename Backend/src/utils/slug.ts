/**
 * Helper 1: Company URL slug generator
 * Example: "GreenLeaf Herbal Extracts" -> "greenleaf-herbal-extracts-4821"
 */
export function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")      // Special symbols remove karta hai
    .replace(/[\s_-]+/g, "-")      // Spaces ko dash (-) banata hai
    .replace(/^-+|-+$/g, "");      // Leading / trailing dash remove karta hai
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base || "company"}-${randomSuffix}`;
}

/**
 * Helper 2: Company avatar initials generator
 * Example: "GreenLeaf Herbal" -> "GH"
 */
export function getInitials(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return text.trim().slice(0, 2).toUpperCase() || "BE";
}


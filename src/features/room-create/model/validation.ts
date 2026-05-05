export const isValidName = (n: string): boolean => {
  const trimmed = n.trim();
  return trimmed.length >= 1 && trimmed.length <= 30;
};

export const isValidDateTime = (d: string): boolean => {
  if (!d) return false;
  const t = Date.parse(d);
  return !Number.isNaN(t);
};

export const isValidHost = (h: string): boolean => {
  const trimmed = h.trim();
  return trimmed.length >= 1 && trimmed.length <= 20;
};

export const isValidPassword = (p: string): boolean => {
  return p.length >= 4 && p.length <= 20;
};

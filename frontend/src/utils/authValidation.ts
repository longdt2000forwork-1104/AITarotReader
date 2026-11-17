export interface PasswordCheckResult {
  valid: boolean;
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  score: number;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function validatePassword(password: string): PasswordCheckResult {
  const minLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const score = [minLength, hasLetter, hasNumber, password.length >= 12].filter(Boolean).length;
  return {
    valid: minLength,
    minLength,
    hasLetter,
    hasNumber,
    score,
  };
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return Boolean(password) && password === confirmPassword;
}

export interface NatalPreview {
  zodiacCode: string;
  zodiacVi: string;
  zodiacEn: string;
  symbol: string;
  elementVi: string;
  elementEn: string;
  lifePathNumber: number;
}

const ZODIAC_DATA: Record<
  string,
  { vi: string; en: string; symbol: string; elementVi: string; elementEn: string }
> = {
  ARIES: { vi: "Bạch Dương", en: "Aries", symbol: "♈", elementVi: "Hỏa", elementEn: "Fire" },
  TAURUS: { vi: "Kim Ngưu", en: "Taurus", symbol: "♉", elementVi: "Thổ", elementEn: "Earth" },
  GEMINI: { vi: "Song Tử", en: "Gemini", symbol: "♊", elementVi: "Khí", elementEn: "Air" },
  CANCER: { vi: "Cự Giải", en: "Cancer", symbol: "♋", elementVi: "Thủy", elementEn: "Water" },
  LEO: { vi: "Sư Tử", en: "Leo", symbol: "♌", elementVi: "Hỏa", elementEn: "Fire" },
  VIRGO: { vi: "Xử Nữ", en: "Virgo", symbol: "♍", elementVi: "Thổ", elementEn: "Earth" },
  LIBRA: { vi: "Thiên Bình", en: "Libra", symbol: "♎", elementVi: "Khí", elementEn: "Air" },
  SCORPIO: { vi: "Bọ Cạp", en: "Scorpio", symbol: "♏", elementVi: "Thủy", elementEn: "Water" },
  SAGITTARIUS: { vi: "Nhân Mã", en: "Sagittarius", symbol: "♐", elementVi: "Hỏa", elementEn: "Fire" },
  CAPRICORN: { vi: "Ma Kết", en: "Capricorn", symbol: "♑", elementVi: "Thổ", elementEn: "Earth" },
  AQUARIUS: { vi: "Bảo Bình", en: "Aquarius", symbol: "♒", elementVi: "Khí", elementEn: "Air" },
  PISCES: { vi: "Song Ngư", en: "Pisces", symbol: "♓", elementVi: "Thủy", elementEn: "Water" },
};

export function calculateNatalPreview(birthDateStr?: string): NatalPreview | null {
  if (!birthDateStr) return null;
  const parts = birthDateStr.split("-");
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  let zodiacCode = "PISCES";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiacCode = "ARIES";
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiacCode = "TAURUS";
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiacCode = "GEMINI";
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiacCode = "CANCER";
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiacCode = "LEO";
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiacCode = "VIRGO";
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiacCode = "LIBRA";
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiacCode = "SCORPIO";
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiacCode = "SAGITTARIUS";
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiacCode = "CAPRICORN";
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiacCode = "AQUARIUS";

  const digits = `${String(year).padStart(4, "0")}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  let sum = 0;
  for (const ch of digits) {
    sum += Number(ch) || 0;
  }
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    let next = 0;
    while (sum > 0) {
      next += sum % 10;
      sum = Math.floor(sum / 10);
    }
    sum = next;
  }

  const info = ZODIAC_DATA[zodiacCode];
  return {
    zodiacCode,
    zodiacVi: info.vi,
    zodiacEn: info.en,
    symbol: info.symbol,
    elementVi: info.elementVi,
    elementEn: info.elementEn,
    lifePathNumber: sum,
  };
}

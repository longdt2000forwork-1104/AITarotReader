package com.aitarotreader.utils;

import java.time.LocalDate;

public final class NatalCalculationUtil {

    private NatalCalculationUtil() {
    }

    public static String computeZodiacSign(LocalDate birthDate) {
        if (birthDate == null) return null;
        int month = birthDate.getMonthValue();
        int day = birthDate.getDayOfMonth();

        if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "ARIES";
        if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "TAURUS";
        if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "GEMINI";
        if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "CANCER";
        if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "LEO";
        if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "VIRGO";
        if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "LIBRA";
        if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "SCORPIO";
        if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "SAGITTARIUS";
        if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "CAPRICORN";
        if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "AQUARIUS";
        return "PISCES";
    }

    public static Integer computeLifePathNumber(LocalDate birthDate) {
        if (birthDate == null) return null;
        String digits = String.format("%04d%02d%02d",
                birthDate.getYear(), birthDate.getMonthValue(), birthDate.getDayOfMonth());
        int sum = 0;
        for (char c : digits.toCharArray()) {
            sum += Character.getNumericValue(c);
        }
        while (sum > 9 && sum != 11 && sum != 22 && sum != 33) {
            int next = 0;
            while (sum > 0) {
                next += sum % 10;
                sum /= 10;
            }
            sum = next;
        }
        return sum;
    }
}

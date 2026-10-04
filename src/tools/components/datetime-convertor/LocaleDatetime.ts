/**
 * Locale helpers for the Datetime Convertor.
 *
 * Kept free of Lit/VS Code imports so they can be unit-tested on their own.
 */

export interface LocaleOption {
    label: string;
    value: string;
}

/** Dropdown value meaning "let the runtime pick the locale" (the old behaviour). */
export const SYSTEM_LOCALE = "default";

/** Locale selected when the tool opens. */
export const DEFAULT_LOCALE = SYSTEM_LOCALE;

export const LOCALE_OPTIONS: LocaleOption[] = [
    { label: "System default", value: SYSTEM_LOCALE },
    { label: "English (UK) en-GB", value: "en-GB" },
    { label: "English (US) en-US", value: "en-US" },
    { label: "English (Australia) en-AU", value: "en-AU" },
    { label: "English (Canada) en-CA", value: "en-CA" },
    { label: "English (Ireland) en-IE", value: "en-IE" },
    { label: "German de-DE", value: "de-DE" },
    { label: "French fr-FR", value: "fr-FR" },
    { label: "Spanish es-ES", value: "es-ES" },
    { label: "Italian it-IT", value: "it-IT" },
    { label: "Dutch nl-NL", value: "nl-NL" },
    { label: "Swedish sv-SE", value: "sv-SE" },
    { label: "Japanese ja-JP", value: "ja-JP" },
    { label: "Chinese zh-CN", value: "zh-CN" },
];

/** Converts a dropdown value into the `locales` argument of `toLocaleString`. */
export function toLocaleTag(value: string): string | undefined {
    return value === SYSTEM_LOCALE ? undefined : value;
}

type DateField = "day" | "month" | "year";

const YEAR_FIRST: DateField[] = ["year", "month", "day"];

// The fields `Date.prototype.toLocaleString()` shows when given no options.
const DEFAULT_FIELDS: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
};

/** Reads the day/month/year order the locale uses, e.g. en-GB gives day, month, year. */
function getDateOrder(locale?: string): DateField[] {
    const order: DateField[] = [];
    const parts = new Intl.DateTimeFormat(locale, DEFAULT_FIELDS).formatToParts(
        new Date(2000, 0, 1),
    );
    for (const part of parts) {
        if (
            part.type === "day" ||
            part.type === "month" ||
            part.type === "year"
        ) {
            order.push(part.type);
        }
    }
    return order;
}

// three date numbers, then an optional time such as 14:30[:05] with an optional am/pm
const DATE_TIME_PATTERN =
    /^(\d{1,4})\D+(\d{1,2})\D+(\d{1,4})(?:\D+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([ap])\.?m\.?)?)?$/i;

/**
 * True when the input starts with a 1-2 digit number, which means the
 * day/month order depends on the locale (04/10/2026 is 4 October in en-GB
 * but 10 April in en-US).
 */
export function hasLocaleOrderedDate(input: string): boolean {
    return /^\s*\d{1,2}\D+\d{1,2}\D+\d/.test(input);
}

/**
 * Parses a date-time written in the given locale's day/month/year order.
 * A four-digit first number is read as year-first (2026-10-05 14:30:00).
 * Returns null if the text does not match or is not a real date.
 */
export function parseLocalDateTime(
    input: string,
    locale?: string,
): Date | null {
    const match = DATE_TIME_PATTERN.exec(input.trim());
    if (!match) {
        return null;
    }
    const text = (index: number): string => match[index] ?? "";

    const order = text(1).length === 4 ? YEAR_FIRST : getDateOrder(locale);
    if (order.length !== 3) {
        return null;
    }

    const fields: Record<DateField, number> = { day: 0, month: 0, year: 0 };
    order.forEach((field, index) => {
        fields[field] = Number(text(index + 1));
    });
    const yearText = text(order.indexOf("year") + 1);
    const year = yearText.length <= 2 ? 2000 + fields.year : fields.year;

    let hours = Number(text(4) || 0);
    const minutes = Number(text(5) || 0);
    const seconds = Number(text(6) || 0);
    const meridiem = text(7).toLowerCase();
    if (meridiem) {
        if (hours < 1 || hours > 12) {
            return null;
        }
        hours = (hours % 12) + (meridiem === "p" ? 12 : 0);
    }

    const date = new Date(
        year,
        fields.month - 1,
        fields.day,
        hours,
        minutes,
        seconds,
    );

    // Reject values that rolled over (31/02, 25:00, a time skipped by DST).
    const isReal =
        date.getFullYear() === year &&
        date.getMonth() === fields.month - 1 &&
        date.getDate() === fields.day &&
        date.getHours() === hours &&
        date.getMinutes() === minutes &&
        date.getSeconds() === seconds;

    return isReal ? date : null;
}

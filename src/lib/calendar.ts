import { siteConfig } from "./siteConfig";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

type ParsedEvent = {
  title: string;
  start: Date;
  end: Date | null;
  location?: string;
  description?: string;
  url?: string;
};

type RawEvent = {
  summary?: string;
  dtstart?: string;
  dtend?: string;
  location?: string;
  description?: string;
  url?: string;
  rrule?: string;
  startTzid?: string;
  endTzid?: string;
};

type RuleParts = {
  freq?: string;
  byDay: string[];
  count?: number;
  until?: Date;
};

const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export async function getUpcomingEvents(limit = siteConfig.homepageEventLimit): Promise<ParsedEvent[]> {
  const response = await fetch(siteConfig.calendarIcsUrl);

  if (!response.ok) {
    throw new Error(`Calendar request failed with status ${response.status}`);
  }

  const icsText = await response.text();
  const calendar = parseCalendar(icsText);
  const now = new Date();

  return calendar
    .filter((event) => event.end ? event.end >= now : event.start >= now)
    .sort((left, right) => left.start.getTime() - right.start.getTime())
    .slice(0, limit);
}

export function formatEventDay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: siteConfig.calendarTimeZone,
  }).format(date);
}

export function formatEventTime(start: Date, end: Date | null): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: siteConfig.calendarTimeZone,
  });

  const startText = formatter.format(start);

  if (!end) {
    return startText;
  }

  return `${startText} to ${formatter.format(end)}`;
}

function parseCalendar(icsText: string): ParsedEvent[] {
  const lines = unfoldLines(icsText);
  const rawEvents: RawEvent[] = [];
  let currentEvent: RawEvent | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (currentEvent) {
        rawEvents.push(currentEvent);
      }

      currentEvent = null;
      continue;
    }

    if (!currentEvent) {
      continue;
    }

    const [rawName = "", rawValue = ""] = splitOnce(line, ":");
    const [fieldName, ...paramParts] = rawName.split(";");
    const params = Object.fromEntries(paramParts.map((part) => splitOnce(part, "=")));

    switch (fieldName) {
      case "SUMMARY":
        currentEvent.summary = rawValue;
        break;
      case "DTSTART":
        currentEvent.dtstart = rawValue;
        currentEvent.startTzid = params.TZID;
        break;
      case "DTEND":
        currentEvent.dtend = rawValue;
        currentEvent.endTzid = params.TZID;
        break;
      case "LOCATION":
        currentEvent.location = rawValue;
        break;
      case "DESCRIPTION":
        currentEvent.description = rawValue;
        break;
      case "URL":
        currentEvent.url = rawValue;
        break;
      case "RRULE":
        currentEvent.rrule = rawValue;
        break;
      default:
        break;
    }
  }

  return rawEvents.flatMap(expandEvent);
}

function expandEvent(event: RawEvent): ParsedEvent[] {
  if (!event.summary || !event.dtstart) {
    return [];
  }

  const normalizedTitle = decodeIcsText(event.summary);
  const normalizedLocation = event.location ? decodeIcsText(event.location) : undefined;
  const normalizedDescription = event.description ? decodeIcsText(event.description) : undefined;
  const inferredUrl = event.url ?? extractUrlFromText(normalizedDescription);
  const cleanedDescription = cleanDescription(normalizedDescription, inferredUrl);
  const startTz = event.startTzid ?? siteConfig.calendarTimeZone;
  const endTz = event.endTzid ?? startTz;
  const start = parseIcsDate(event.dtstart, startTz);
  const end = event.dtend ? parseIcsDate(event.dtend, endTz) : null;
  const durationMs = end ? end.getTime() - start.getTime() : 0;

  if (!event.rrule) {
    return [
      {
        title: normalizedTitle,
        start,
        end,
        location: normalizedLocation,
        description: cleanedDescription,
        url: inferredUrl,
      },
    ];
  }

  const rule = parseRule(event.rrule);

  if (rule.freq !== "WEEKLY") {
    return [
      {
        title: normalizedTitle,
        start,
        end,
        location: normalizedLocation,
        description: cleanedDescription,
        url: inferredUrl,
      },
    ];
  }

  const startParts = extractDateParts(start, startTz);
  const baseDayCode = dayCodes[start.getUTCDay()];
  const byDays = rule.byDay.length > 0 ? rule.byDay : [baseDayCode];
  const occurrences: ParsedEvent[] = [];
  const maxOccurrences = Math.min(rule.count ?? 12, 24);
  const windowEnd = addDays(new Date(), 90);
  const startDateUtc = Date.UTC(startParts.year, startParts.month - 1, startParts.day);

  let weekOffset = 0;

  while (occurrences.length < maxOccurrences && weekOffset < 26) {
    for (const dayCode of byDays) {
      const dayIndex = dayCodes.indexOf(dayCode);

      if (dayIndex === -1) {
        continue;
      }

      const baseDate = new Date(startDateUtc + weekOffset * 7 * 24 * 60 * 60 * 1000);
      const candidateDate = addDays(baseDate, dayIndex - baseDate.getUTCDay());
      const candidateParts = {
        year: candidateDate.getUTCFullYear(),
        month: candidateDate.getUTCMonth() + 1,
        day: candidateDate.getUTCDate(),
        hour: startParts.hour,
        minute: startParts.minute,
        second: startParts.second,
      };
      const occurrenceStart = zonedDatePartsToUtc(candidateParts, startTz);

      if (occurrenceStart < start) {
        continue;
      }

      if (rule.until && occurrenceStart > rule.until) {
        continue;
      }

      if (occurrenceStart > windowEnd) {
        continue;
      }

      occurrences.push({
        title: normalizedTitle,
        start: occurrenceStart,
        end: durationMs > 0 ? new Date(occurrenceStart.getTime() + durationMs) : null,
        location: normalizedLocation,
        description: cleanedDescription,
        url: inferredUrl,
      });

      if (occurrences.length >= maxOccurrences) {
        break;
      }
    }

    weekOffset += 1;
  }

  return occurrences;
}

function parseRule(rule: string): RuleParts {
  const parts = Object.fromEntries(rule.split(";").map((part) => splitOnce(part, "=")));

  return {
    freq: parts.FREQ,
    byDay: parts.BYDAY ? parts.BYDAY.split(",") : [],
    count: parts.COUNT ? Number(parts.COUNT) : undefined,
    until: parts.UNTIL ? parseIcsDate(parts.UNTIL, "UTC") : undefined,
  };
}

function parseIcsDate(value: string, timeZone: string): Date {
  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));

    return zonedDatePartsToUtc({ year, month, day, hour: 0, minute: 0, second: 0 }, timeZone);
  }

  if (value.endsWith("Z")) {
    const normalized = value.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
      "$1-$2-$3T$4:$5:$6Z",
    );

    return new Date(normalized);
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const hour = Number(value.slice(9, 11));
  const minute = Number(value.slice(11, 13));
  const second = Number(value.slice(13, 15) || "0");

  return zonedDatePartsToUtc({ year, month, day, hour, minute, second }, timeZone);
}

function zonedDatePartsToUtc(parts: DateParts, timeZone: string): Date {
  const utcGuess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  const offsetAtGuess = getTimeZoneOffsetMilliseconds(new Date(utcGuess), timeZone);
  let resolvedUtc = utcGuess - offsetAtGuess;
  const offsetAtResolvedTime = getTimeZoneOffsetMilliseconds(new Date(resolvedUtc), timeZone);

  if (offsetAtGuess !== offsetAtResolvedTime) {
    resolvedUtc = utcGuess - offsetAtResolvedTime;
  }

  return new Date(resolvedUtc);
}

function getTimeZoneOffsetMilliseconds(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const utcTime = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour),
    Number(lookup.minute),
    Number(lookup.second),
  );

  return utcTime - date.getTime();
}

function extractDateParts(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  };
}

function unfoldLines(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const rawLines = normalized.split("\n");
  const lines: string[] = [];

  for (const line of rawLines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
      continue;
    }

    if (line.length > 0) {
      lines.push(line);
    }
  }

  return lines;
}

function splitOnce(value: string, separator: string): [string, string] {
  const index = value.indexOf(separator);

  if (index === -1) {
    return [value, ""];
  }

  return [value.slice(0, index), value.slice(index + separator.length)];
}

function addDays(date: Date, dayCount: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + dayCount);
  return nextDate;
}

function decodeIcsText(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\([,;])/g, "$1")
    .replace(/\\\\/g, "\\");
}

function extractUrlFromText(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const hrefMatch = value.match(/href="([^"]+)"/i);

  if (hrefMatch) {
    return hrefMatch[1];
  }

  const urlMatch = value.match(/https?:\/\/[^\s<]+/i);
  return urlMatch ? urlMatch[0] : undefined;
}

function cleanDescription(value?: string, knownUrl?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const htmlDecoded = decodeHtmlEntities(value);
  const withoutAnchor = htmlDecoded.replace(/<a [^>]*>(.*?)<\/a>/gi, "$1");
  const withoutUrl = knownUrl ? withoutAnchor.replaceAll(knownUrl, "").trim() : withoutAnchor.trim();
  const normalizedWhitespace = withoutUrl.replace(/\s+/g, " ").trim();

  return normalizedWhitespace.length > 0 ? normalizedWhitespace : undefined;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

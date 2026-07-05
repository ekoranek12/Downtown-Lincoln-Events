export const siteConfig = {
  calendarIcsUrl:
    import.meta.env.CALENDAR_ICS_URL ??
    "https://calendar.google.com/calendar/ical/7b6d023ecb047c1e067a626369b8c967028b79ddc12bd34746765dc15e5c7506%40group.calendar.google.com/public/basic.ics",
  calendarEmbedUrl:
    "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FChicago&showPrint=0&src=N2I2ZDAyM2VjYjA0N2MxZTA2N2E2MjYzNjliOGM5NjcwMjhiNzlkZGMxMmJkMzQ3NDY3NjVkYzE1ZTVjNzUwNkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23009688",
  submissionFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSe5yJWzIlxbzd43bsm4-N4s-AtpfZEnAbyljPoHF9kZrxxUZQ/viewform?usp=header",
  calendarTimeZone: "America/Chicago",
  homepageEventLimit: 8,
};

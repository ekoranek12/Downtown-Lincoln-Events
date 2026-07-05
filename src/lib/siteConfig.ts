export type CalendarSourceConfig = {
  id: string;
  label: string;
  category: string;
  color: string;
  icsUrl: string;
};

export const siteConfig = {
  calendarSources: [
    {
      id: "downtown-lincoln",
      label: "Downtown",
      category: "Community",
      color: "#315c46",
      icsUrl:
        import.meta.env.CALENDAR_ICS_URL ??
        "https://calendar.google.com/calendar/ical/7b6d023ecb047c1e067a626369b8c967028b79ddc12bd34746765dc15e5c7506%40group.calendar.google.com/public/basic.ics",
    },
    {
      id: "lincoln-theatre",
      label: "Lincoln Theatre",
      category: "Arts",
      color: "#6c4a7a",
      icsUrl:
        "https://calendar.google.com/calendar/ical/3609e15ac16ef482cc4339257814a3bffbb1d0f8a72f5076166f3115aeac86df%40group.calendar.google.com/public/basic.ics",
    },
    {
      id: "spirited-republic",
      label: "Spirited Republic",
      category: "Food & Drinks",
      color: "#9a4b43",
      icsUrl:
        "https://calendar.google.com/calendar/ical/0509f81e3dbfbeca7e4acee6dac3b1eaa90a47d491a82a44a7a87099ded6d110%40group.calendar.google.com/public/basic.ics",
    },
    {
      id: "copper-and-oak",
      label: "Copper & Oak",
      category: "Food & Drinks",
      color: "#4b7352",
      icsUrl:
        "https://calendar.google.com/calendar/ical/68554a07f6280f8ce64a2087c3d10814c0b124d5f293be361200bb28f41eb9da%40group.calendar.google.com/public/basic.ics",
    },
    {
      id: "library",
      label: "Library",
      category: "Community",
      color: "#b79a3f",
      icsUrl:
        "https://calendar.google.com/calendar/ical/d80ac320ea82f1828b174a7c71c6454900b57e897193fe315710d02e6f6aeba3%40group.calendar.google.com/public/basic.ics",
    },
    {
      id: "guest-house",
      label: "Guest House",
      category: "Food & Drinks",
      color: "#7b5a45",
      icsUrl:
        "https://calendar.google.com/calendar/ical/c8c488d2a6d278cf01096a30ac8f4d4c2134e245f06f51bc070d61abebd8e393%40group.calendar.google.com/public/basic.ics",
    },
  ] satisfies CalendarSourceConfig[],
  calendarEmbedUrl:
    "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FChicago&title=Downtown%20Lincoln&mode=WEEK&showTz=0&src=Njg1NTRhMDdmNjI4MGY4Y2U2NGEyMDg3YzNkMTA4MTRjMGIxMjRkNWYyOTNiZTM2MTIwMGJiMjhmNDFlYjlkYUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=N2I2ZDAyM2VjYjA0N2MxZTA2N2E2MjYzNjliOGM5NjcwMjhiNzlkZGMxMmJkMzQ3NDY3NjVkYzE1ZTVjNzUwNkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=YzhjNDg4ZDJhNmQyNzhjZjAxMDk2YTMwYWM4ZjRkNGMyMTM0ZTI0NWYwNmY1MWJjMDcwZDYxYWJlYmQ4ZTM5M0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZDgwYWMzMjBlYTgyZjE4MjhiMTc0YTdjNzFjNjQ1NDkwMGI1N2U4OTcxOTNmZTMxNTcxMGQwMmU2ZjZhZWJhM0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=MzYwOWUxNWFjMTZlZjQ4MmNjNDMzOTI1NzgxNGEzYmZmYmIxZDBmOGE3MmY1MDc2MTY2ZjMxMTVhZWFjODZkZkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=MDUwOWY4MWUzZGJmYmVjYTdlNGFjZWU2ZGFjM2IxZWFhOTBhNDdkNDkxYTgyYTQ0YTdhODcwOTlkZWQ2ZDExMEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%234b7352&color=%23315c46&color=%237b5a45&color=%23b79a3f&color=%236c4a7a&color=%239a4b43",
  submissionFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSe5yJWzIlxbzd43bsm4-N4s-AtpfZEnAbyljPoHF9kZrxxUZQ/viewform?usp=header",
  calendarTimeZone: "America/Chicago",
  homepageEventLimit: 12,
};

export const primaryCalendarSource = siteConfig.calendarSources[0];

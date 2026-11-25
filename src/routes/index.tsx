
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Flower2,
  Heart,
  MapPin,
  Wine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InvitationRsvp,
  type InvitationData,
} from "@/components/invitation-rsvp";
import { eventConfig as event, getCountdown } from "@/lib/event-config";
import { getInvitationByToken } from "@/lib/invitation.functions";

const API_URL = import.meta.env["VITE_API_URL"];


export const Route = createFileRoute("/")({
 validateSearch: (search) => ({
  token: typeof search["token"] === "string" ? search["token"] : "",
}),

  loaderDeps: ({ search }) => ({
    token: search.token,
  }),

  loader: ({ deps }) =>
    deps.token
      ? getInvitationByToken({ data: { token: deps.token } })
      : null,

  head: ({ loaderData }) => {
    const brideName =
      loaderData?.invitation?.wedding?.settings?.bride_name ||
      "Bride to Be";

    const title = `Bride to Be — A Celebration of ${brideName}`;

    return {
      meta: [
        { title },
        {
          name: "description",
          content: `You're invited to celebrate ${brideName}!`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Join us for a beautiful celebration of ${brideName}.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },

  component: Index,
});


function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <Heart />
    </div>
  );
}

function Countdown({ startsAt }: { startsAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const values =
    now === null
      ? { days: 0, hours: 0, minutes: 0, seconds: 0 }
      : getCountdown(startsAt, now);

  return (
    <section className="section section-blush">
      <p className="eyebrow">Every moment brings us closer</p>
      <h2 className="section-title">Counting Down to the Celebration</h2>

      <div className="countdown" aria-label="Time until the celebration">
        {Object.entries(values).map(([label, value]) => (
          <div className="countdown-cell" key={label}>
            <div className="countdown-number">
              {now === null ? "—" : String(value).padStart(2, "0")}
            </div>
            <div className="countdown-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}



function Index() {
  const { token } = Route.useSearch();
  const loaderData = Route.useLoaderData();

  const invitation = loaderData?.invitation ?? null;
  const loading = false;
  const error = !token
    ? "Please open your personal invitation link."
    : loaderData?.error ?? "";

  const [photo, setPhoto] = useState<string | null>(null);


  useEffect(() => {
    if (loading || !invitation) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.06 }
    );

    document.querySelectorAll(".section").forEach(section => {
      section.setAttribute("data-reveal", "true");
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [loading, invitation]);

  if (loading) {
    return (
      <main className="section section-blush">
        <p className="section-copy">Loading your invitation...</p>
      </main>
    );
  }

  if (error || !invitation || !token) {
    return (
      <main className="section section-blush">
        <h1 className="section-title">Invitation unavailable</h1>
        <p className="form-error" role="alert">
          {error || "This invitation could not be loaded."}
        </p>
      </main>
    );
  }

  const wedding = invitation.wedding;
  const settings = wedding.settings ?? {};

  const brideName = settings.bride_name || "Bride to Be";
  const venue = wedding.venue || "Venue to be announced";
  const location = settings.location || "";
  const timeNote = settings.time_note || "";
  const dressCode = settings.dress_code || "Dress Code";
  const dressDescription = settings.dress_description || "";

  const invitationMessage =
    settings.invitation_message ||
    "نجتمع اليوم لنحتفل بالحب، والفرح، والصداقة، وبعروستنا الجميلة التي تستحق كل الحب.\n\nيوم مميّز لامرأة مميّزة، محاطة بأحبّ الناس إلى قلبها.";

  const dateOnly = wedding.date?.slice(0, 10) || event.date;

const dateParts = wedding.date
  ? wedding.date.slice(0, 10).split("-").map(Number)
  : [];

const celebrationDate =
  dateParts.length === 3 &&
  dateParts.every(Number.isFinite)
    ? new Date(
        dateParts[0]!,
        dateParts[1]! - 1,
        dateParts[2]!
      )
    : new Date(event.startsAt);

  const formattedDate = celebrationDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const weekday = celebrationDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const startTime = settings.start_time || "16:00";

  function formatTime(value: string) {
    const match = value.match(/^(\d{1,2}):(\d{2})/);

    if (match) {
      const date = new Date();
      date.setHours(Number(match[1]), Number(match[2]), 0, 0);

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return value;
  }

  const time = formatTime(startTime);

  const startsAt =
    dateParts && dateParts.length === 3
      ? `${dateOnly}T${startTime.length === 5 ? startTime : "16:00"}:00`
      : event.startsAt;

  const mapsQuery = [venue, location].filter(Boolean).join(", ");

  const details = [
    {
      icon: CalendarDays,
      label: "Date & Time",
      value: `${weekday}, ${formattedDate} · ${time}`,
      note: timeNote,
    },
    {
      icon: MapPin,
      label: "Venue & Location",
      value: venue,
      note: location,
    },
  ];

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  function downloadCalendar() {
    const formatStamp = (date: Date) =>
      date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");

    const start = new Date(startsAt);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Bride to Be//Invitation//EN",
      "BEGIN:VEVENT",
      `UID:${wedding.slug}@invitation`,
      `DTSTAMP:${formatStamp(new Date())}`,
      `DTSTART:${formatStamp(start)}`,
      `DTEND:${formatStamp(end)}`,
      `SUMMARY:${brideName}'s Bride-to-Be Celebration`,
      `LOCATION:${venue} - ${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const url = URL.createObjectURL(
      new Blob([content], { type: "text/calendar" })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = `${brideName}-celebration.ics`;
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <header className="invitation-header">
        <div className="brand">
          <Flower2 aria-hidden="true" />
          <span>With love, {brideName}</span>
        </div>

        <nav className="header-nav" aria-label="Invitation sections">
          <a className="nav-link" href="#celebration">
            The Celebration
          </a>
          <a className="nav-link" href="#dress-code">
            Dress Code
          </a>
          <Button
            variant="invitation"
            className="header-button"
            onClick={() => scrollTo("rsvp")}
          >
            RSVP <ArrowUpRight />
          </Button>
        </nav>
      </header>

      <main>
        <section className="cover">
          <img
            className="cover-photo"
            src={event.images.hero}
            alt="Bride to Be invitation"
            fetchPriority="high"
          />

          <div className="cover-content">
            <h1>Bride to Be</h1>
            <p className="bride-name">{brideName}</p>
            <Ornament />
            <p className="cover-subtitle">
              Before she says I do, let's celebrate her!
            </p>
            <Button
              variant="invitation"
              onClick={() => scrollTo("invitation")}
            >
              <Heart /> Open Your Invitation
            </Button>
          </div>

          <div className="scroll-cue" aria-hidden="true">
            A LITTLE LOVE AWAITS
            <ArrowDown />
          </div>
        </section>

        <section id="invitation" className="section message-section">
          <p className="eyebrow">For our beautiful bride-to-be</p>
          <h2 className="message-title">
            One last celebration before forever begins.
          </h2>

          <div className="message-frame">
            {invitationMessage.split("\n").filter(Boolean).map((paragraph, i) => (
              <p
                key={i}
                className={`section-copy ${i > 0 ? "mt-5" : ""}`}
                dir="auto"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section id="celebration" className="section section-blush">
          <p className="eyebrow">Save a little time for something lovely</p>
          <h2 className="section-title">The Celebration</h2>
          <p className="section-copy">
            Good company. A little bubbly. A whole lot of love.
          </p>

          <div className="detail-grid">
            {details.map(({ icon: Icon, label, value, note }, index) => (
              <article key={label} className="detail-card">
                <Icon />
                <h3>{label}</h3>
                <p>{value}</p>
                <small>{note}</small>

                {index === 1 && mapsQuery && (
                  <Button variant="invitationOutline" asChild>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin />
                      View on Google Maps
                      <ArrowUpRight />
                    </a>
                  </Button>
                )}
              </article>
            ))}
          </div>

          <Button
            variant="invitationOutline"
            onClick={downloadCalendar}
            className="mt-6"
          >
            <CalendarDays />
            Add to Calendar
          </Button>
        </section>

        <Countdown startsAt={startsAt} />

        <section id="dress-code" className="section">
          <p className="eyebrow">The dress code</p>
          <h2 className="section-title">{dressCode}</h2>
          <p className="section-copy">{dressDescription}</p>

          <img
            className="mood-image"
            src={event.images.mood}
            alt="Bride-to-be celebration inspiration"
            loading="lazy"
          />

          <div className="swatches">
            {["Pink", "Blush", "Nude", "Champagne"].map(color => (
              <div key={color}>
                <div className={`swatch swatch-${color.toLowerCase()}`} />
                <span>{color}</span>
              </div>
            ))}
          </div>
        </section>

        <InvitationRsvp invitation={invitation} token={token} />

        <section className="section inspiration-section">
          <p className="eyebrow">A glimpse of the lovely things to come</p>
          <h2 className="section-title">A Little Inspiration</h2>

          <div className="gallery-grid gallery-editorial">
            {event.images.gallery.map((src, index) => (
              <Button
                variant="ghost"
                className={`gallery-item gallery-item-${index + 1}`}
                key={index}
                onClick={() => setPhoto(src)}
                aria-label={`Enlarge bridal inspiration ${index + 1}`}
              >
                <img
                  src={src}
                  alt="Bride to Be celebration inspiration"
                  loading="lazy"
                />
              </Button>
            ))}
          </div>

          <p className="gallery-caption">
            Beautiful moments are even better when shared.
          </p>
        </section>

        <section className="section closing">
          <img
            className="closing-florals"
            src={event.images.hero}
            loading="lazy"
            alt=""
          />

          <Wine className="mx-auto mb-6 h-7 w-7 text-gold" strokeWidth={1} />

          <h2 className="section-title">
            Here's to love, laughter,
            <br />
            and a lifetime of happiness!
          </h2>

          <p className="section-copy">Can't wait to celebrate with you!</p>
          <p className="closing-name">With love, {brideName}</p>
          <Ornament />
          <p className="footer-note">
            A LITTLE CELEBRATION. A BEAUTIFUL BEGINNING.
          </p>
        </section>
      </main>

      <Dialog
        open={photo !== null}
        onOpenChange={open => {
          if (!open) setPhoto(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">
            Bridal inspiration photograph
          </DialogTitle>

          {photo && (
            <img
              src={photo}
              alt="Bridal celebration inspiration"
              className="max-h-[80svh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

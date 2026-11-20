import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, CalendarDays, Clock3, Flower2, Heart, MapPin, Wine, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { InvitationRsvp } from "@/components/invitation-rsvp";
import { calendarContent, eventConfig as event, getCountdown } from "@/lib/event-config";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: `${event.brideName} — Bride to Be | You're Invited` },
    { name: "description", content: `Celebrate ${event.brideName} before she says I do. ${event.date}, ${event.time}, ${event.venue}. View your invitation and RSVP.` },
    { property: "og:title", content: `${event.brideName}'s Bride-to-Be Celebration` },
    { property: "og:description", content: `A little celebration before the big day. Join us on ${event.date}.` },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Ornament() { return <div className="ornament" aria-hidden="true"><Heart /></div>; }
function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const values = now === null ? { days: 0, hours: 0, minutes: 0, seconds: 0 } : getCountdown(event.startsAt, now);
  return <section className="section section-blush"><p className="eyebrow">Every moment brings us closer</p><h2 className="section-title">Counting Down to the Celebration</h2><div className="countdown" aria-label="Time until the celebration">{Object.entries(values).map(([label, value]) => <div className="countdown-cell" key={label}><div className="countdown-number">{now === null ? "—" : String(value).padStart(2, "0")}</div><div className="countdown-label">{label}</div></div>)}</div></section>;
}
function Index() {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.setAttribute("data-visible", "true"); observer.unobserve(entry.target); }
    }), { threshold: 0.06 });
    document.querySelectorAll(".section").forEach(section => { section.setAttribute("data-reveal", "true"); observer.observe(section); });
    return () => observer.disconnect();
  }, []);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  function downloadCalendar() { const url = URL.createObjectURL(new Blob([calendarContent()], { type: "text/calendar" })); const a = document.createElement("a"); a.href = url; a.download = `${event.brideName}-celebration.ics`; a.click(); URL.revokeObjectURL(url); }
const details = [
  {
    icon: CalendarDays,
    label: "Date & Time",
    value: `${event.weekday}, ${event.date} · ${event.time}`,
    note: event.timeNote,
  },
  {
    icon: MapPin,
    label: "Venue & Location",
    value: event.venue,
    note: event.location,
  },
];
  return <>
    <header className="invitation-header"><div className="brand"><Flower2 aria-hidden="true" /><span>With love, {event.brideName}</span></div><nav className="header-nav" aria-label="Invitation sections"><a className="nav-link" href="#celebration">The Celebration</a><a className="nav-link" href="#dress-code">Dress Code</a><Button variant="invitation" className="header-button" onClick={() => scrollTo("rsvp")}>RSVP <ArrowUpRight /></Button></nav></header>
    <main>
      <section className="cover">
       <img
  className="cover-photo"
  src={event.images.hero}
  alt="Bride to Be invitation"
  fetchPriority="high"
/>
        <div className="cover-content"><h1>Bride to Be</h1><p className="bride-name">{event.brideName}</p><Ornament /><p className="cover-subtitle">Before she says I do, let's celebrate her!</p><Button variant="invitation" onClick={() => scrollTo("invitation")}><Heart />Open Your Invitation</Button></div>
        <div className="scroll-cue" aria-hidden="true">A LITTLE LOVE AWAITS<ArrowDown /></div>
      </section>
      <section id="invitation" className="section message-section"><p className="eyebrow">For our beautiful bride-to-be</p><h2 className="message-title">One last celebration before forever begins.</h2>
      <div className="message-frame">
  <p className="section-copy" dir="rtl">
    نجتمع اليوم لنحتفل بالحب، والفرح، والصداقة،
    وبعروستنا الجميلة التي تستحق كل الحب.
  </p>

  <p className="section-copy mt-5" dir="rtl">
    يوم مميّز لامرأة مميّزة،
    محاطة بأحبّ الناس إلى قلبها.
  </p>
</div></section>
      <section id="celebration" className="section section-blush"><p className="eyebrow">Save a little time for something lovely</p><h2 className="section-title">The Celebration</h2><p className="section-copy">Good company. A little bubbly. A whole lot of love.</p><div className="detail-grid">
  {details.map(({ icon: Icon, label, value, note }, index) => (
    <article key={label} className="detail-card">
      <Icon />
      <h3>{label}</h3>
      <p>{value}</p>
      <small>{note}</small>

      {index === 1 && (
        <Button variant="invitationOutline" asChild>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapsQuery)}`}
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
</div></section>
      <Countdown />
      <section id="dress-code" className="section"><p className="eyebrow">The dress code</p><h2 className="section-title">{event.dressCode}</h2><p className="section-copy">{event.dressDescription}</p><img className="mood-image" src={event.images.mood} alt="Blush silk dress, roses, pearl accessories, champagne glasses and an elegant cake" loading="lazy" /><div className="swatches">{["Pink", "Blush", "Nude", "Champagne"].map(color => <div key={color}><div className={`swatch swatch-${color.toLowerCase()}`} /><span>{color}</span></div>)}</div></section>
      <InvitationRsvp />
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
      <section className="section closing"><img className="closing-florals" src={event.images.hero} loading="lazy" alt="" /><Wine className="mx-auto mb-6 h-7 w-7 text-gold" strokeWidth={1} /><h2 className="section-title">Here's to love, laughter,<br />and a lifetime of happiness!</h2><p className="section-copy">Can't wait to celebrate with you!</p><p className="closing-name">With love, {event.brideName}</p><Ornament /><p className="footer-note">A LITTLE CELEBRATION. A BEAUTIFUL BEGINNING.</p></section>
    </main>
    <Dialog open={photo !== null} onOpenChange={open => { if (!open) setPhoto(null); }}><DialogContent className="max-w-4xl"><DialogTitle className="sr-only">Bridal inspiration photograph</DialogTitle>{photo && <img src={photo} alt="Bridal celebration inspiration" className="max-h-[80svh] w-full object-contain" />}</DialogContent></Dialog>
  </>;
}

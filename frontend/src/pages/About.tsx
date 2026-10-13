import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { waLink, telLink, mapsLink } from "../utils/contact";

export default function About() {
  const { settings } = useSiteSettings();

  const brothers = [
    {
      name: settings?.brother_one_name,
      role: settings?.brother_one_role,
      bio: settings?.brother_one_bio,
      photo: settings?.brother_one_photo,
    },
    {
      name: settings?.brother_two_name,
      role: settings?.brother_two_role,
      bio: settings?.brother_two_bio,
      photo: settings?.brother_two_photo,
    },
  ];

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">Our story</p>
        <h1 className="mt-2 font-display text-4xl text-cream md:text-5xl">
          {settings?.business_name || "Brothers Photography"}
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-cream-dim">
          {settings?.intro_text ||
            "Brothers Photography is run by two brothers who share one obsession: turning your biggest days into images worth keeping. Real details about our journey will appear here once added by the studio."}
        </p>

        {settings?.logo && (
          <div className="mt-10 max-w-md overflow-hidden rounded-2xl border border-line">
            <img src={settings.logo} alt="The Brothers Photography team" className="w-full object-cover" />
          </div>
        )}

        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {brothers.map((brother, i) => (
            <div key={i} className="rounded-2xl border border-line bg-panel p-6">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-panel-soft">
                {brother.photo && (
                  <img src={brother.photo} alt={brother.name || ""} className="h-full w-full object-cover" />
                )}
              </div>
              <p className="mt-5 font-display text-2xl text-cream">
                {brother.name || `Brother ${i + 1}`}
              </p>
              <p className="text-sm text-gold-soft">{brother.role || "Photographer"}</p>
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                {brother.bio || "Bio coming soon."}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-line bg-panel-soft p-8">
          <p className="font-display text-2xl text-cream">A message to our customers</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-cream-dim">
            Every family, couple and milestone we photograph gets our full attention — from the first
            phone call to the final edited gallery. Reach out any time; we're always happy to talk
            through your event before you book.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {settings?.phone_number && (
              <a href={telLink(settings.phone_number)}>
                <Button variant="outline">Call {settings.phone_number}</Button>
              </a>
            )}
            {settings?.alternate_phone_number && (
              <a href={telLink(settings.alternate_phone_number)}>
                <Button variant="outline">Call {settings.alternate_phone_number}</Button>
              </a>
            )}
            {settings?.whatsapp_number && (
              <a
                href={waLink(settings.whatsapp_number, "Hi Brothers Photography, I'd like to know more about you.")}
                target="_blank"
                rel="noreferrer"
              >
                <Button>Drop us a message</Button>
              </a>
            )}
            {settings?.address && (
              <a
                href={mapsLink(settings.google_maps_url, settings.address)}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="ghost">View location</Button>
              </a>
            )}
          </div>
          {settings?.address && <p className="mt-4 text-sm text-cream-dim">{settings.address}</p>}
        </div>
      </section>
    </Layout>
  );
}

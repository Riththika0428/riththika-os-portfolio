import PageHeader from "@/components/ui/PageHeader";
import TerminalWindow from "@/components/ui/TerminalWindow";
import ContactInfoPanel from "@/components/sections/contact/ContactInfoPanel";
import ContactForm from "@/components/sections/contact/ContactForm";
import ClosingTerminal from "@/components/sections/contact/ClosingTerminal";
import { getSiteSettings } from "@/lib/content";
import { normalizeSettings } from "@/lib/siteSettings";

export const metadata = {
  title: "Contact · Riththika OS",
  description: "Get in touch with Riththika Baskaran.",
};

export default async function ContactPage() {
  const { data } = await getSiteSettings();
  const settings = normalizeSettings(data);

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-[1280px] mx-auto">
      <div className="flex flex-col gap-3">
        <PageHeader index="06" label="CONTACT" title="Let's Connect" />
        <p className="text-text-body text-base max-w-xl">
          Have an opportunity, project idea or just want to say hello?
        </p>
      </div>

      <TerminalWindow title="connect --me" shadow="terminal" bodyClassName="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 p-6 lg:p-8 lg:border-r border-border">
            <ContactInfoPanel settings={settings} />
          </div>
          <div className="lg:col-span-7 p-6 lg:p-8">
            <ContactForm />
          </div>
        </div>
      </TerminalWindow>

      <ClosingTerminal />
    </div>
  );
}
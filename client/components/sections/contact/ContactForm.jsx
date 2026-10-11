"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { apiPost } from "@/lib/api";

const inputClasses =
  "w-full bg-elevated border border-border rounded-control px-4 py-2.5 text-sm text-text-heading placeholder:text-text-muted outline-none focus:border-cyan/50 transition-colors";

const EMPTY = { name: "", email: "", subject: "", message: "" };

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const handleChange = (field) => (e) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const { error } = await apiPost("/contact", values);
    if (error) {
      setError(error);
      setStatus("error");
      return;
    }
    setValues(EMPTY);
    setStatus("sent");
  }

  const note =
    status === "sent"
      ? "Message sent. Thank you!"
      : status === "error"
        ? error
        : "I'll reply by email.";
  const noteColor =
    status === "sent" ? "text-mint" : status === "error" ? "text-danger" : "text-text-muted";

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Send a Message" comment="CONTACT_FORM" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-text-muted text-xs">Your Name</span>
            <input required maxLength={120} type="text" value={values.name} onChange={handleChange("name")} placeholder="e.g. Alex Rivera" className={inputClasses} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-text-muted text-xs">Email</span>
            <input required type="email" value={values.email} onChange={handleChange("email")} placeholder="alex@company.com" className={inputClasses} />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-text-muted text-xs">Subject</span>
          <input type="text" maxLength={200} value={values.subject} onChange={handleChange("subject")} placeholder="Internship opportunity / project inquiry" className={inputClasses} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-text-muted text-xs">Message</span>
          <textarea required rows={5} maxLength={5000} value={values.message} onChange={handleChange("message")} placeholder="Write your message or project requirements here..." className={`${inputClasses} resize-none`} />
        </label>

        <div className="flex items-center justify-between gap-4 pt-1">
          <span role={status === "error" ? "alert" : "status"} className={`text-xs ${noteColor}`}>
            {note}
          </span>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-blue text-white text-sm font-medium px-5 py-2.5 rounded-control shadow-glow-purple hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send Message"}
            <ArrowUpRight className="size-4" strokeWidth={2} />
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

/**
 * فورم "Send us a Message" — كومبوننت client
 * - تحقق بسيط قبل الإرسال (كل الحقول مطلوبة)
 * - إرسال وهمي (الـ API مالوش endpoint رسائل) وبعدين رسالة نجاح خضرا
 */
export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (sent) setSent(false); // لو عدّل بعد النجاح نخفي البانر
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;

    setSending(true);
    // محاكاة إرسال — غيّرها بـ fetch على API بتاعك لما تجهّز endpoint
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 900);
  };

  const inputCls =
    "w-full border border-[#E7E5E1] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-[#B7B2A8] focus:border-[#00B250] focus:ring-2 focus:ring-[#00B250]/20";
  const labelCls = "text-sm font-semibold text-[#14171A] mb-1.5 block";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Full Name + Email Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelCls}>
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={inputCls}
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className={labelCls}>
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          required
          value={form.subject}
          onChange={handleChange}
          className={`${inputCls} ${form.subject ? "text-[#14171A]" : "text-[#8A857B]"}`}
        >
          <option value="" disabled>
            Select a subject
          </option>
          <option value="order">Order Inquiry</option>
          <option value="shipping">Shipping &amp; Delivery</option>
          <option value="returns">Returns &amp; Refunds</option>
          <option value="technical">Technical Support</option>
          <option value="feedback">Feedback</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelCls}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="How can we help you?"
          className={`${inputCls} resize-y`}
        />
      </div>

      {/* رسالة النجاح */}
      {sent && (
        <div className="flex items-center gap-2 bg-[#E8F8EE] border border-[#B9E9CD] text-[#008A5E] rounded-xl px-4 py-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Thank you! Your message has been sent — we&apos;ll get back to you
          within 24 hours.
        </div>
      )}

      {/* Send Button */}
      <button
        type="submit"
        disabled={sending}
        className="bg-[#00B250] hover:bg-[#009E47] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md w-max cursor-pointer"
      >
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Send Message
          </>
        )}
      </button>
    </form>
  );
}

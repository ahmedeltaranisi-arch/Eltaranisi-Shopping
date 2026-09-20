import Image from "next/image";
import Link from "next/link";
import {
  Headphones,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
// ⚠️ lucide-react v1.0 شالت أيقونات البراندات (Facebook/Twitter/Instagram/LinkedIn)
// خالص من المكتبة، فبنجيبهم من react-icons بدالها.
// لازم تتأكد إن المكتبة متركبة: npm install react-icons
import {
  FaFacebook,
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa6";
import ContactForm from "@/app/_components/ContactForm/ContactForm";

/**
 * صفحة Contact Us — مطابقة للصور المرفوعة:
 * - هيدر جرادينت أخضر + breadcrumb (Home / Contact Us) + أيقونة سماعة في بوكس
 * - عمود شمال: كروت Phone / Email / Office / Business Hours + Follow Us
 * - عمود يمين: فورم "Send us a Message" + صندوق "Looking for quick answers?"
 */
export default function ContactPage() {
  const fontStyle = {
    fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
  };

  const infoCards = [
    {
      Icon: Phone,
      title: "Phone",
      lines: ["Mon-Fri from 8am to 6pm"],
      highlight: "+1 (800) 123-4567",
    },
    {
      Icon: Mail,
      title: "Email",
      lines: ["We'll respond within 24 hours"],
      highlight: "support@eltaranisishopping.com",
    },
    {
      Icon: MapPin,
      title: "Office",
      lines: ["123 Commerce Street", "New York, NY 10001", "United States"],
      highlight: "",
    },
    {
      Icon: Clock,
      title: "Business Hours",
      lines: [
        "Monday - Friday: 8am - 6pm",
        "Saturday: 9am - 4pm",
        "Sunday: Closed",
      ],
      highlight: "",
    },
  ];

  // البراندات بقت من react-icons مش lucide-react
  const socials = [
    { Icon: FaFacebook, label: "Facebook" },
    { Icon: FaXTwitter, label: "Twitter" },
    { Icon: FaInstagram, label: "Instagram" },
    { Icon: FaLinkedin, label: "LinkedIn" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F5]" style={fontStyle}>
      {/* ===== Header — نفس ستايل هيدر التصنيفات ===== */}
      <div className="bg-gradient-to-br from-[#009B4D] via-[#1FB85A] to-[#38C25B] text-white py-10 px-4 md:px-10 lg:px-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold mb-6">
            <Link href="/" className="hover:text-white/70 transition-colors">
              Home
            </Link>
            <span className="text-white/60">/</span>
            <span className="font-bold">Contact Us</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl flex items-center justify-center shrink-0">
              <Headphones className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Contact Us
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-[#A3EDC0]">
                We&apos;d love to hear from you. Get in touch with our team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-7xl mx-auto px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* ===== Left: Info cards ===== */}
          <div className="flex flex-col gap-5">
            {infoCards.map(({ Icon, title, lines, highlight }) => (
              <div
                key={title}
                className="bg-white border border-[#E7E5E1] rounded-xl p-5 flex items-start gap-4 hover:shadow-md hover:border-[#B9E9CD] transition-all duration-200"
                data-aos="fade-right"
              >
                <div className="w-10 h-10 rounded-full bg-[#E8F8EE] flex items-center justify-center text-[#00B250] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#14171A]">{title}</h3>
                  {lines.map((line) => (
                    <p
                      key={line}
                      className="text-xs text-[#8A857B] mt-0.5 leading-relaxed"
                    >
                      {line}
                    </p>
                  ))}
                  {highlight && (
                    <p className="text-sm font-bold text-[#00B250] mt-1.5 break-all">
                      {highlight}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Follow Us */}
            <div
              className="bg-white border border-[#E7E5E1] rounded-xl p-5"
              data-aos="fade-right"
            >
              <h3 className="text-sm font-bold text-[#14171A] mb-3">
                Follow Us
              </h3>
              <div className="flex items-center gap-2.5">
                {socials.map(({ Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-[#F1F2F4] flex items-center justify-center text-[#8A857B] hover:bg-[#E8F8EE] hover:text-[#00B250] transition-colors cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Right: Form + Help box ===== */}
          <div className="flex flex-col gap-6">
            <div
              className="bg-white border border-[#E7E5E1] rounded-xl p-6 md:p-8"
              data-aos="fade-left"
            >
              {/* رأس الفورم */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EE] flex items-center justify-center text-[#00B250] shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#14171A]">
                    Send us a Message
                  </h2>
                  <p className="text-xs text-[#8A857B] mt-0.5">
                    Fill out the form and we&apos;ll get back to you
                  </p>
                </div>
              </div>

              <ContactForm />
            </div>

            {/* Looking for quick answers */}
            <div
              className="bg-[#E8F8EE] border border-[#CDEEDB] rounded-xl p-5 flex items-start gap-4"
              data-aos="fade-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00B250] flex items-center justify-center text-white shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14171A]">
                  Looking for quick answers?
                </h4>
                <p className="text-xs text-[#8A857B] mt-1 leading-relaxed">
                  Check out our Help Center for frequently asked questions
                  about orders, shipping, returns, and more.
                </p>
                <Link
                  href="/contact"
                  className="inline-block mt-2 text-xs font-bold text-[#00B250] hover:underline underline-offset-4"
                >
                  Visit Help Center →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

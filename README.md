# Eltaranisi Shopping 🛒

متجر إلكتروني مبني بـ **Next.js 15 (App Router)** فوق واجهة [RouteMisr](https://ecommerce.routemisr.com) — فيه منتجات، تصنيفات، ماركات، سلة، wishlist، طلبات، ودفع أونلاين.

## التقنيات

- **Next.js 15** + React 19 + TypeScript
- **NextAuth** (Credentials) — الجلسات JWT والتوكن بيفضل على السيرفر
- **TanStack Query** — إدارة الكاش والتحديث اللحظي للسلة والـ wishlist
- **Tailwind CSS v4** + shadcn/ui components
- **Zod** + React Hook Form — تحقق من صحة الفورمات

## التشغيل محلياً

```bash
# 1) نسخ ملف البيئة وتعبئته
cp .env.example .env.local
# NEXTAUTH_SECRET ولّده بـ: openssl rand -base64 32

# 2) تثبيت الحزم وتشغيل السيرفر
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

## السكربتات

| السكربت | الوظيفة |
|---|---|
| `npm run dev` | تشغيل سيرفر التطوير |
| `npm run build` | بناء المشروع للإنتاج |
| `npm run start` | تشغيل نسخة الإنتاج |
| `npm run lint` | فحص الكود بـ ESLint |

## البنية

```
src/
├── app/                  # صفحات الـ App Router
│   ├── api/
│   │   ├── auth/         # NextAuth
│   │   ├── cart/         # قراءة السلة (بوكسي للـ API)
│   │   └── ext/          # 🔒 بروكسي آمن للـ API الخارجي (v1/v2)
│   ├── actions/          # Server Actions (سلة + wishlist + تسجيل)
│   └── ...الصفحات
├── components/           # كمبوننتات مشتركة (Footer, ui/)
├── lib/
│   ├── api.ts            # إعدادات واستدعاءات API من السيرفر
│   ├── api-client.ts     # استدعاءات API من المتصفح (عن طريق /api/ext)
│   ├── auth-options.ts   # إعدادات NextAuth
│   └── server-token.ts   # قراءة توكن الجلسة على السيرفر
├── services/             # خدمات التصنيفات والمنتجات
└── types/                # أنواع TypeScript (منتجات، تصنيفات، next-auth)
```

## ملاحظات أمان

- التوكن (JWT) **مش بيتحفظ في localStorage** — بيتحط في NextAuth session cookie (httpOnly) وكل استدعاءات الـ API الخارجي بتم من السيرفر عن طريق `/api/ext/*`.
- ملفات `.env*` كلها في `.gitignore` (ماعدا `.env.example`).

## الـ CI

أي push أو PR بيشغّل GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): ESLint + TypeScript check + Build.

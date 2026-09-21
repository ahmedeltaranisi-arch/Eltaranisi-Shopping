# 🔍 مراجعة مشروع Eltaranisi-Shopping

> تاريخ المراجعة: 2026-09-21
> الفحص تشمل: قراءة كل ملفات المشروع + `npx tsc --noEmit` + `npx eslint .` + `npm run build`

## نظرة عامة

مشروع Next.js 15 (App Router) + NextAuth + TanStack Query لتسوق أونلاين فوق API بتاع RouteMisr.
الكود فيه شغل كويس (Optimistic updates, fallback chains, RTL-ready comments…) بس فيه **مشاكل حقيقية مؤكدة** — أغلبها مخفي بسبب إعدادين في `next.config.ts` بيتجاهلوا كل الأخطاء وقت الـ build.

---

## 🔴 أولوية قصوى — أخطاء مؤكدة (Fix Now)

### 1. ESLint واقف تماماً — مش شغال خالص
**الملف:** `eslint.config.mjs`
- بينده `eslint-config-next/typescript` من غير `.js` → الخطأ اللي بيطلع فعلياً:
  `Cannot find module 'eslint-config-next/typescript' — Did you mean "eslint-config-next/typescript.js"?`
- وكمان بيستخدم `...nextVitals` بينما المتغير المستورد اسمه `coreWebVitals` → `ReferenceError` حتى لو الـ import اتصلح.
- **الدليل:** `npx eslint .` بيطلع "Oops! Something went wrong".

```js
// ✅ الشكل الصح:
import coreWebVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

const eslintConfig = defineConfig([
  ...coreWebVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

### 2. `ignoreBuildErrors` + `ignoreDuringBuilds` بيخبّوا 47 خطأ TypeScript حقيقي
**الملف:** `next.config.ts`

```ts
typescript: { ignoreBuildErrors: true },  // ❌ شيله
eslint: { ignoreDuringBuilds: true },    // ❌ شيله
```

**الدليل:** `npx tsc --noEmit` رجّع **47 خطأ** — ودي أهمها:

| الملف | المشكلة |
|---|---|
| `actions/authActions.ts` | بينده `userData` من `RegisterSchema` — **الـ export ده مش موجود** |
| `brands/page.tsx` + `brandDetails/[id]/page.tsx` | بينادوا `brandType` من `services/types/brandType` — **مش موجود** (الملف بيصدّر `prodType` فقط) |
| `checkout/page.tsx:401` | `addresses.find(...)` ممكن ترجع `undefined` → `addressDetails(a)` هيعمل **runtime crash** |
| `CartComp.tsx` (~30 خطأ) | استخدام `session.accessToken` / `session.jwt` مش موجودين في الـ types + `Error.status` غير معرّف + أنواع `never` في الـ modal state |
| `checkout/orders` | regex flag `/s` محتاج `target: ES2018+` والـ tsconfig على `ES2017` |
| `profile/settings/page.tsx` | `d.id ?? d._id` بيترمي كـ `{}` مش `string` |

### 3. لينك `/settings` في الـ Navbar → 404
**الملف:** `Navbar/Navbar.jsx` — `profileLinks`
- `href: "/settings"` → **الصفحة مش موجودة** (الحقيقية `/profile/settings`).
- وكمان "My Profile" و"Addresses" الاتنين بيودوا على نفس الرابط `/profile/addresses` (لينك مكرر/غلط).

### 4. إجمالي السطر غلط في Checkout (Order Summary)
**الملف:** `checkout/page.tsx` — الـ items list

```
{it.count} × {formatMoney(it.unitPrice)} EGP     ← صح
{formatMoney(it.unitPrice)}                      ← ❌ ده سعر الوحدة!
```
لو المستخدم خد 3 قطع بـ 100 جنيه بيعرض "3 × 100" و**الإجمالي جنبه 100** بدل 300.
(الـ subtotal في الأسفل محسوب صح بس العرض بتاع كل سطر غلط.)

### 5. كل الأخطاء بتتحوّل لـ "Unauthorized"
**الملفات:** `actions/cartActions/addToCart.ts` + كل `wishlistActions/*`

```ts
catch (error) {
  throw new Error("Unauthorized"); // ❌ حتى لو الخطأ Network / 500 / timeout
}
```
المستخدم هيتشاف "سجل دخول" وهو مسجل أصلاً، والسبب الحقيقي بيضيع. لازم تفرّق بين 401 وباقي الأخطاء وتمرّر `payload.message`.

### 6. مismatch بين API v1 و v2 للسلة
- **الإضافة** (`AddBtn` → `addToCart`) بتروح على **`/api/v2/cart`** ❌
- **القراءة** (`/api/cart` route + CartComp GET) من **`/api/v1/cart`**
- **التعديل/الحذف** (CartComp) بيجرب v1 ثم v2
- **Checkout** بيجرب v1 ثم v2

لو الـ endpoint دول بيرجعوا كارتين مختلفتين (وده بيحصل في RouteMisr بين v1/v2) السلة هتتفاوت بين الصفحات. **وحّد كل حاجة على version واحد.**

### 7. `productDetails/[id]` بيضرب crash بدل 404
**الملف:** `productDetails/[id]/page.tsx`

```ts
const payload = await response.json();
return payload.data; // ❌ لو id غلط → undefined → الصفحة كلها تنهار
```
مفيش `response.ok` check، ومفيش `notFound()`. كمان `getAllProducts()` بيجيب **كل** المنتجات كـ "You May Also Like" من غير فلترة (حتى نفس المنتج ممكن يظهر) ومن غير limit.

### 8. أزرار Social Login وهمية + Toaster مكرر
- `Login/page.tsx` و `Register/page.tsx`: أزرار Google / Facebook / GitHub **من غير أي onClick** — المستخدم يدوس ومفيش حاجة بتحصل (ده UX مخيب وبيوحي بحاجة مش شغالة).
- الاتنين بيضيفوا `<Toaster>` تاني بينما `layout.tsx` عنده Toaster أصلاً → **التوست بيظهر مرتين**.

### 9. `userName = session?.user?.name || "Ahmed"`
**الملف:** `Navbar/Navbar.jsx` — أي مستخدم من غير اسم هيظهر له **"Ahmed"** في الهيدر. المفروض fallback على "My Account" مثلاً.

### 10. Metadata ناقصة/غلطة
**الملف:** `layout.tsx`
- `apple: "/apple-icon.png"` → **الملف مش موجود** في `public/` → 404.
- الوصف: `"Website Shoping"` (Typo + ضعيف جداً لـ SEO).
- مفيش `metadataBase` / Open Graph / Twitter cards / `sitemap.ts` / `robots.ts`.
- مفيش `generateMetadata` في صفحات المنتجات (المنتج بيشارك لينك من غير صورة/عنوان).

---

## 🟠 أولوية عالية — أمان

### 11. الـ JWT بيتحفظ في localStorage (خطر XSS)
**الملف:** `_apis/profile.api.ts` → `setAuthToken()`

```ts
window.localStorage.setItem("token", token); // ❌ AuthBridge بيعمل كده بكل session
```
أي سكربت خبيث (XSS) هيقدر يسرق التوكن. الحل:
- اعتمد على **NextAuth session cookie (httpOnly)** بس.
- كل نداءات الـ API الخارجي تتم **من السيرفر** (server actions / route handlers) — التوكن يفضل على السيرفر.

### 12. 3 نسخ مكررة من "ماسح التوكن" بتدور في localStorage كله
`checkout/page.tsx` + `orders/page.tsx` + `profile.api.ts` — كل واحد فيهم بيمسح **كل** localStorage و cookies ويبعت **أي قيمة شكلها JWT**. كود مكرر + هش + خطر. المفروظ مصدر واحد للتوكن (`getTokenFun` اللي موجود في `utilites/getTokenDate.ts` أصلاً).

### 13. التوكن بيتبعت من البراوزر مباشرة للـ API الخارجي
**الملف:** `CartComp.tsx` — PUT/DELETE مباشرة على `ecommerce.routemisr.com` بـ header `token` من الجافاسكربت. ده:
- بيكشف التوكن في الـ Network tab.
- معتمد على CORS بتاع طرف تالت (لو غيّروه النهارده السلة كلها تقع).
- بيتجاوز الـ `/api` proxy بتاعك لنفسه (منطق مقلوب: قراءة من السيرفر، كتابة من البراوزر).

### 14. مفيش validation في Server Actions
`addToCart(prodId: string)` و `removeFromWishlist(prodId)` بيتبعتوا كما هم للـ API من غير zod validation. الـ Server Actions endpoints عامة على الإنترنت — لازم تتحقق من شكل الـ id قبل الاستدعاء.

### 15. `.gitignore` مش مغطي `.env`
مغطي `.env*.local` بس. لو حد عمل `.env` (والمشروع محتاج `NEXTAUTH_SECRET`) هيتpush بالغلط. ضيف `.env*` + `.env.example` فاضي للتوثيق.

---

## 🟡 أولوية متوسطة — بنية الكود والصيانة

| # | المشكلة | الملفات | الحل |
|---|---|---|---|
| 16 | الـ API URL مكرر في **20 ملف** كنص ثابت | كل الصفحات والأكشنز | `src/lib/api.ts` واحد + `process.env.API` / `NEXT_PUBLIC_API_URL` |
| 17 | `src/app/allorders/route.ts` — route غريب على `/allorders` بيعمل redirect لـ `/orders` | `allorders/route.ts` | احذفه، ولو محتاج redirect حطه في `next.config.ts` → `redirects()` |
| 18 | `src/Footer/page.tsx` — "page.tsx" برّه مجلد app واسمها مضلل | `src/Footer/` | انقلها `src/components/Footer.tsx` |
| 19 | تنظيم المجلدات: `Types/` (بروفة كبيرة) + `src/utilites` (typo: utilities) + `interface/` و `services/` جوّه `app/` + `next-auth/` جوّه `app/` | متفرقة | `src/types/`, `src/lib/`, `src/services/` — وانقل `authOption.ts` برّه `app/` |
| 20 | كود ميّت: `actions/loginAction.ts` (محدش بيستخدمه — اللوجين ماشي بـ nextAuth `signIn`) + comment block ضخم معلّق في `Types/next-auth.d.ts` + كود تجريبي معلّق في `api/brands/route.ts` | — | احذفهم |
| 21 | `tsconfig.json` include فيه `src/app/api/services/productType.tsx` — **الملف ده مش موجود** + إدخالات مكررة مولدة تلقائياً | `tsconfig.json` | رتّب الـ include |
| 22 | `package.json`: الاسم `app1`، و`eslint-config-next` في `dependencies` (المفروض dev)، و`shadcn` + `cn` packages مش مستخدمين (عندك `cn()` في `lib/utils` و shadcn بيشتغل `npx shadcn`) | `package.json` | نضّفه |
| 23 | `middleware.ts`: قوائم مكررة (`/Cart` و `/cart`، `/wishList` و `/wishlist`) وmatcher ناقص `/wishList` — و `/brands` محمي بالوجين والـ navbar بيعرضه للجميع (ممكن يكون مش مقصود) | `src/middleware.ts` | وحّد الحروف (حوّل كل الروابط lowercase مع redirect) وتأكد من حماية brands |
| 24 | `tsconfig` `target: ES2017` مع regex flag `/s` (محتاج ES2018+) | `tsconfig.json` | `target: "ES2022"` |
| 25 | README لسه الديفولت بتاع `create-next-app` — مفيش أي توثيق للمشروع أو الـ env vars المطلوبة (`NEXTAUTH_SECRET`, `API`) | `README.md` | اكتبه من الأول |
| 26 | كمبوننتات `.jsx` (Navbar, SearchBar, WishlistComp, WishlistControls, contact) جوّه مشروع TS — أي حاجة فيهم `any` ضمني ومن غير types | متفرقة | حوّلها `.tsx` بالتدريج |

---

## 🟢 تحسينات مقترحة (نحسّنات نضيفها)

### أمان وأداء
1. **حوّل كل نداءات الـ API للسيرفر** (أهم تحسين معماري): التوكن يفضل على السيرفر، والبراوزر يكلم `/api/*` بتوعك بس.
2. **شيل `unoptimized` من كل `<Image>`** — كونفق `remotePatterns` موجود أصلاً، والصور هتتحسن (WebP + sizes + lazy). ولو هتسيبه يبقى الكونفق مالوش لازمة.
3. `<img>` في `SearchBar.jsx` و`Login/page.tsx` → `next/image` (Login بيسحب صورة من `freshcart.codescandy.com` — hotlink لدومين غريب، انزلها `public/`).
4. البحث بيجيب **الكتالوج كله client-side** (دقيق دلوقتي لـ 56 منتج) — لو الكتالوج كبر حوّله لـ `route handler` + بحث على السيرفر.
5. **الـ IDs الثابتة** للتصنيفات في Navbar/Footer (`6439d2d1...`) — اجيبها من `getCategories()` (عندك السيرفس جاهز) بدل الهاردكود.

### SEO
6. `generateMetadata` ديناميكي للمنتجات والتصنيفات (title/description/OG image من الـ API).
7. `sitemap.ts` + `robots.ts` + `metadataBase` + JSON-LD (Product schema) لكروت المنتجات.
8. صفحات `Login/Register` لازم `robots: { index: false }`.

### UX
9. **سوشيال لوجين حقيقي أو احذف الأزرار** — الديزاين بيصرخ إن في سوشيال لوجين بس مفيش.
10. Skeleton loading بدل السبينر الوحيد في الصفحات الثقيلة (products/orders).
11. `error.tsx` عام على مستوى الـ app (دلوقتي موجود بس في products و productDetails) + `global-error.tsx`.
12. لو هتعمل نسخة عربية: `next-intl` + `lang="rtl"` — الكومنتات كلها عربي فالموقع غالباً موجه لمصر.

### جودة الكود
13. **GitHub Action CI**: `lint + tsc --noEmit + build` على كل PR — ده اللي كان هيلقط كل اللي فوق.
14. اختبارات: Playwright smoke test على رحلة (تسجيل → إضافة للسلة → checkout).
15. zod schemas للـ server actions زي ما عملت في Login/Register بالظبط.

---

## 📋 خطة الإصلاح المقترحة (بالترتيب)

| المرحلة | الشغل | الوقت التقريبي |
|---|---|---|
| **1 — إطفاء الحريقة** | إصلاح eslint.config + شيل ignoreBuildErrors + إصلاح الـ 47 TS error + لينك /settings + إجمالي السطر في checkout + رمي أخطاء حقيقية بدل "Unauthorized" | صغيرة |
| **2 — أمان** | وقف تخزين التوكن في localStorage + تحويل نداءات السلة للسيرفر + توحيد v1/v2 + `.env.example` | متوسطة |
| **3 — ترتيب** | `lib/api.ts` موحد + نقل الملفات لمكانها + حذف الميّت + package.json + README | متوسطة |
| **4 — تحسينات** | SEO (metadata/sitemap/JSON-LD) + الصور + سوشيال لوجين/حذفه + CI | متوسطة |

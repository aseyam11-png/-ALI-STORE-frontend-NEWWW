import Image from "next/image";
import Link from "next/link";

import { HERO_SLIDES } from "@/components/commerce/home-imagery";

const screens = [
  {
    id: "home",
    title: "الرئيسية",
    eyebrow: "HOME",
    description: "واجهة اكتشاف تجارية مختصرة: Hero عريض، أقسام داخل الصورة، ثم المنتجات والثقة وAsk Ali.",
  },
  {
    id: "products",
    title: "المنتجات",
    eyebrow: "CATALOG",
    description: "بحث وفلاتر واضحة مع شبكة منتجات مركزة، بدون ازدحام بصري.",
  },
  {
    id: "product",
    title: "تفاصيل المنتج",
    eyebrow: "PRODUCT",
    description: "صور المنتج، السعر، التوفر، الشحن، المعلومات الأساسية، والشراء في مساحة واحدة.",
  },
  {
    id: "cart",
    title: "السلة",
    eyebrow: "CART",
    description: "ملخص الطلب على اليمين ومحتويات السلة على اليسار مع CTA واضح للمتابعة.",
  },
  {
    id: "account",
    title: "حسابي",
    eyebrow: "BUYER",
    description: "مركز الحساب: الطلبات، المفضلة، العناوين، الملف الشخصي، والأمان.",
  },
  {
    id: "auth",
    title: "تسجيل الدخول",
    eyebrow: "AUTH",
    description: "واجهة دخول نظيفة، ثقة بصرية، وبدون عناصر مشتتة.",
  },
];

const products = [
  { name: "ساعة فاخرة", price: "$129.00", image: HERO_SLIDES[0].image },
  { name: "ملابس مختارة", price: "$64.00", image: HERO_SLIDES[1].image },
  { name: "أحذية مميزة", price: "$89.00", image: HERO_SLIDES[2].image },
  { name: "إكسسوارات", price: "$42.00", image: HERO_SLIDES[3].image },
];

function ProductMini({ product }: { product: (typeof products)[number] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="relative aspect-square bg-neutral-100">
        <Image src={product.image} alt="" fill sizes="180px" className="object-cover" />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-neutral-900">{product.name}</p>
        <p className="mt-1 text-sm font-bold text-orange-600">{product.price}</p>
      </div>
    </div>
  );
}

function HeaderMock() {
  return (
    <div className="rounded-t-2xl border border-neutral-200 bg-white">
      <div className="flex h-8 items-center justify-between border-b border-neutral-100 px-4 text-[9px] text-neutral-400">
        <span>شحن موثوق • دعم العملاء</span>
        <span>ALI STORE</span>
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="text-base font-black text-neutral-950">
          ALI<span className="text-orange-600">STORE</span>
        </div>
        <div className="flex h-8 flex-1 items-center rounded-lg border border-neutral-200 px-3 text-[10px] text-neutral-400">
          ابحث عن منتج، SKU، فئة أو استخدم البحث بالصور...
        </div>
        <div className="h-8 w-8 rounded-lg bg-neutral-950" />
      </div>
      <div className="flex gap-5 border-t border-neutral-100 px-4 py-2 text-[9px] font-semibold text-neutral-500">
        <span className="text-orange-600">الرئيسية</span>
        <span>المنتجات</span>
        <span>العروض</span>
        <span>البحث بالصور</span>
        <span>التصنيفات</span>
      </div>
    </div>
  );
}

function ScreenFrame({ screen }: { screen: (typeof screens)[number] }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-sm">
      <div className="border-b border-neutral-200 bg-white px-5 py-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-orange-600">{screen.eyebrow}</p>
            <h2 className="mt-1 text-xl font-black text-neutral-950">{screen.title}</h2>
          </div>
          <p className="max-w-md text-right text-xs leading-5 text-neutral-500">{screen.description}</p>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <HeaderMock />

          {screen.id === "home" ? (
            <div className="space-y-3 bg-neutral-50 p-3">
              <div className="relative overflow-hidden rounded-xl bg-neutral-950">
                <div className="relative aspect-[6/1] min-h-[150px]">
                  <Image src={HERO_SLIDES[0].image} alt="" fill sizes="100vw" className="object-cover opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-l from-neutral-950/80 via-neutral-950/20 to-transparent" />
                  <div className="absolute inset-y-0 end-5 flex max-w-[190px] flex-col justify-center text-right text-white">
                    <span className="text-[9px] text-white/60">مختارات ALI STORE</span>
                    <strong className="mt-1 text-lg">ساعات فاخرة</strong>
                    <button className="mt-2 w-fit self-end rounded-full bg-white px-3 py-1.5 text-[9px] font-bold text-neutral-950">
                      اكتشف الآن
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-neutral-950/85 px-2 py-2">
                    <div className="flex gap-1.5 overflow-hidden">
                      {["الملابس", "الأحذية", "الساعات", "الإكسسوارات", "جميع المنتجات"].map((item, index) => (
                        <div key={item} className="relative h-9 min-w-[82px] overflow-hidden rounded-md bg-neutral-800 px-2 py-2 text-[8px] font-bold text-white">
                          <Image src={HERO_SLIDES[index % HERO_SLIDES.length].image} alt="" fill sizes="100px" className="object-cover opacity-45" />
                          <span className="relative z-10">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {products.map((product) => <ProductMini key={product.name} product={product} />)}
              </div>
            </div>
          ) : screen.id === "products" ? (
            <div className="grid gap-3 bg-neutral-50 p-3 md:grid-cols-[180px_1fr]">
              <aside className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="h-3 w-20 rounded bg-neutral-200" />
                <div className="mt-4 space-y-2">
                  {["الفئة", "السعر", "التوفر", "التقييم", "الشحن"].map((x) => (
                    <div key={x} className="flex items-center justify-between rounded-lg bg-neutral-50 px-2 py-2 text-[9px] text-neutral-600">
                      <span>{x}</span><span>⌄</span>
                    </div>
                  ))}
                </div>
              </aside>
              <main>
                <div className="mb-3 flex items-center justify-between">
                  <div><p className="text-sm font-black">كل المنتجات</p><p className="text-[9px] text-neutral-400">124 منتج</p></div>
                  <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[9px] text-neutral-500">الأحدث ↓</div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{products.map((product) => <ProductMini key={product.name} product={product} />)}</div>
              </main>
            </div>
          ) : screen.id === "product" ? (
            <div className="grid gap-5 bg-neutral-50 p-4 md:grid-cols-2">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                <Image src={HERO_SLIDES[2].image} alt="" fill sizes="500px" className="object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="w-fit rounded-full bg-orange-50 px-2 py-1 text-[9px] font-bold text-orange-600">موصى به</span>
                <h3 className="mt-2 text-2xl font-black">حذاء مميز</h3>
                <p className="mt-2 text-xs leading-5 text-neutral-500">تفاصيل المنتج، المصدر، التوفر والشحن في مكان واضح.</p>
                <div className="mt-5 text-2xl font-black text-orange-600">$89.00</div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="rounded-xl bg-neutral-950 py-3 text-xs font-bold text-white">أضف للسلة</button>
                  <button className="rounded-xl border border-neutral-200 bg-white py-3 text-xs font-bold">♡ المفضلة</button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[8px] text-neutral-500">
                  <div className="rounded-lg bg-white p-2">متوفر</div><div className="rounded-lg bg-white p-2">شحن موثوق</div><div className="rounded-lg bg-white p-2">دعم</div>
                </div>
              </div>
            </div>
          ) : screen.id === "cart" ? (
            <div className="grid gap-3 bg-neutral-50 p-4 md:grid-cols-[1fr_260px]">
              <div className="space-y-2">
                {products.slice(0, 2).map((product) => (
                  <div key={product.name} className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg"><Image src={product.image} alt="" fill sizes="80px" className="object-cover" /></div>
                    <div className="flex-1"><p className="text-sm font-bold">{product.name}</p><p className="mt-1 text-xs text-neutral-400">الكمية 1</p><p className="mt-2 text-sm font-black text-orange-600">{product.price}</p></div>
                  </div>
                ))}
              </div>
              <aside className="rounded-xl border border-neutral-200 bg-white p-4">
                <p className="text-sm font-black">ملخص الطلب</p>
                <div className="mt-4 space-y-2 text-xs text-neutral-500"><div className="flex justify-between"><span>المجموع</span><b>$193.00</b></div><div className="flex justify-between"><span>الشحن</span><b>يحسب لاحقًا</b></div></div>
                <button className="mt-5 w-full rounded-xl bg-neutral-950 py-3 text-xs font-bold text-white">متابعة الدفع</button>
              </aside>
            </div>
          ) : screen.id === "account" ? (
            <div className="grid gap-3 bg-neutral-50 p-4 md:grid-cols-[190px_1fr]">
              <aside className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-black">حسابي</p>
                <div className="mt-3 space-y-1">{["نظرة عامة", "طلباتي", "المفضلة", "العناوين", "الملف الشخصي", "الأمان"].map((x, i) => <div key={x} className={"rounded-lg px-2 py-2 text-[9px] " + (i === 0 ? "bg-orange-50 font-bold text-orange-600" : "text-neutral-500")}>{x}</div>)}</div>
              </aside>
              <main className="grid gap-2 sm:grid-cols-3">
                {["طلباتي", "المفضلة", "العناوين"].map((x) => <div key={x} className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs font-bold">{x}</p><p className="mt-3 text-2xl font-black">12</p><p className="mt-1 text-[9px] text-neutral-400">إدارة التفاصيل</p></div>)}
                <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:col-span-3"><p className="text-xs font-bold">آخر الطلبات</p><div className="mt-3 h-16 rounded-lg bg-neutral-50" /></div>
              </main>
            </div>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center bg-neutral-50 p-5">
              <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-center text-[10px] font-bold tracking-[0.16em] text-orange-600">ALI STORE ACCOUNT</p>
                <h3 className="mt-2 text-center text-2xl font-black">مرحبًا بعودتك</h3>
                <p className="mt-2 text-center text-xs text-neutral-400">سجّل الدخول لمتابعة طلباتك ومفضلاتك.</p>
                <div className="mt-5 space-y-2"><div className="h-10 rounded-xl bg-neutral-100" /><div className="h-10 rounded-xl bg-neutral-100" /><button className="h-10 w-full rounded-xl bg-neutral-950 text-xs font-bold text-white">تسجيل الدخول</button></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f4] px-4 py-8 text-neutral-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-orange-600">ALI STORE · UI BOARD</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">خريطة واجهات المشروع</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              لوحة تصميم مرئية مبنية على الـDesign System الحالي. هذه الصفحة للمعاينة فقط ولا تغيّر منطق المتجر أو عقود الـAPI.
            </p>
          </div>
          <Link href="/" className="w-fit rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-bold text-white">العودة للمتجر</Link>
        </div>

        <div className="grid gap-6">
          {screens.map((screen) => <ScreenFrame key={screen.id} screen={screen} />)}
        </div>
      </div>
    </main>
  );
}

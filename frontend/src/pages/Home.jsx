import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Stethoscope, Tag, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import RadialGauge from '../components/ui/RadialGauge';
import ProductCard from '../components/ProductCard';
import { HexLeafIcon } from '../components/icons/MedicineIcons';
import HeroPattern from '../components/layout/HeroPattern';
import { getCategoryIcon } from '../utils/categoryIcons';
import { productApi } from '../api/productApi';

const FEATURES = [
  { icon: Truck, title: 'จัดส่งรวดเร็ว', desc: 'ส่งด่วนถึงหน้าบ้านคุณ' },
  { icon: ShieldCheck, title: 'ของแท้ 100%', desc: 'รับประกันคุณภาพทุกชิ้น' },
  { icon: Stethoscope, title: 'เภสัชกรตรวจสอบ', desc: 'ทุกออเดอร์ผ่านการตรวจสอบ' },
  { icon: Tag, title: 'ราคาคุ้มค่า', desc: 'เช็กราคาจริงแบบเรียลไทม์' },
];

const GAUGES = [
  { value: 100, label: '100%', sublabel: 'สินค้าของแท้' },
  { value: 92, label: '92%', sublabel: 'ลูกค้าพึงพอใจ' },
  { value: 100, label: 'Live', sublabel: 'สต๊อกเรียลไทม์' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productApi.list({ limit: 5 }), productApi.categories()])
      .then(([productsRes, categoriesRes]) => {
        setFeatured(productsRes.items);
        setCategories(categoriesRes.data);
      })
      .catch(() => {
        setFeatured([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24">
      {/* Hero */}
      <section className="relative mt-6 overflow-hidden rounded-3xl border border-line bg-panelLight">
        <HeroPattern />
        <span className="hud-edge" />
        <div className="relative grid items-center gap-10 px-6 py-14 md:grid-cols-2 md:px-14 md:py-20">
          <div className="animate-rise">
            <span className="chip mb-5 border-cyan/30 bg-white text-cyan">
              <Sparkles size={13} /> ระบบร้านยาที่คุณวางใจได้
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-ink md:text-5xl">
              สุขภาพของคุณ
              <br />
              <span className="glow-text">คือสิ่งสำคัญของเรา</span>
            </h1>
            <p className="mt-5 max-w-md text-subtle">
              ยาและผลิตภัณฑ์สุขภาพที่เชื่อถือได้ ตรวจสอบโดยเภสัชกร พร้อมส่งถึงหน้าบ้านคุณ
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products">
                <Button className="px-7 py-3.5">
                  เลือกซื้อสินค้า <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="px-7 py-3.5">
                  ดูหมวดหมู่ทั้งหมด
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              {GAUGES.map((g) => (
                <div key={g.sublabel} className="flex items-center gap-3">
                  <RadialGauge value={g.value} label={g.label} size={64} stroke={5} />
                  <span className="max-w-[7rem] text-xs text-subtle">{g.sublabel}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden justify-center md:flex">
            <div className="animate-floaty rounded-3xl border border-line bg-white p-10 text-center shadow-glow">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-cyan/10">
                <HexLeafIcon size={44} />
              </span>
              <p className="mt-5 font-display font-semibold text-ink">Phanacea Pharmacist</p>
              <p className="text-sm text-subtle">ดูแลโดยทีมเภสัชกรมืออาชีพ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="-mt-8 grid grid-cols-2 gap-4 px-2 md:mt-10 md:grid-cols-4 md:gap-6">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card flex items-center gap-3 p-5">
            <span className="icon-chip shrink-0">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs text-subtle">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Shop by category */}
      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">เลือกซื้อตามหมวดหมู่</h2>
          <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-cyan hover:underline">
            ดูทั้งหมด <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="card flex flex-col items-center gap-3 p-5 text-center"
                >
                  <span className="icon-chip">
                    <Icon size={26} />
                  </span>
                  <span className="text-xs font-medium text-ink">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Popular products */}
      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">สินค้าขายดี</h2>
          <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-cyan hover:underline">
            ดูทั้งหมด <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Pharmacist CTA banner */}
      <section className="card relative mt-16 flex flex-col items-center gap-6 px-8 py-10 text-center md:flex-row md:justify-between md:text-left">
        <span className="hud-edge" />
        <div className="flex items-center gap-4">
          <span className="icon-chip h-14 w-14 shrink-0">
            <Stethoscope size={26} />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-ink">มีคำถามเกี่ยวกับยา?</p>
            <p className="text-sm text-subtle">ทีมเภสัชกรของเราตรวจสอบทุกออเดอร์ก่อนจัดส่งเสมอ</p>
          </div>
        </div>
        <Link to="/support">
          <Button className="px-7 py-3">ติดต่อฝ่ายช่วยเหลือ</Button>
        </Link>
      </section>
    </div>
  );
}

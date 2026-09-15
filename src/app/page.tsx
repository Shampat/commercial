"use client";
import React, { useState, useEffect } from 'react';
import RealMap from "@/components/RealMap";
import { getListings } from '@/lib/db';
import { 
  Building2, Store, Factory, Warehouse as WarehouseIcon, Stethoscope, UtensilsCrossed, 
  Building, LayoutGrid, MapPin, Search, ChevronDown, X, SlidersHorizontal,
  MessageCircle, Eye, ShieldCheck, Plus, Map as MapIcon, Layers, Scale, FileText, Wrench
} from 'lucide-react';

type Tab = 'listings' | 'map' | 'terms' | 'tools';

const CATEGORIES = [
  { id: 'all', name: 'All Spaces', count: 70, Icon: LayoutGrid },
  { id: 'office', name: 'Office Space', count: 18, Icon: Building2 },
  { id: 'retail', name: 'Retail', count: 12, Icon: Store },
  { id: 'industrial', name: 'Industrial', count: 15, Icon: Factory },
  { id: 'warehouse', name: 'Warehouse', count: 8, Icon: WarehouseIcon },
  { id: 'medical', name: 'Medical Office', count: 6, Icon: Stethoscope },
  { id: 'restaurant', name: 'Restaurant', count: 5, Icon: UtensilsCrossed },
  { id: 'plaza', name: 'Plaza', count: 6, Icon: Building },
];

const CITIES = ['Brampton', 'Mississauga', 'Caledon', 'Vaughan', 'Etobicoke', 'Oakville', 'Toronto', 'Milton', 'Bolton', 'Georgetown'];
const LEASE_TYPES = ['For Lease', 'For Sale', 'For Sublease', 'Assignment'];
const SQFT_OPTIONS = ['10K Exact', '5K-10K', '10K-15K', '15K+', 'Custom'];
const PRICE_OPTIONS = ['$0-$10K', '$10K-$20K', '$20K-$30K', '$30K+', 'Custom'];

const PROPERTIES = [
  {
    id: 'AK-10284',
    title: '10,000 Sq Ft • Premium Office – Brampton Gateway',
    address: '50 Sunny Meadow Blvd, Brampton',
    city: 'Brampton',
    price: '$18,500/mo',
    type: 'For Lease',
    category: 'Office',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    verified: true,
    agent: { name: 'Arshdeep S.', initials: 'AS', pro: true },
  },
  {
    id: 'AK-10291',
    title: '10K Sq Ft Retail Plaza Unit – Heartland Mississauga',
    address: '7200 Goreway Dr, Mississauga',
    city: 'Mississauga',
    price: '$22,000/mo',
    type: 'For Lease',
    category: 'Retail',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    verified: true,
    agent: { name: 'Jasleen K.', initials: 'JK', pro: true },
  },
  {
    id: 'AK-10277',
    title: 'Industrial Bay 10,000 SF – Airport Rd Corridor',
    address: '15 Strathearn Ave, Brampton',
    city: 'Brampton',
    price: '$16,750/mo',
    type: 'For Lease',
    category: 'Industrial',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    verified: true,
    agent: { name: 'Manpreet D.', initials: 'MD', pro: true },
  },
  {
    id: 'AK-10302',
    title: 'Medical Office Condo – Vaughan Healthcare Hub',
    address: '9100 Jane St, Vaughan',
    city: 'Vaughan',
    price: '$1.45M',
    type: 'For Sale',
    category: 'Medical Office',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    verified: true,
    agent: { name: 'Sarab B.', initials: 'SB', pro: true },
  },
  {
    id: 'AK-10299',
    title: 'Restaurant Ready Space – Queen St Brampton',
    address: '12 Main St N, Brampton',
    city: 'Brampton',
    price: '$14,200/mo',
    type: 'For Lease',
    category: 'Restaurant',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    verified: true,
    agent: { name: 'Harleen P.', initials: 'HP', pro: true },
  },
  {
    id: 'AK-10311',
    title: 'Warehouse Distribution – Caledon Industrial Park',
    address: '125 Industrial Rd, Caledon',
    city: 'Caledon',
    price: '$19,800/mo',
    type: 'For Lease',
    category: 'Warehouse',
    img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    verified: true,
    agent: { name: 'Gurpreet S.', initials: 'GS', pro: true },
  },
];

const TERMS = [
  { term: 'Net Lease', def: 'Tenant pays base rent plus some or all operating expenses.', ex: 'Brampton office: $18 PSF base + TMI extra.', color: 'bg-orange-50' },
  { term: 'Gross Lease', def: 'All-inclusive rent. Landlord covers operating costs.', ex: 'Mississauga retail often quoted gross at $38 PSF.', color: 'bg-white' },
  { term: 'Triple Net (NNN)', def: 'Tenant pays property taxes, insurance, maintenance on top of rent.', ex: 'Industrial in Vaughan: NNN $12 PSF on top of base.', color: 'bg-white' },
  { term: 'Double Net (NN)', def: 'Tenant pays taxes + insurance, landlord pays maintenance.', ex: 'Common for older plazas in Etobicoke.', color: 'bg-orange-50' },
  { term: 'NOI', def: 'Net Operating Income – income after operating expenses.', ex: 'NOI used to value a 10K plaza at 6% cap.', color: 'bg-white' },
  { term: 'CAP Rate', def: 'Return on investment: NOI / Property Value.', ex: 'GTA West retail cap rates 5.5% - 6.5% in 2024.', color: 'bg-white' },
  { term: 'TMI', def: 'Taxes, Maintenance, Insurance – additional rent components.', ex: 'TMI $14.50 PSF in Brampton gateway area.', color: 'bg-orange-50' },
  { term: 'Base Rent', def: 'Minimum rent paid for use of space, before TMI.', ex: 'Base $16 PSF for 10K sq ft = $13,333/mo.', color: 'bg-white' },
  { term: 'Additional Rent', def: 'Extra charges beyond base – TMI, utilities etc.', ex: 'Additional rent adds $12K/mo on 10K unit.', color: 'bg-white' },
  { term: 'CAM', def: 'Common Area Maintenance – share of common upkeep.', ex: 'CAM $3.20 PSF in Heartland plaza.', color: 'bg-orange-50' },
  { term: 'LOI', def: 'Letter of Intent – non-binding offer outlining lease terms.', ex: 'LOI needed before drafting lease for 10K bay.', color: 'bg-white' },
  { term: 'Zoning', def: 'Municipal rules defining permitted commercial use.', ex: 'C4 zoning allows restaurant + retail in Brampton.', color: 'bg-white' },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [city, setCity] = useState('All Cities');
  const [leaseType, setLeaseType] = useState('Lease Type');
  const [sqft, setSqft] = useState('all');
  const [price, setPrice] = useState('Price');
  const [activePills, setActivePills] = useState([]);
  const [sort, setSort] = useState('Newest');
  const [toast, setToast] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dbListings, setDbListings] = useState<any[]>([]);
  useEffect(() => {
    getListings().then((data:any[]) => {
      const mapped = data.map((l:any) => ({
        id: l.id,
        title: l.title,
        address: l.address || l.city,
        city: l.city,
        price: typeof l.price === 'number' ? String(l.price) + ' /mo' : l.price,
        type: l.type || 'For Lease',
        category: l.type || 'Office',
        img: l.images?.[0] || '/demo/office_space_blueprint_card.jpg',
        verified: true,
        agent: { name: l.contact || 'Owner', initials: 'OW', pro: true },
        is_real: true
      }));
      setDbListings(mapped);
    });
  }, []);
  const DISPLAY_PROPERTIES = dbListings.length > 0 ? [...dbListings, ...PROPERTIES.slice(0, 70-dbListings.length)] : PROPERTIES;

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const triggerToast = (msg: string) => setToast(msg);

  const filteredProperties = DISPLAY_PROPERTIES.filter(p => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'office' && p.category !== 'Office') return false;
      if (selectedCategory === 'retail' && p.category !== 'Retail') return false;
      if (selectedCategory === 'industrial' && p.category !== 'Industrial') return false;
      if (selectedCategory === 'warehouse' && p.category !== 'Warehouse') return false;
      if (selectedCategory === 'medical' && p.category !== 'Medical Office') return false;
      if (selectedCategory === 'restaurant' && p.category !== 'Restaurant') return false;
      if (selectedCategory === 'plaza' && p.category !== 'Plaza') return false;
    }
    if (city !== 'All Cities' && city !== 'City' && p.city !== city) return false;
    return true;
  });

  const removePill = (pill: string) => {
    setActivePills(prev => prev.filter(x => x !== pill));
    triggerToast(`Removed filter: ${pill}`);
  };

  const clearAll = () => {
    setActivePills([]);
    setCity('All Cities');
    setLeaseType('Lease Type');
    setSqft('10K Exact');
    setPrice('Price');
    setSelectedCategory('all');
    triggerToast('All filters cleared');
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-[#FF6A00]/20">
      {/* Toast */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        {toast && (
          <div className="pointer-events-auto bg-zinc-900 text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex items-center gap-2 animate-[slideIn_0.25s_ease]">
            <span className="w-1.5 h-1.5 bg-[#FF6A00] rounded-full animate-pulse" />
            {toast}
          </div>
        )}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-100">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#FF6A00] rounded-lg flex items-center justify-center text-white font-black text-[16px] tracking-tight">A</div>
              <span className="font-semibold text-[17px] tracking-tight">AkalHomes</span>
              <span className="hidden md:inline-flex ml-1 text-[10px] font-bold tracking-widest bg-zinc-900 text-white px-1.5 py-0.5 rounded">PRODUCTION</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'listings', label: 'Listings' },
                { id: 'map', label: 'Map View' },
                { id: 'terms', label: 'Commercial Terms' },
                { id: 'tools', label: 'Tools' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`px-3.5 py-1.5 rounded-full text-[13.5px] font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => triggerToast('Search coming soon')} className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => triggerToast('PRO Dashboard • Ontario Launch')} className="hidden md:inline-flex h-9 px-4 rounded-full bg-zinc-900 text-white text-[13px] font-medium items-center gap-1.5 hover:bg-black transition-colors">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live
            </button>
            <div className="w-9 h-9 rounded-full bg-[#FF6A00] text-white flex items-center justify-center text-[12px] font-bold">AK</div>
          </div>
        </div>
        {/* Mobile tabs */}
        <div className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {[
            { id: 'listings', label: 'Listings' },
            { id: 'map', label: 'Map View' },
            { id: 'terms', label: 'Terms' },
            { id: 'tools', label: 'Tools' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[13px] font-medium border ${
                activeTab === item.id
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 pt-8 md:pt-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] md:text-[46px] font-[800] tracking-[-0.03em] leading-[0.95]">
              10,000 Sq Ft <span className="text-zinc-300 font-[500]">Commercial</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-4">
              <span className="inline-flex items-center gap-2 bg-zinc-900 text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                
                {dbListings.length} spaces • GTA West
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-medium px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live inventory
              </span>
            </div>
            <p className="mt-3 text-[13.5px] text-zinc-500 max-w-[640px] leading-[1.5]">
              Office, Retail, Industrial, Warehouse, Medical, Restaurant, Plaza spaces in{' '}
              <span className="text-zinc-900 font-medium">Brampton, Mississauga, Caledon, Vaughan</span> • Verified • TMI Included
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[12px] text-zinc-400">
            <span className="w-6 h-px bg-zinc-200" /> Ontario Launch V3 • Premium Filter Bar
          </div>
        </div>
      </div>

      {/* Main content switch */}
      {activeTab === 'terms' ? (
        /* COMMERCIAL TERMS TAB */
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 pb-16">
          <div className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-6 md:p-10">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-[24px] md:text-[30px] font-bold tracking-tight">Commercial Terms • Ontario</h2>
                <p className="text-[13.5px] text-zinc-500 mt-2 max-w-[600px]">12 essential terms every tenant, landlord and investor should know for GTA West 10K commercial.</p>
              </div>
              <button onClick={() => setActiveTab('listings')} className="px-4 py-2 rounded-full bg-zinc-900 text-white text-[13px] font-medium">Back to Listings</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TERMS.map(t => (
                <div key={t.term} className={`rounded-2xl border border-zinc-200 ${t.color} p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[15px]">{t.term}</h3>
                    <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full bg-zinc-900 text-white">ONTARIO</span>
                  </div>
                  <p className="text-[13px] text-zinc-600 leading-[1.5]">{t.def}</p>
                  <div className="mt-3 pt-3 border-t border-zinc-200/60 flex gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-widest">EXAMPLE</span>
                    <p className="text-[11.5px] text-zinc-500 leading-[1.4]">{t.ex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'map' ? (
        /* MAP TAB */
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 pb-12">
          <div className="rounded-[24px] overflow-hidden border border-zinc-200 bg-[#F6F1E9] h-[640px] relative">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-[320px] h-[320px] rounded-full border border-dashed border-zinc-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="w-[200px] h-[200px] rounded-full border border-dashed border-zinc-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                {/* Clusters */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.25)] border-4 border-white">14</div>
                  <div className="mt-2 bg-zinc-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow">Mississauga • 14×10K</div>
                </div>
                <div className="absolute -top-12 -left-20 bg-white border border-zinc-200 rounded-full px-3 py-1.5 text-[12px] font-medium shadow flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px] font-bold">6</div>Brampton</div>
                <div className="absolute -bottom-8 left-12 bg-white border border-zinc-200 rounded-full px-3 py-1.5 text-[12px] font-medium shadow flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px] font-bold">8</div>Vaughan • 8×10K</div>
                <div className="absolute top-10 -right-24 bg-[#FF6A00] text-white border border-[#FF6A00] rounded-full px-3 py-1.5 text-[12px] font-bold shadow flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-white text-[#FF6A00] flex items-center justify-center text-[11px] font-bold">3</div>Caledon</div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto flex gap-3">
              <div className="bg-zinc-900 text-white rounded-2xl px-4 py-3 text-[12px] leading-[1.4] shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><MapIcon className="w-4 h-4" /></div>
                <div>
                  <div className="font-semibold">commercial.akalhom...</div>
                  <div className="text-white/60 text-[11px]">Canonical: https://commercial.akalhom... </div>
                </div>
              </div>
              <div className="hidden md:flex bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-[12px] shadow items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> 31 clusters • Drag to explore • Scroll to zoom
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'tools' ? (
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 pb-16">
          <div className="rounded-[24px] border border-zinc-200 p-10 text-center bg-zinc-50">
            <Wrench className="w-10 h-10 mx-auto text-zinc-300 mb-4" />
            <h3 className="text-[20px] font-bold">Tools • Coming in V4</h3>
            <p className="text-[13px] text-zinc-500 mt-2 max-w-[420px] mx-auto">Lease calculator, TMI estimator, NOI & Cap Rate analyzer, LOI generator for Ontario commercial.</p>
            <button onClick={() => setActiveTab('listings')} className="mt-5 px-4 py-2 rounded-full bg-zinc-900 text-white text-[13px]">Back to listings</button>
          </div>
        </div>
      ) : (
        /* LISTINGS LAYOUT */
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Sidebar */}
            <aside className="w-full lg:w-[248px] shrink-0 lg:sticky lg:top-[88px]">
              <div className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-semibold text-[13.5px]">Categories</h3>
                  <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">70 total</span>
                </div>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => {
                    const active = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          if (cat.id !== 'all') {
                            if (!activePills.includes(cat.name)) setActivePills(p => [...p, cat.name]);
                          }
                          triggerToast(`Filter: ${cat.name}`);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                          active ? 'bg-zinc-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <cat.Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-zinc-400'}`} />
                          {cat.name}
                        </span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${active ? 'bg-white/15 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{cat.count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 px-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified • Ontario Licensed
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* FILTER BAR - CRUCIAL */}
              <div className="rounded-[20px] border border-zinc-200 bg-white p-3 md:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-4">
                {/* Row 1 */}
                <div className="flex flex-wrap gap-2">
                  {/* City */}
                  <div className="relative">
                    <button onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')} className="h-9 px-3.5 rounded-full border border-zinc-200 bg-white text-[13px] font-medium flex items-center gap-2 hover:border-zinc-300 transition-colors">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {city}
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                    {openDropdown === 'city' && (
                      <div className="absolute top-[42px] left-0 z-20 w-[200px] rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1.5 max-h-[280px] overflow-auto">
                        <button onClick={() => { setCity('All Cities'); setOpenDropdown(null); triggerToast('City: All Cities'); }} className="w-full text-left px-3 py-2 rounded-xl text-[13px] hover:bg-zinc-50">All Cities</button>
                        {CITIES.map(c => (
                          <button key={c} onClick={() => { setCity(c); setOpenDropdown(null); triggerToast(`City: ${c}`); if (!activePills.includes(c)) setActivePills(p=>[...p,c]); }} className="w-full text-left px-3 py-2 rounded-xl text-[13px] hover:bg-zinc-50 flex justify-between">
                            {c} <span className="text-zinc-400 text-[11px]">{Math.floor(Math.random()*10)+4} spaces</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lease Type */}
                  <div className="relative">
                    <button onClick={() => setOpenDropdown(openDropdown === 'lease' ? null : 'lease')} className="h-9 px-3.5 rounded-full border border-zinc-200 bg-white text-[13px] font-medium flex items-center gap-2 hover:border-zinc-300">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      {leaseType}
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                    {openDropdown === 'lease' && (
                      <div className="absolute top-[42px] left-0 z-20 w-[180px] rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1.5">
                        {LEASE_TYPES.map(t => (
                          <button key={t} onClick={() => { setLeaseType(t); setOpenDropdown(null); triggerToast(`Lease: ${t}`); }} className="w-full text-left px-3 py-2 rounded-xl text-[13px] hover:bg-zinc-50">{t}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sq Ft */}
                  <div className="relative">
                    <button onClick={() => setOpenDropdown(openDropdown === 'sqft' ? null : 'sqft')} className={`h-9 px-3.5 rounded-full border text-[13px] font-medium flex items-center gap-2 transition-colors ${sqft === '10K Exact' ? 'bg-[#FF6A00] text-white border-[#FF6A00]' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${sqft === '10K Exact' ? 'bg-white text-[#FF6A00]' : 'bg-zinc-900 text-white'}`}>10K</span>
                      {sqft}
                      <ChevronDown className={`w-3.5 h-3.5 ${sqft === '10K Exact' ? 'text-white/70' : 'text-zinc-400'}`} />
                    </button>
                    {openDropdown === 'sqft' && (
                      <div className="absolute top-[42px] left-0 z-20 w-[180px] rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1.5">
                        {SQFT_OPTIONS.map(o => (
                          <button key={o} onClick={() => { setSqft(o); setOpenDropdown(null); triggerToast(`Size: ${o}`); }} className={`w-full text-left px-3 py-2 rounded-xl text-[13px] hover:bg-zinc-50 ${o===sqft?'font-semibold':''}`}>{o}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="relative">
                    <button onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')} className="h-9 px-3.5 rounded-full border border-zinc-200 bg-white text-[13px] font-medium flex items-center gap-2 hover:border-zinc-300">
                      $ {price}
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                    {openDropdown === 'price' && (
                      <div className="absolute top-[42px] left-0 z-20 w-[180px] rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1.5">
                        {PRICE_OPTIONS.map(p => (
                          <button key={p} onClick={() => { setPrice(p); setOpenDropdown(null); triggerToast(`Price: ${p}`); }} className="w-full text-left px-3 py-2 rounded-xl text-[13px] hover:bg-zinc-50">{p}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={() => setShowMoreFilters(!showMoreFilters)} className={`h-9 px-3.5 rounded-full border text-[13px] font-medium flex items-center gap-2 ${showMoreFilters ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                    <SlidersHorizontal className="w-3.5 h-3.5" /> More Filters
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <span className="hidden md:inline text-[12px] text-zinc-400">{filteredProperties.length} results</span>
                    <div className="h-9 px-3 rounded-full bg-zinc-100 flex items-center gap-1 text-[12px]">
                      <span className="text-zinc-500">Sort:</span>
                      <select value={sort} onChange={e => { setSort(e.target.value); triggerToast(`Sorted by ${e.target.value}`); }} className="bg-transparent font-medium outline-none text-[12px]">
                        <option>Newest</option>
                        <option>Price</option>
                        <option>Size</option>
                      </select>
                    </div>
                  </div>
                </div>

                {showMoreFilters && (
                  <div className="mt-3 pt-3 border-t border-zinc-100 grid grid-cols-2 md:grid-cols-4 gap-3 animate-[fadeIn_0.2s_ease]">
                    <label className="text-[11px] font-semibold tracking-widest text-zinc-400">PARKING <select className="mt-1 w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium"><option>Any</option><option>10+ spots</option><option>20+ spots</option></select></label>
                    <label className="text-[11px] font-semibold tracking-widest text-zinc-400">ZONING <select className="mt-1 w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium"><option>Any</option><option>C1</option><option>C4</option><option>M1</option></select></label>
                    <label className="text-[11px] font-semibold tracking-widest text-zinc-400">POSSESSION <select className="mt-1 w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium"><option>Immediate</option><option>30 Days</option><option>60 Days</option></select></label>
                    <label className="text-[11px] font-semibold tracking-widest text-zinc-400">TMI <select className="mt-1 w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium"><option>Included</option><option>Extra</option></select></label>
                  </div>
                )}

                {/* Row 2 Pills */}
                {activePills.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {activePills.map(pill => (
                      <span key={pill} className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-zinc-900 text-white text-[12px] font-medium">
                        {pill}
                        <button onClick={() => removePill(pill)} className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    <button onClick={clearAll} className="h-7 px-3 rounded-full border border-zinc-200 bg-white text-[12px] font-medium hover:bg-zinc-50">Clear All</button>
                  </div>
                )}
              </div>

              {/* Property Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProperties.map(prop => (
                  <div key={prop.id} className="group rounded-[20px] border border-zinc-200 bg-white overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-[2px]">
                    {/* Image */}
                    <div className="relative h-[200px] overflow-hidden bg-zinc-100">
                      <img src={prop.img} alt={prop.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      {/* Top badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                          <span className="inline-flex text-[10px] font-bold tracking-widest bg-[#FF6A00] text-white px-2.5 py-1 rounded-full shadow">10,000 SQ FT</span>
                          <span className="inline-flex text-[11px] font-semibold bg-white text-zinc-900 px-2.5 py-1 rounded-full shadow">{prop.type}</span>
                        </div>
                        <span className="text-[11px] font-medium bg-zinc-900/80 backdrop-blur text-white px-2.5 py-1 rounded-full border border-white/10">{prop.category}</span>
                      </div>
                      {/* Bottom overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-white">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium">
                          <MapPin className="w-3.5 h-3.5" /> {prop.city} • {prop.id}
                        </div>
                        <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-[14px] leading-[1.3] line-clamp-2">{prop.title}</h3>
                      <div className="flex items-center gap-1 mt-1.5 text-[12px] text-zinc-500">
                        <MapPin className="w-3 h-3" /> {prop.address}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[15px]">{prop.price}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full"><ShieldCheck className="w-3 h-3" /> Verified</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">{prop.agent.initials}</div>
                          <div>
                            <div className="text-[12px] font-medium leading-none">{prop.agent.name}</div>
                            <div className="text-[10px] font-bold tracking-widest text-[#FF6A00]">PRO</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => triggerToast(`Chat with ${prop.agent.name}`)} className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-colors"><MessageCircle className="w-4 h-4" /></button>
                          <button onClick={() => triggerToast(`Viewing ${prop.id}`)} className="h-8 px-3.5 rounded-full bg-zinc-900 text-white text-[12px] font-medium hover:bg-black transition-colors">View</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProperties.length === 0 && (
                <div className="rounded-[20px] border border-dashed border-zinc-300 p-10 text-center bg-zinc-50">
                  <p className="text-[14px] font-medium">No spaces match current filters</p>
                  <button onClick={clearAll} className="mt-3 px-4 py-2 rounded-full bg-zinc-900 text-white text-[12px]">Clear filters</button>
                </div>
              )}

              {/* Map Cluster Section */}
              <div className="mt-6 rounded-[24px] overflow-hidden border border-zinc-200 bg-[#F7F1E9] h-[380px] relative">
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '36px 36px' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-[260px] h-[260px] rounded-full border border-dashed border-zinc-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold shadow-[0_8px_24px_rgba(0,0,0,0.2)] border-[3px] border-white">14</div>
                      <div className="mt-2 bg-zinc-900 text-white text-[11px] px-2.5 py-1 rounded-full shadow">Mississauga • 14×10K</div>
                    </div>
                    <div className="absolute -top-10 -left-16 bg-white border border-zinc-200 rounded-full px-2.5 py-1 text-[11px] font-medium shadow flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">6</div>Brampton</div>
                    <div className="absolute top-4 -right-20 bg-white border border-zinc-200 rounded-full px-2.5 py-1 text-[11px] font-medium shadow flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">8</div>Vaughan</div>
                    <div className="absolute -bottom-6 -right-10 bg-[#FF6A00] text-white rounded-full px-2.5 py-1 text-[11px] font-bold shadow">Caledon • 3×10K</div>
                  </div>
                </div>
                {/* Bottom left card */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="bg-zinc-900 text-white rounded-xl px-3 py-2.5 text-[11px] leading-tight shadow-xl flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center"><MapIcon className="w-3.5 h-3.5" /></div>
                    <div>
                      <div className="font-semibold">commercial.akalhom...</div>
                      <div className="text-white/50 text-[10px]">Canonical: https://commercial.akalhom...</div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <button onClick={() => setActiveTab('map')} className="h-8 px-3 rounded-full bg-white border border-zinc-200 text-[12px] font-medium shadow hover:bg-zinc-50 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Expand Map</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#FF6A00] rounded-lg flex items-center justify-center text-white font-black text-[13px]">A</div>
                <span className="font-semibold text-[15px]">AkalHomes</span>
                <span className="text-[9px] font-bold tracking-widest bg-[#FF6A00] text-white px-1.5 py-0.5 rounded">PRODUCTION</span>
              </div>
              <p className="mt-3 text-[12.5px] text-zinc-500 leading-[1.5] max-w-[260px]">Premium 10,000 sq ft commercial spaces across GTA West. Verified listings, TMI transparent, Ontario licensed brokerage.</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[11px] font-medium bg-zinc-900 text-white px-2.5 py-1 rounded-full">commercial.akalhom...</span>
                <span className="text-[11px] font-medium bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-full">GTA • 10K SQFT</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[13px] mb-3">Categories</h4>
              <ul className="space-y-2 text-[12.5px] text-zinc-500">
                {CATEGORIES.slice(1).map(c => (
                  <li key={c.id} className="hover:text-zinc-900 cursor-pointer flex items-center gap-2"><c.Icon className="w-3.5 h-3.5" /> {c.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[13px] mb-3">Cities</h4>
              <ul className="space-y-2 text-[12.5px] text-zinc-500">
                {CITIES.slice(0,7).map(city => (
                  <li key={city} className="hover:text-zinc-900 cursor-pointer flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {city}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[13px] mb-3">Legal & Contact</h4>
              <ul className="space-y-2.5 text-[12.5px] text-zinc-500">
                <li className="flex items-center gap-2 hover:text-zinc-900 cursor-pointer"><ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy</li>
                <li className="flex items-center gap-2 hover:text-zinc-900 cursor-pointer"><Scale className="w-3.5 h-3.5" /> Terms</li>
                <li className="flex items-center gap-2 hover:text-zinc-900 cursor-pointer"><FileText className="w-3.5 h-3.5" /> Disclaimer</li>
                <li className="flex items-center gap-2 hover:text-zinc-900 cursor-pointer"><Building2 className="w-3.5 h-3.5" /> About</li>
                <li className="flex items-center gap-2 hover:text-zinc-900 cursor-pointer pt-2 border-t border-zinc-100 mt-2"><MessageCircle className="w-3.5 h-3.5" /> Contact Us</li>
                <li className="flex items-center gap-2 hover:text-zinc-900 cursor-pointer"><span className="w-3.5 h-3.5 rounded-full bg-emerald-500" /> WhatsApp</li>
                <li className="flex items-center gap-2 hover:text-zinc-900 cursor-pointer"><span className="text-[13px]">@</span> hello@akalhom...</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Feature Status Panel */}
        <div className="border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 py-6">
            <div className="rounded-[16px] border border-zinc-200 bg-white p-4 md:p-5 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <h5 className="font-semibold text-[12px] tracking-widest">WHAT WE HAVE • V3 LIVE</h5>
                </div>
                <ul className="space-y-1 text-[12px] text-zinc-600">
                  <li className="flex gap-2"><span className="text-emerald-500">✓</span> Header, Hero 10K title, Category sidebar 70 total</li>
                  <li className="flex gap-2"><span className="text-emerald-500">✓</span> New Filter Bar: City, Lease Type, Sq Ft (10K Exact orange), Price, More Filters</li>
                  <li className="flex gap-2"><span className="text-emerald-500">✓</span> Active pill filters, Clear All, Sort Newest/Price/Size</li>
                  <li className="flex gap-2"><span className="text-emerald-500">✓</span> 3-col premium cards with orange badges, verified, agent PRO</li>
                  <li className="flex gap-2"><span className="text-emerald-500">✓</span> Map cluster section beige grid + 14 cluster</li>
                  <li className="flex gap-2"><span className="text-emerald-500">✓</span> Footer 4-col + Commercial Terms tab (12 terms)</li>
                </ul>
              </div>
              <div className="flex-1 md:border-l md:pl-6 border-zinc-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  <h5 className="font-semibold text-[12px] tracking-widest">MISSING / NEEDED • V4 ROADMAP</h5>
                </div>
                <ul className="space-y-1 text-[12px] text-zinc-500">
                  <li className="flex gap-2"><span className="text-amber-500">○</span> Real MapLibre integration with 16 live pins</li>
                  <li className="flex gap-2"><span className="text-amber-500">○</span> Auth + Saved searches + Alerts for 10K niche</li>
                  <li className="flex gap-2"><span className="text-amber-500">○</span> Tools: Lease Calculator, TMI Estimator, LOI Builder</li>
                  <li className="flex gap-2"><span className="text-amber-500">○</span> Agent chat backend + Viewing scheduler</li>
                  <li className="flex gap-2"><span className="text-amber-500">○</span> IDX feed sync for Brampton/Mississauga boards</li>
                  <li className="flex gap-2"><span className="text-amber-500">○</span> SEO canonical, schema.org Commercial + breadcrumbs</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 text-center text-[10px] text-zinc-400 tracking-wide">© 2025 AkalHomes Production • Ontario Launch • Premium Commercial Portal V3 • Built with orange #FF6A00</div>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        @keyframes slideIn { from { transform: translateY(-10px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(-4px) } to { opacity:1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}

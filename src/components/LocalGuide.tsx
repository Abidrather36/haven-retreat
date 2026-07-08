import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, BookOpen, Coffee, MapPin, Feather, CheckCircle2, ChevronRight, FileDown } from 'lucide-react';
import { GUIDE_PAGES, GuidePage } from '../data/havenData';

interface LocalGuideProps {
  activeSectionId?: string;
}

export default function LocalGuide({ activeSectionId }: LocalGuideProps) {
  const [activeTab, setActiveTab] = useState<string>(activeSectionId || 'letter');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activePage = GUIDE_PAGES.find(p => p.id === activeTab) || GUIDE_PAGES[0]!;

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
    // Simulate downloading PDF booklet file
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'letter': return Feather;
      case 'morning-ritual': return Coffee;
      case 'beyond-postcards': return MapPin;
      case 'artisan-path': return Compass;
      default: return BookOpen;
    }
  };

  return (
    <section id="guide" className="py-24 bg-zinc-950 border-t border-zinc-900 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Title Header Block */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
          <div className="space-y-4">
            <span className="font-mono text-[10px] tracking-[0.35em] text-amber-500 font-semibold uppercase block">
              THE HAVEN COMPASS
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
              A Guest’s Guide<br />to the Soul of Kashmir
            </h2>
            <p className="text-zinc-400 font-light max-w-xl text-xs sm:text-sm">
              We hand this booklet to our guests over a warm morning tea. It is a personal journal of un-touristy secrets, narrow canals, and traditional bakeries.
            </p>
          </div>

          <div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-950 text-zinc-300 hover:text-white rounded text-xs tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-amber-500" />
              <span>{downloadSuccess ? 'Guide PDF Downloaded!' : 'Download Secret Field Guide'}</span>
            </button>
          </div>
        </div>

        {/* Digital Journal Booklet representation */}
        <div className="grid lg:grid-cols-12 gap-12 bg-zinc-900/10 border border-zinc-900/60 rounded p-6 md:p-10 relative">
          
          {/* Chapter Selector (Left Column - 4 columns) */}
          <div className="lg:col-span-4 space-y-3 border-b lg:border-b-0 lg:border-r border-zinc-900 pb-8 lg:pb-0 lg:pr-8 flex flex-col justify-start">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-zinc-500 mb-2 block">
              Journal Chapters
            </span>
            {GUIDE_PAGES.map((page) => {
              const TabIcon = getIcon(page.id);
              const isActive = activePage.id === page.id;
              
              return (
                <button
                  key={page.id}
                  onClick={() => setActiveTab(page.id)}
                  className={`w-full text-left px-4 py-3.5 rounded flex items-center justify-between transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900/80 border border-zinc-800 text-amber-400 font-medium'
                      : 'hover:bg-zinc-900/40 border border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500 group-hover:text-amber-500/80'}`} />
                    <div className="leading-none text-left">
                      <span className="font-mono text-[8px] text-zinc-500 uppercase block tracking-wider">
                        {page.chapter}
                      </span>
                      <span className="font-serif text-sm tracking-wide">
                        {page.title}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              );
            })}

            {/* Quick Helper reminder */}
            <div className="mt-8 p-4 rounded bg-zinc-950/40 border border-zinc-900/60 hidden lg:block">
              <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest block mb-1">
                Digital Detox Note
              </span>
              <p className="text-zinc-500 text-[11px] leading-relaxed font-light">
                Wi-Fi is available across our retreat, but the unwritten rule of Haven is: Saffron tea is better than notifications. Let the mountains ground you.
              </p>
            </div>
          </div>

          {/* Active Chapter Display Page (Right Column - 8 columns) */}
          <div className="lg:col-span-8 lg:pl-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-12 gap-8 items-start"
              >
                {/* Text Context (7 Columns) */}
                <div className="md:col-span-7 space-y-6">
                  <div>
                    <span className="font-mono text-[9px] tracking-[0.3em] text-amber-500/80 uppercase">
                      {activePage.category}
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-zinc-100 mt-1 leading-tight">
                      {activePage.title}
                    </h3>
                    <p className="font-serif text-sm italic text-zinc-500 mt-1">
                      {activePage.subtitle}
                    </p>
                    <div className="w-12 h-px bg-zinc-800 mt-4" />
                  </div>

                  <div className="space-y-6">
                    {activePage.content.map((sect, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-serif text-base font-semibold text-zinc-200">
                          {sect.heading}
                        </h4>
                        <p className="text-zinc-400 font-light leading-relaxed text-xs sm:text-sm">
                          {sect.body}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Practical tip callout box */}
                  <div className="p-4 rounded border border-amber-500/10 bg-amber-500/3 block">
                    <span className="font-mono text-[9px] text-amber-400 uppercase tracking-widest font-semibold block mb-1">
                      Host's Secret Field Recommendation
                    </span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed font-light italic">
                      {activePage.id === 'letter' && '"Sit near Sajad’s fireside at 8:00 PM. That is when our neighbor Farooq comes to practice the Rabab instrument."'}
                      {activePage.id === 'morning-ritual' && '"Do not buy Saffron on highways. Buy it from local growers in Pampore. Ask for ’Lacha’ grade rather than Mongra."'}
                      {activePage.id === 'beyond-postcards' && '"At Rainawari, always tip the boatman 500 rupees. They will Row you into secluded flower spots tourists never find."'}
                      {activePage.id === 'artisan-path' && '"In old city workshops, feel free to sit and try carving walnut wood blocks yourself—it’s therapeutic."'}
                    </p>
                  </div>
                </div>

                {/* Chapter Visual Showcase (5 Columns) */}
                <div className="md:col-span-5 relative group aspect-[3/4] rounded overflow-hidden shadow-2xl bg-zinc-950 border border-zinc-900/60 mt-4 md:mt-0">
                  {/* Subtle Light Leaks and warm film grain overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-blue-500/5 mix-blend-screen pointer-events-none z-10" />
                  <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />
                  
                  <img
                    src={activePage.imageUrl}
                    alt={activePage.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale-[10%] brightness-85 transition-all duration-1000 group-hover:scale-103"
                  />
                  
                  {/* Bottom stamp on image */}
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="font-mono text-[8px] text-zinc-400 border border-zinc-800 bg-zinc-950/80 px-2 py-0.5 rounded uppercase">
                      {activePage.chapter} Showcase
                    </span>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}

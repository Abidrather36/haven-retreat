import { motion } from 'motion/react';
import { Coffee, Flame, Heart, Sparkles } from 'lucide-react';

export default function CommunalTable() {
  const tableItems = [
    { title: "Saffron Kahwa", desc: "Local green tea simmered with sweet saffron threads and almonds." },
    { title: "Bakarkhani Bread", desc: "Crispy, wood-fired multilayered morning bread fresh from the clay kiln." },
    { title: "Wazwan Aromas", desc: "Traditional multicourse banquet cooked slowly on charcoal overnight." }
  ];

  return (
    <section className="py-24 bg-zinc-950 text-zinc-100 border-t border-zinc-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Brand Dining copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <span className="font-mono text-[10px] tracking-[0.35em] text-amber-500 font-semibold uppercase block">
                THE COMMUNAL TABLE
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                A Seat at Our Table.<br />
                <span className="italic text-amber-200/90 font-normal">Shared Joy.</span>
              </h2>
            </div>

            <div className="text-zinc-400 font-light leading-relaxed text-sm md:text-base space-y-6">
              <p>
                Our kitchen is the heart of the retreat. Fresh, local, and shared with friends you haven’t met yet. 
                Instead of rigid, cold room service or perfectly set, empty tables, we celebrate the raw warmth 
                of gathering.
              </p>
              <p>
                Watch the blurred steam rise from our traditional copper Samovar, break hot baked Bakarkhani bread 
                with your hands, and swap stories of local mountain lore. It’s here that the cold grandeur of Kashmir’s 
                peaks meets the absolute sanctuary of family belonging.
              </p>
            </div>

            {/* List of dining highlights */}
            <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-zinc-900">
              {tableItems.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="font-serif text-base font-semibold text-zinc-100 flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-500" />
                    {item.title}
                  </span>
                  <p className="text-zinc-500 text-[11px] font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Golden Hour Warm Candid Image (Shallow Depth of field, steam focus) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative aspect-[4/3] rounded overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-900/60"
          >
            {/* Golden Hour Light Leaks and warm gradients */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-red-500/5 mix-blend-screen z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-zinc-950 to-transparent z-10" />

            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
              alt="Shared laughter around the copper teapot with candle sparkles"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale-[10%] brightness-90 transition-transform duration-1000 hover:scale-103"
            />

            {/* Floating Steam/Cozy Label indicator */}
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-850 px-3 py-1.5 rounded">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="font-mono text-[9px] text-zinc-300 tracking-wider uppercase">
                COMMUNAL DINNER DAWN
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

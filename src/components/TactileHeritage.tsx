import { motion } from 'motion/react';
import { Sparkles, Armchair, Hammer, Sun } from 'lucide-react';

export default function TactileHeritage() {
  const details = [
    {
      icon: Hammer,
      title: "Khatamband Woodwork",
      desc: "Geometric puzzles crafted entirely out of native pine or walnut wood. Thousands of tiny pieces fitted interlocking without a single nail. It is a architectural standard preserved since the 14th century.",
      image: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: Sparkles,
      title: "Hand-Loomed Pashminas",
      desc: "Sheared from high-altitude Changthangi goats, hand-combed, spun, and woven on traditional wooden looms in small home ateliers. Each wrap represents months of quiet patience and master touch.",
      image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: Armchair,
      title: "Hand-Hammered Copper",
      desc: "Traditional Samovars and serving sets shaped out of thick copper sheets. Rhythmic hammer tapping yields beautiful dimpled textures that catch the soft glow of burning coals.",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    }
  ];

  return (
    <section id="craft" className="py-24 bg-zinc-950 text-zinc-100 border-t border-zinc-900 relative overflow-hidden">
      
      {/* Floating Dust Motes Particles in Sunbeam (Pure CSS Animation) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <SunBeamMotes />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
        {/* Left Column Description Layout */}
        <div className="grid lg:grid-cols-3 gap-12 items-center mb-16">
          <div className="lg:col-span-1 space-y-4">
            <span className="font-mono text-[10px] tracking-[0.35em] text-amber-500 font-semibold uppercase block">
              TACTILE HERITAGE
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
              Crafted<br />
              by Hand.
            </h2>
            <div className="w-12 h-px bg-amber-500 my-4" />
          </div>
          <div className="lg:col-span-2">
            <p className="text-zinc-400 font-light leading-relaxed text-sm md:text-base max-w-2xl">
              From the hand-carved Khatamband ceilings to the hand-loomed rugs underfoot, every inch of Haven 
              tells a story of Kashmiri mastery. We focus on the grain, the weave, and the physical depth 
              of luxury heritage—moving far away from mass-manufactured travel toward true artisanal soul.
            </p>
          </div>
        </div>

        {/* Card Details Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {details.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: idx * 0.2 }}
              className="group bg-zinc-900/30 border border-zinc-900 rounded overflow-hidden flex flex-col justify-between"
            >
              {/* Macro Style Image with high chiaroscuro side lighting overlay */}
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-10" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
                
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale brightness-75 contrast-115 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                />

                <div className="absolute bottom-4 left-6 z-20 flex items-center gap-2">
                  <div className="p-1.5 rounded bg-zinc-950/80 border border-zinc-800/60">
                    <item.icon className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-zinc-200">
                    {item.title}
                  </h4>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-6 pt-4 bg-zinc-900/10">
                <p className="text-zinc-400 text-xs font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Side Sunbeam with Floating Particles (Simulated Motes via slow infinite floating keyframes)
function SunBeamMotes() {
  return (
    <>
      {/* Sunbeam Angle */}
      <div className="absolute top-0 right-1/4 w-[150px] md:w-[300px] h-[600px] bg-gradient-to-r from-amber-500/3 via-amber-500/1 to-transparent rotate-45 transform origin-top pointer-events-none filter blur-2xl" />

      {/* Floating Particle Seeds */}
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const delays = ["0s", "4s", "2s", "8s", "5s", "1s"];
        const xPositions = ["20%", "45%", "65%", "75%", "90%", "33%"];
        const scales = [0.6, 1.2, 0.8, 1, 0.5, 1.1];
        
        return (
          <div
            key={i}
            className="absolute bg-amber-400 rounded-full animate-float pointer-events-none opacity-40 filter blur-[0.5px]"
            style={{
              width: `${(scales[i - 1] || 1) * 3}px`,
              height: `${(scales[i - 1] || 1) * 3}px`,
              top: `${15 + i * 11}%`,
              left: xPositions[i - 1],
              animationDelay: delays[i - 1],
              animationDuration: `${12 + i * 3}s`
            }}
          />
        );
      })}
    </>
  );
}

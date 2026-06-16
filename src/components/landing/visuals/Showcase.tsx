"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";

export const showcaseImages = [
  {
    src: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=1200&q=80&auto=format&fit=crop",
    alt: "Professional managing email inbox",
    caption: "Unified inbox view",
    tag: "Inbox",
  },
  {
    src: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=1200&q=80&auto=format&fit=crop",
    alt: "Calendar and schedule planning",
    caption: "Calendar beside your mail",
    tag: "Calendar",
  },
  {
    src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80&auto=format&fit=crop",
    alt: "AI assistant interface concept",
    caption: "Agent-powered actions",
    tag: "Agent",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
    alt: "Analytics dashboard on laptop",
    caption: "Communication analytics",
    tag: "Analytics",
  },
];

export const featureImages: Record<string, string> = {
  "Smart triage": "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&q=80&auto=format&fit=crop",
  "AI drafts": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80&auto=format&fit=crop",
  "Command palette": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop",
  Analytics: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop",
};

export function ImageShowcase({
  isDark,
  activeIndex,
  onSelect,
}: {
  isDark: boolean;
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const active = showcaseImages[activeIndex];

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="relative flex-1 overflow-hidden rounded-2xl border">
        <BorderBeam size={200} duration={10} />
        <motion.div
          key={active.src}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[16/10] w-full"
        >
          <Image
            src={active.src}
            alt={active.alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority={activeIndex === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white">{active.tag}</span>
            <p className="mt-2 text-lg font-semibold text-white">{active.caption}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-row gap-3 overflow-x-auto lg:w-48 lg:flex-col">
        {showcaseImages.map((img, i) => (
          <button
            key={img.tag}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition-all lg:h-24 lg:w-full",
              activeIndex === i
                ? "border-orange-600 ring-2 ring-orange-600/30"
                : isDark
                  ? "border-white/10 opacity-70 hover:opacity-100"
                  : "border-stone-300 opacity-70 hover:opacity-100"
            )}
          >
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="120px" />
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
              {img.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FeatureImage({
  eyebrow,
  isDark,
}: {
  eyebrow: string;
  isDark: boolean;
}) {
  const src = featureImages[eyebrow] ?? featureImages["Smart triage"];
  return (
    <div className={cn("relative overflow-hidden rounded-xl border", isDark ? "border-white/[0.08]" : "border-stone-300/70")}>
      <div className="relative aspect-[4/3] w-full">
        <Image src={src} alt={eyebrow} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
        <div className={cn("absolute inset-0", isDark ? "bg-black/30" : "bg-stone-900/10")} />
      </div>
      <p className={cn("border-t px-4 py-3 font-mono text-xs", isDark ? "border-white/[0.06] text-stone-500" : "border-stone-300/60 text-stone-500")}>
        relvion / {eyebrow.toLowerCase().replace(" ", "-")}
      </p>
    </div>
  );
}

export function DayInLifeDiagram({ isDark }: { isDark: boolean }) {
  const hours = [
    { time: "8:00", label: "Agent summary", desc: "Overnight digest + priorities" },
    { time: "9:30", label: "Triage inbox", desc: "Archive noise, star urgent" },
    { time: "11:00", label: "Draft replies", desc: "Agent writes, you approve" },
    { time: "2:00", label: "Schedule", desc: "Thread → calendar event" },
    { time: "5:00", label: "Inbox zero", desc: "Analytics review" },
  ];

  return (
    <div className={cn("rounded-2xl border p-6", isDark ? "border-white/[0.08] bg-[#0d0d0d]" : "border-stone-300/70 bg-[#ebe4d9]")}>
      <p className={cn("mb-6 text-sm font-semibold", isDark ? "text-stone-200" : "text-stone-800")}>
        A day with Relvion
      </p>
      <div className="relative">
        <div className={cn("absolute top-3 bottom-3 left-[52px] w-px", isDark ? "bg-orange-600/30" : "bg-orange-400/50")} />
        <div className="space-y-6">
          {hours.map((h, i) => (
            <motion.div
              key={h.time}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex gap-4"
            >
              <span className="w-12 shrink-0 pt-0.5 text-right font-mono text-xs text-orange-600">{h.time}</span>
              <div className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-orange-600 bg-orange-600" />
              <div className={cn("flex-1 rounded-lg border px-4 py-3", isDark ? "border-white/[0.06] bg-[#111111]" : "border-stone-300/60 bg-[#f5f0e8]")}>
                <p className={cn("text-sm font-semibold", isDark ? "text-stone-100" : "text-stone-900")}>{h.label}</p>
                <p className={cn("text-xs", isDark ? "text-stone-500" : "text-stone-500")}>{h.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

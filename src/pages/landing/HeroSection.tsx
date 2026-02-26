interface HeroSectionProps {
  onCTAClick: (role: 'homeowner' | 'contractor') => void
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <section className="pt-24 pb-16 px-4 text-center bg-foreground">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          Home repairs, done right.
        </h1>
        <p className="text-lg text-white/60 max-w-lg mx-auto">
          FixIt connects Vancouver homeowners with vetted local contractors — no junk leads, no middlemen.
          Post a job, get quotes, and get it fixed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => onCTAClick('homeowner')}
            className="px-8 py-3.5 bg-white text-foreground font-bold rounded-full hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            I need a contractor
          </button>
          <button
            onClick={() => onCTAClick('contractor')}
            className="px-8 py-3.5 bg-transparent text-white font-bold rounded-full border-2 border-white/30 hover:border-white active:scale-[0.98] transition-all"
          >
            I am a contractor
          </button>
        </div>
        <p className="text-xs text-white/40">Free to join · No credit card required</p>
      </div>
    </section>
  )
}

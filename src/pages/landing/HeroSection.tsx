interface HeroSectionProps {
  onCTAClick: (role: 'homeowner' | 'contractor') => void
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <section className="pt-24 pb-16 px-4 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          Home repairs,{' '}
          <span className="text-blue-600">done right.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-lg mx-auto">
          FixIt connects homeowners with vetted local contractors — no junk leads, no middlemen.
          Post a job, get quotes, and get it fixed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => onCTAClick('homeowner')}
            className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-600/25"
          >
            I need a contractor
          </button>
          <button
            onClick={() => onCTAClick('contractor')}
            className="px-8 py-3.5 bg-white text-gray-800 font-semibold rounded-2xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 active:scale-[0.98] transition-all"
          >
            I am a contractor
          </button>
        </div>
        <p className="text-xs text-gray-400">Free to join · No credit card required</p>
      </div>
    </section>
  )
}

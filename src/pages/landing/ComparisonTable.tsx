const ROWS = [
  { label: 'Transparent pricing', fixit: true, angi: false },
  { label: 'No paid "boost" leads', fixit: true, angi: false },
  { label: 'Contractor vetting required', fixit: true, angi: false },
  { label: 'Direct homeowner–contractor chat', fixit: true, angi: false },
]

export function ComparisonTable() {
  return (
    <section className="py-14 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why FixIt?</h2>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500">
            <div className="px-5 py-3">Feature</div>
            <div className="px-5 py-3 text-center text-blue-600">FixIt</div>
            <div className="px-5 py-3 text-center">Angi</div>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={i}
              className={[
                'grid grid-cols-3 text-sm',
                i < ROWS.length - 1 ? 'border-b border-gray-50' : '',
              ].join(' ')}
            >
              <div className="px-5 py-4 text-gray-700 font-medium">{row.label}</div>
              <div className="px-5 py-4 text-center">
                {row.fixit ? (
                  <span className="text-green-500 font-bold text-base">✓</span>
                ) : (
                  <span className="text-red-400 font-bold text-base">✕</span>
                )}
              </div>
              <div className="px-5 py-4 text-center">
                {row.angi ? (
                  <span className="text-green-500 font-bold text-base">✓</span>
                ) : (
                  <span className="text-red-400 font-bold text-base">✕</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

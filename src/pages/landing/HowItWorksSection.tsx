import { ClipboardList, Users, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    icon: <ClipboardList className="w-6 h-6" />,
    title: 'Post your job',
    body: 'Describe what needs fixing, add photos, and get an instant AI price estimate.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Get matched',
    body: 'Vetted local contractors send quotes. Compare profiles, ratings, and prices.',
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Get it fixed',
    body: 'Accept a quote, chat directly with your contractor, and pay only when done.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-14 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-black/5 text-foreground flex items-center justify-center mx-auto">
                {step.icon}
              </div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest">Step {i + 1}</p>
              <h3 className="font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

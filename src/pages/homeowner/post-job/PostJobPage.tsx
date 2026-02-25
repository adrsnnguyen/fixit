import { useState } from 'react'
import { Wrench } from 'lucide-react'
import { StepProgressBar } from '../../../components/StepProgressBar'
import type { Urgency } from '../../../types/database'
import { Step1Category } from './Step1Category'
import { Step2Describe } from './Step2Describe'
import { Step3Location } from './Step3Location'
import { Step4Estimate } from './Step4Estimate'
import { Step5Confirm } from './Step5Confirm'

export interface JobDraft {
  category: string
  description: string
  photos: string[]
  urgency: Urgency | null
  address: string
  zip_code: string
  ai_price_min_cents: number
  ai_price_max_cents: number
  ai_price_basis: string
}

const INITIAL_DRAFT: JobDraft = {
  category: '',
  description: '',
  photos: [],
  urgency: null,
  address: '',
  zip_code: '',
  ai_price_min_cents: 0,
  ai_price_max_cents: 0,
  ai_price_basis: '',
}

export default function PostJobPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [draft, setDraft] = useState<JobDraft>(INITIAL_DRAFT)

  const handleChange = (partial: Partial<JobDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 pt-6 pb-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-foreground">Post a Job</span>
        <span className="text-muted text-sm ml-auto">Step {currentStep} of 5</span>
      </div>

      <StepProgressBar totalSteps={5} currentStep={currentStep} />

      {currentStep === 1 && (
        <Step1Category
          draft={draft}
          onChange={handleChange}
          onNext={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 2 && (
        <Step2Describe
          draft={draft}
          onChange={handleChange}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <Step3Location
          draft={draft}
          onChange={handleChange}
          onNext={() => setCurrentStep(4)}
          onBack={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 4 && (
        <Step4Estimate
          draft={draft}
          onChange={handleChange}
          onNext={() => setCurrentStep(5)}
          onBack={() => setCurrentStep(3)}
        />
      )}
      {currentStep === 5 && (
        <Step5Confirm
          draft={draft}
          onBack={() => setCurrentStep(4)}
        />
      )}
    </div>
  )
}

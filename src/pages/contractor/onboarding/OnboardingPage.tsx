import { useState } from 'react'
import { Wrench } from 'lucide-react'
import { StepProgressBar } from '../../../components/StepProgressBar'
import { Step1Profile } from './Step1Profile'
import { Step2Documents } from './Step2Documents'
import { Step3Confirmation } from './Step3Confirmation'

export interface OnboardingDraft {
  full_name: string
  phone: string
  profile_photo_file: File | null
  profile_photo_url: string | null
  bio: string
  primary_trade: string
  service_zip_codes: string[]
  license_photo_file: File | null
  license_photo_url: string | null
  insurance_photo_file: File | null
  insurance_photo_url: string | null
}

const INITIAL_DRAFT: OnboardingDraft = {
  full_name: '',
  phone: '',
  profile_photo_file: null,
  profile_photo_url: null,
  bio: '',
  primary_trade: '',
  service_zip_codes: [],
  license_photo_file: null,
  license_photo_url: null,
  insurance_photo_file: null,
  insurance_photo_url: null,
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [draft, setDraft] = useState<OnboardingDraft>(INITIAL_DRAFT)

  const handleChange = (partial: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 pt-6 pb-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-foreground">FixIt</span>
        <span className="text-muted text-sm ml-auto">Step {currentStep} of 3</span>
      </div>

      <StepProgressBar totalSteps={3} currentStep={currentStep} />

      {currentStep === 1 && (
        <Step1Profile
          draft={draft}
          onChange={handleChange}
          onNext={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 2 && (
        <Step2Documents
          draft={draft}
          onChange={handleChange}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <Step3Confirmation
          draft={draft}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </div>
  )
}

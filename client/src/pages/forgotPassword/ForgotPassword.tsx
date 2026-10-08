import { ForgotPasswordForm } from '@/features/auth'
import PhoneForgot from '@/features/auth/phone/PhoneForgot'
import { usePhoneLayout } from '@/features/auth/phone/usePhoneLayout'

export default function ForgotPassword() {
  const phone = usePhoneLayout()
  if (phone) return <PhoneForgot />

  return (
    <main className="bg-[#f1f5f9] min-h-screen flex flex-col justify-center items-center px-6">
      <ForgotPasswordForm />
    </main>
  )
}

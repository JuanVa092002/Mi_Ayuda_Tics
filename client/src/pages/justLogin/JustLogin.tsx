import { LoginForm } from '@/features/auth'
import PhoneLogin from '@/features/auth/phone/PhoneLogin'
import { usePhoneLayout } from '@/features/auth/phone/usePhoneLayout'

export default function JustLogin() {
  const phone = usePhoneLayout()
  if (phone) return <PhoneLogin />

  return (
    <main className="bg-background min-h-screen flex flex-col justify-center items-center px-6 font-public-sans text-on-background">
      <LoginForm />
    </main>
  )
}

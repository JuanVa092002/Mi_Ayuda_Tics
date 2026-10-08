import { RegisterForm } from '@/features/auth'
import PhoneRegister from '@/features/auth/phone/PhoneRegister'
import { usePhoneLayout } from '@/features/auth/phone/usePhoneLayout'

export default function RegisterLogin() {
  const phone = usePhoneLayout()
  if (phone) return <PhoneRegister />

  return (
    <main className="bg-[#f1f5f9] min-h-screen flex flex-col justify-center items-center px-6">
      <RegisterForm />
    </main>
  )
}

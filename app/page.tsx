import { auth } from '@/lib/auth'
import { redirect, RedirectType } from 'next/navigation'
import { headers } from 'next/headers'



export default async function ProtectedPage() {
    const session = await auth.api.getSession({headers: await headers()})
    if(!session) {
        redirect('/login', RedirectType.push)
    }
  return (
    <div>Detta är en sida man endast kan besöka om man är inloggad</div>
  )
}
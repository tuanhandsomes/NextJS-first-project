import { cookies } from 'next/headers'
import Profile from "@/app/me/profile";
import accountApiRequest from "@/apiRequests/account";

export default async function MeProfile() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('sessionToken')
    const result = await accountApiRequest.me(sessionToken?.value ?? '')
    return (
        <div>
            <h1>Profile</h1>
            <div>
                Xin chào {result.payload.data.name}
            </div>
            <Profile />
        </div>
    )
}



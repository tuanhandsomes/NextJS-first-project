import { cookies } from 'next/headers'
import Profile from "@/app/me/profile";
import accountApiRequest from "@/apiRequests/account";

export default async function MeProfile() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('sessionToken')

    // DEBUG 1: Kiểm tra xem có lấy được token từ cookie không?
    console.log(">>> CHECK TOKEN:", sessionToken?.value);

    let result = null;

    try {
        result = await accountApiRequest.me(sessionToken?.value ?? '')
        // DEBUG 2: Kiểm tra xem API trả về cái gì?
        console.log(">>> CHECK RESULT:", result);
    } catch (error) {
        // DEBUG 3: Nếu lỗi thì nó là lỗi gì?
        console.error(">>> CHECK ERROR:", error);
    }

    // Nếu không có result hoặc không có payload thì hiện thông báo lỗi
    if (!result || !result.payload) {
        return (
            <div>
                <h1>Lỗi</h1>
                <p>Không tìm thấy dữ liệu profile.</p>
                <p>Check terminal để xem chi tiết.</p>
            </div>
        )
    }

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
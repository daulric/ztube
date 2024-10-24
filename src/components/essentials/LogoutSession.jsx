"use client"

import { cookieStore } from "@/tools/cookieStore"

export default function LogoutSession(loggedOut) {
    if (loggedOut === false) {
        return null;
    }

    const user_token = cookieStore.get("user");
    const user_data = localStorage.getItem("user");

    if (user_token !== null || user_data !== null ) {
        cookieStore.remove("user");
        localStorage.removeItem("user");
    }

    return null;
}
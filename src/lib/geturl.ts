import { headers } from "next/headers";

async function getURL() {
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const url = `${protocol}://${host}`;

    return url;
};

export default getURL;
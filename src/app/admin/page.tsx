import { headers } from 'next/headers';

export default async function AdminHome() {
    const headersList = await headers();

    return <>{headersList.get('X-LOGGED-USER')}</>;
}

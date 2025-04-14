'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/ky';
import UserForm from '@/components/users/UserForm';
import { notifications } from '@mantine/notifications';

export default function EditUserPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');
    const [user, setUser] = useState<any | null>(null);

    const fetchUser = async () => {
        try {
            const response = await api.get(`admin/users/${userId}`);
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const handleEditUser = async (values: any) => {
        try {
            await api.put(`admin/users/${userId}`, {
                json: values,
            });
            notifications.show({
                title: 'Success',
                message: 'User updated successfully',
                color: 'green',
            });
            router.push('/admin/users');
        } catch (error) {
            console.error('Failed to update user:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to update user',
                color: 'red',
            });
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    if (!user) return <div>Loading...</div>;

    return (
        <UserForm
            mode='edit'
            initialValues={{
                username: user.username,
                email: user.email,
                user_type_id: user.user_type_id.toString(),
            }}
            onSubmit={handleEditUser}
        />
    );
}

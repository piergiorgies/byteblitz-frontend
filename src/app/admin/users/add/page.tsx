'use client';

import UserForm from '@/components/users/UserForm';
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';

export default function AddUsersPage() {
    const handleAddUser = async (values: any) => {
        try {
            // remove the password confirmation field
            const submitValues = { ...values };
            delete submitValues.confirmPassword;
            console.log(submitValues);
            await api.post('auth/signup', {
                json: submitValues,
            });
            notifications.show({
                title: 'Success',
                message: 'User added successfully',
                color: 'green',
            });
        } catch (error) {
            console.error('Failed to add user:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to add user',
                color: 'red',
            });
        }
    };

    return <UserForm mode='add' onSubmit={handleAddUser} />;
}

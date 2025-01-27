'use client';

import ContestForm from '@/components/contests/ContestForm';
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';

export default function AddContestsPage() {
    const hanfleAddContest = async (values: any) => {
        try {
            await api.post('contests', {
                json: values,
            });
            notifications.show({
                title: 'Success',
                message: 'Contest added successfully',
                color: 'green',
            });
        } catch (error) {
            console.error('Failed to add contest:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to add contest',
                color: 'red',
            });
        }
    }

    return <ContestForm mode='add' onSubmit={hanfleAddContest} />;
}
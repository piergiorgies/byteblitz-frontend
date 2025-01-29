'use client';

import ContestForm from '@/components/contests/ContestForm';
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';

export default function AddContestsPage() {
    const handleAddContest = async (values: any) => {
        console.log(values)
        const formattedValues = {
            ...values,
            start_datetime: new Date(values.start_datetime),
            end_datetime: new Date(values.end_datetime),
        };
        try {
            await api.post('contests', {
                json: formattedValues,
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

    return <ContestForm mode='add' onSubmit={handleAddContest} />;
}
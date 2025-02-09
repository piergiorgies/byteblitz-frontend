'use client';

import ContestForm from '@/components/contests/ContestForm';
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

export default function AddContestsPage() {
    const router = useRouter();

    const handleAddContest = async (values: any) => {

        const formattedValues = {
            ...values,
            start_datetime: values.start_datetime ? new Date(values.start_datetime) : null,
            end_datetime: values.end_datetime ? new Date(values.end_datetime) : null,
            user_ids: values.users,
            problems: values.contest_problems
        };

        // Remove unwanted properties
        const { users, contest_problems, ...cleanedValues } = formattedValues;
        try {
            await api.post('contests', {
                json: cleanedValues,
            });

            notifications.show({
                title: 'Success',
                message: 'Contest added successfully',
                color: 'green',
            });
            router.push('/admin/contests');

        } catch (error) {
            console.error('Failed to add contest:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to add contest',
                color: 'red',
            });
        }
    };

    return <ContestForm mode='add' onSubmit={handleAddContest} />;
}

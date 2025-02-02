'use client';

import ContestForm from '@/components/contests/ContestForm';
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';

export default function AddContestsPage() {
    const handleAddContest = async (values: any) => {
        // remove the users from the values object but before do a copy of the array
        const userIds = values.users.slice();
        delete values.users;
        const formattedValues = {
            ...values,
            start_datetime: values.start_datetime
                ? new Date(values.start_datetime)
                : null,
            end_datetime: values.end_datetime
                ? new Date(values.end_datetime)
                : null,
        };
        console.log(formattedValues);
        try {
            const response = await api.post('contests', {
                json: formattedValues,
            });
            // call the api to add the users to the contest
            const data = await response.json<{
                id: number;
                message: string;
            }>();
            console.log(userIds);
            await api.post(`contests/${data.id}/users`, {
                json: {
                    ids: userIds,
                },
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
    };

    return <ContestForm mode='add' onSubmit={handleAddContest} />;
}

'use client';

import ContestForm from '@/components/contests/ContestForm';
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

export default function AddContestsPage() {
    const router = useRouter();

    const handleAddContest = async (values: any) => {
        // remove the users and problems from the values object but before do a copy of the array
        const userIds = values.users.slice();
        delete values.users;

        const problems = values.contest_problems.slice();

        delete values.problems;

        const formattedValues = {
            ...values,
            start_datetime: values.start_datetime
                ? new Date(values.start_datetime)
                : null,
            end_datetime: values.end_datetime
                ? new Date(values.end_datetime)
                : null,
        };
        try {
            const response = await api.post('contests', {
                json: formattedValues,
            });

            const data = await response.json<{
                id: number;
                message: string;
            }>();

            // call the api to add the users to the contest
            await api.post(`contests/${data.id}/users`, {
                json: {
                    ids: userIds,
                },
            });

            // call the api to add the problems to the contest
            await api.post(`contests/${data.id}/problems`, {
                json: {
                    problems: problems,
                }
            })

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

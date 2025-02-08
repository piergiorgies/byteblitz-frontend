'use client';

import ContestForm from '@/components/contests/ContestForm';
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditContestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contestId = searchParams.get('id');
    const [contest, setContest] = useState<any | null>(null);

    const fetchContest = async () => {
        try {
            const response = await api.get(`contests/${contestId}`);
            const data = await response.json();
            setContest(data);
        } catch (error) {
            console.error('Error fetching contest:', error);
        }
    };

    const handleEditContest = async (values: any) => {
        // remove the users and problems from the values object but before do a copy of the array
        const userIds = values.users.slice();
        delete values.users;
        console.log('userIds:', userIds);

        const problems = values.contest_problems.slice();
        delete values.problems;
        console.log('problems: ', problems)

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
            await api.put(`contests/${contestId}`, {
                json: formattedValues,
            });

            await api.post(`contests/${contestId}/users`, {
                json: {
                    ids: userIds,
                },
            });

            // call the api to add the problems to the contest
            await api.post(`contests/${contestId}/problems`, {
                json: {
                    problems: problems,
                }
            })

            notifications.show({
                title: 'Success',
                message: 'Contest updated successfully',
                color: 'green',
            });
            router.push('/admin/contests');
        } catch (error) {
            console.error('Failed to update contest:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to update contest',
                color: 'red',
            });
        }
    };

    useEffect(() => {
        if (contestId) {
            fetchContest();
        }
    }, [contestId]);

    if (!contest) return <div>Loading...</div>;

    return (
        <ContestForm
            mode='edit'
            initialValues={{
                name: contest.name,
                description: contest.description,
                start_datetime: new Date(contest.start_datetime),
                end_datetime: new Date(contest.end_datetime),
                users: contest.users.map((user: any) => user.id),
                contest_problems: contest.contest_problems,
            }}
            onSubmit={handleEditContest}
        />
    );
}

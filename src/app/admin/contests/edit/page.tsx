'use client';

import ContestForm from '@/components/contests/ContestForm';
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function EditContestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contestId = searchParams.get('id');
    const [contest, setContest] = useState<any | null>(null);

    const fetchContest = useCallback(async () => {
        try {
            const response = await api.get(`admin/contests/${contestId}`);
            const data = await response.json();
            setContest(data);
        } catch (error) {
            console.error('Error fetching contest:', error);
        }
    }, [contestId]);

    const handleEditContest = async (values: any) => {
        // convert to Date objects first (in case they are strings)
        const startDate = values.start_datetime
            ? new Date(values.start_datetime)
            : null;
        const endDate = values.end_datetime
            ? new Date(values.end_datetime)
            : null;

        if (startDate && endDate) {
            // get local shift in minutes and add it to start and end datetime
            const localShiftInMinutes = new Date().getTimezoneOffset();
            startDate.setMinutes(startDate.getMinutes() - localShiftInMinutes);
            endDate.setMinutes(endDate.getMinutes() - localShiftInMinutes);
        }

        const formattedValues = {
            ...values,
            start_datetime: startDate,
            end_datetime: endDate,
            problems: values.contest_problems,
        };

        const { contest_problems, ...cleanedValues } = formattedValues;

        try {
            await api.put(`admin/contests/${contestId}`, {
                json: cleanedValues,
            });

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
                users: contest.users,
                contest_problems: contest.contest_problems,
                is_public: contest.is_public,
                is_registration_open: contest.is_registration_open,
            }}
            onSubmit={handleEditContest}
        />
    );
}

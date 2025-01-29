'use client';

import ContestForm from "@/components/contests/ContestForm";
import api from "@/utils/ky";
import { notifications } from "@mantine/notifications";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    }

    const handleEditContest = async (values: any) => {
        try {
            await api.put(`contests/${contestId}`, {
                json: values,
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
    console.log(contest);

    return (
        <ContestForm
            mode='edit'
            initialValues={{
                name: contest.name,
                description: contest.description,
                start_datetime: new Date(contest.start_datetime),
                end_datetime: new Date(contest.end_datetime),
            }}
            onSubmit={handleEditContest}
        />
    );
}
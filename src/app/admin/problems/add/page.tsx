'use client';

import EditProblem from '@/components/problems/EditProblem';
import { Problem } from '@/models/Problem';
import api from '@/utils/ky';
import { objectToSnake } from 'ts-case-convert';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { HTTPError } from 'ky';

export default function AddProblemPage() {
    const router = useRouter();

    const saveProblem = async (problem: Problem) => {
        try {
            const toSubmit = objectToSnake(problem);
            const response = await api.post('admin/problems', {
                json: toSubmit,
            });
            const createdProblem = await response.json();

            notifications.show({
                title: 'Success',
                message: `Problem has been created successfully.`,
                color: 'green',
            });

            router.push('/admin/problems');
        } catch (error: unknown) {
            if (error instanceof HTTPError && error.response.status === 409) {
                notifications.show({
                    title: 'Error',
                    message: `Another problem with the same title has been found. Change it.`,
                    color: 'red',
                });
            } else {
                notifications.show({
                    title: 'Error',
                    message: `An error occurred while updating the problem. Retry.`,
                    color: 'red',
                });
            }
        }
    };

    return <EditProblem onProblemSave={saveProblem} />;
}

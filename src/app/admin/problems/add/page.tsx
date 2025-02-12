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
            const { testCases, ...problemWithoutTestCases } = problem;
            const extractedTestCases = testCases ?? [];

            const response = await api.post('problems', {
                json: objectToSnake(problemWithoutTestCases),
            });

            const responseBody = await response.json<{ created_id: number }>();
            const { created_id: problemId } = responseBody;

            const erroredTestCases = [];
            for (let i = 0; i < extractedTestCases.length; i++) {
                const testCase = extractedTestCases[i];

                try {
                    await api.post(`problems/${problemId}/testcases`, {
                        json: objectToSnake({
                            ...testCase,
                            notes: `Test case #${i + 1}`,
                        }),
                    });
                } catch {
                    erroredTestCases.push(i);
                }
            }

            localStorage.setItem(
                'problemCreated',
                JSON.stringify({
                    success: erroredTestCases.length === 0,
                    erroredTestCases,
                }),
            );
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

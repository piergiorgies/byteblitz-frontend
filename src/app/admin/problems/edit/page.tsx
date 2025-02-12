'use client';

import EditProblem from '@/components/problems/EditProblem';
import { Problem, ProblemTestCase } from '@/models/Problem';
import api from '@/utils/ky';
import { Center, Loader } from '@mantine/core';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { objectToCamel, objectToSnake } from 'ts-case-convert';
import { notifications } from '@mantine/notifications';
import { HTTPError } from 'ky';

export default function EditProblemPage() {
    const searchParams = useSearchParams();
    const problemId = searchParams.get('id');
    const [problem, setProblem] = useState<Problem | null>(null);

    const saveProblem = async (editedProblem: Problem) => {
        if (problem == null) return;

        try {
            const { testCases, ...problemWithoutTestCases } = editedProblem;
            const extractedTestCases = testCases ?? [];

            await api.put(`problems/${problemId}`, {
                json: objectToSnake(problemWithoutTestCases),
            });

            const erroredTestCases = [];
            let i;
            const originalTestCasesLength = problem.testCases?.length ?? 0;
            const length = Math.min(
                extractedTestCases.length,
                originalTestCasesLength,
            );

            for (i = 0; i < length; i++) {
                const testCase = extractedTestCases[i];
                const originalId = problem.testCases![i].id ?? 0;

                try {
                    await api.put(`problems/${problemId}/testcases`, {
                        json: objectToSnake({
                            ...testCase,
                            id: originalId,
                            notes: `Test case #${i + 1}`,
                        }),
                    });
                } catch {
                    erroredTestCases.push(i);
                }
            }

            // Test cases deleted by the user
            if (extractedTestCases.length < originalTestCasesLength) {
                const idsToDelete = problem
                    .testCases!.slice(i)
                    .map((testCase) => testCase.id);

                try {
                    await api.delete(`problems/${problemId}/testcases`, {
                        json: { ids: idsToDelete },
                    });
                } catch {
                    erroredTestCases.push(...idsToDelete);
                }
            }

            // Test cases added by the user
            if (extractedTestCases.length > originalTestCasesLength) {
                for (i; i < extractedTestCases.length; i++) {
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
            }

            if (erroredTestCases.length === 0) {
                notifications.show({
                    title: 'Updated',
                    message: 'Problem updated succesfully!',
                    color: 'green',
                });
            } else {
                notifications.show({
                    title: 'Error',
                    message: `Error in updating the following test cases: ${erroredTestCases.map((x) => `#${x}`).join(', ')}`,
                    color: 'red',
                });
            }
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

    const getProblem = useCallback(async () => {
        try {
            const requests = [
                api.get(`problems/${problemId}`),
                api.get(`problems/${problemId}/testcases`),
            ];

            const [problemsReponse, testCasesResponse] =
                await Promise.all(requests);
            const problem = await problemsReponse.json<Problem>();
            const { data: testCases } = await testCasesResponse.json<{
                data: ProblemTestCase[];
            }>();
            problem.testCases = testCases;

            setProblem(objectToCamel(problem));
        } catch (error) {
            console.log(error);
        }
    }, [problemId]);

    useEffect(() => {
        getProblem();
    }, [getProblem]);

    return problem == null ? (
        <Center>
            <Loader color='blue' size='xl' type='dots' />
        </Center>
    ) : (
        <EditProblem onProblemSave={saveProblem} savedProblem={problem} />
    );
}

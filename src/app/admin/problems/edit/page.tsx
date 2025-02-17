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


            await api.put(`admin/problems/${problemId}`, {
                json: objectToSnake(editedProblem),
            });

            notifications.show({
                title: 'Updated',
                message: 'Problem updated succesfully!',
                color: 'green',
            });

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
            const reponse = api.get(`admin/problems/${problemId}`);
            const problem = await reponse.json<Problem>();

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

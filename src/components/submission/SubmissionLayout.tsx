'use client';

import { AppShell, Burger, Button, Flex, Group, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import HeaderUserButton from '../navigation/HeaderUserButton';
import { FaPlay, FaRegPaperPlane } from 'react-icons/fa6';
import { Language } from '@/models/Language';
import { SubmissionContext } from '../contexts/SubmissionContext';
import api from '@/utils/ky';
import { TestCaseSubmission, TotalResult } from '@/models/Submission';
import { notifications } from '@mantine/notifications';
import { HTTPError } from 'ky';
import ColorSchemeChanger from '../global/ColorSchemeChanger';

type SubmissionLayoutProps = {
    children: React.ReactNode;
    username: string | null;
    userPermissions: number | null;
};

interface BodyRequest {
    problem_id: number;
    language_id: string;
    submitted_code: string;
    notes: string;
    is_pretest_run: boolean;
    contest_id?: number;
}

export default function SubmissionLayoutComponent({
    children,
    username,
    userPermissions,
}: SubmissionLayoutProps) {
    const params = useParams();

    const router = useRouter();
    const [opened, { toggle }] = useDisclosure();

    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
        null,
    );
    const [submissions, setSubmissions] = useState<TestCaseSubmission[]>([]);
    const [result, setResult] = useState<TotalResult | null>(null);
    const [pretestResults, setPretestResults] = useState<TestCaseSubmission[]>(
        [],
    );
    const [openedWindow, setOpenedWindow] = useState(false);

    const handleSubmit = async (code: string, pretest: boolean) => {
        try {
            const reqBody: BodyRequest = {
                problem_id: parseInt(params.problemId as string),
                language_id: (selectedLanguage?.id ?? 1).toString(),
                submitted_code: code,
                notes: '',
                is_pretest_run: pretest,
            };
            if (params.contestId) {
                reqBody.contest_id = parseInt(params.contestId as string);
            }
            await api.post('submissions', {
                json: reqBody,
            });
            setOpenedWindow(pretest);
        } catch (error: unknown) {
            const baseNotification = {
                title: 'Error',
                color: 'red' as const,
                message: 'An error occurred while updating the problem. Retry.',
            };
            if (error instanceof HTTPError) {
                try {
                    const response = error.response;
                    const body = await response.json();

                    if (response.status === 403) {
                        notifications.show({
                            ...baseNotification,
                            message:
                                'You have reached the submission rate limit.',
                        });
                    } else {
                        notifications.show({
                            ...baseNotification,
                            message: body?.detail ?? baseNotification.message,
                        });
                    }
                } catch {
                    notifications.show(baseNotification);
                }
            } else {
                notifications.show(baseNotification);
            }
        }
    };

    const submitCode = async () => {
        setSubmissions([]);
        setResult(null);
        handleSubmit(code, false);
    };

    const submitCodeExample = async () => {
        setPretestResults([]);
        setResult(null);
        handleSubmit(code, true);
    };

    return (
        <>
            <AppShell header={{ height: 60 }} padding='md'>
                <AppShell.Header>
                    <Group h='100%' px='md'>
                        <Flex w={'100%'}>
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom='sm'
                                size='sm'
                            />
                            <Flex
                                justify='space-between'
                                align='center'
                                w={'100%'}
                            >
                                <Title
                                    pt={5}
                                    role='button'
                                    onClick={() => router.push('/')}
                                >
                                    ByteBlitz
                                </Title>

                                <Flex gap='sm'>
                                    <Tooltip label={'Coming soon!'} withArrow>
                                        <Button
                                            leftSection={<FaPlay />}
                                            onClick={submitCodeExample}
                                            variant='light'
                                        >
                                            Run Example
                                        </Button>
                                    </Tooltip>
                                    <Button
                                        leftSection={<FaRegPaperPlane />}
                                        onClick={submitCode}
                                    >
                                        Submit
                                    </Button>
                                </Flex>
                                <Flex gap='sm'>
                                    <ColorSchemeChanger />
                                    <HeaderUserButton
                                        username={username}
                                        userPermissions={userPermissions}
                                    />
                                </Flex>
                            </Flex>
                        </Flex>
                    </Group>
                </AppShell.Header>
                <AppShell.Main
                    style={{
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingBottom: 0,
                        paddingTop: '60px',
                    }}
                >
                    <SubmissionContext.Provider
                        value={{
                            code,
                            setCode,
                            selectedLanguage,
                            setSelectedLanguage,
                            submissions,
                            setSubmissions,
                            result,
                            setResult,
                            pretestResults,
                            setPretestResults,
                            openedWindow,
                            setOpenedWindow,
                        }}
                    >
                        {children}
                    </SubmissionContext.Provider>
                </AppShell.Main>
            </AppShell>
        </>
    );
}

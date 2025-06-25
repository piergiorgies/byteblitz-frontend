import {
    SubmissionResult,
    TestCaseSubmission,
    TotalResult,
} from '@/models/Submission';
import api from '@/utils/ky';
import {
    Blockquote,
    Button,
    Card,
    Container,
    Flex,
    ScrollArea,
    Space,
    Table,
    Text,
} from '@mantine/core';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FaCode } from 'react-icons/fa6';
import useWebSocket from 'react-use-websocket';
import SubmissionResultIcon from './SubmissionResult';
import { SubmissionContext } from '../contexts/SubmissionContext';
import { Actions, Model } from 'flexlayout-react';

export default function ResultsWindow({
    layoutModel,
}: {
    layoutModel: Model | null;
}) {
    const { submissions, setSubmissions, result, setResult } =
        useContext(SubmissionContext);

    const [submissionResults, setSubmissionResults] = useState<{
        [key: number]: SubmissionResult;
    } | null>(null);

    const websocketUrl = process.env.NEXT_PUBLIC_API_WS_HOST + '/general/ws';
    const { sendMessage, lastMessage, readyState } = useWebSocket(
        websocketUrl,
        {
            shouldReconnect: () => true,
            reconnectAttempts: 10,
            reconnectInterval: 2000,
            share: true,
        },
    );

    const [resultTabId, setResultTabId] = useState<string | null>(null);
    const [testCasesTabId, setTestCasesTabId] = useState<string | null>(null);

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const message = JSON.parse(lastMessage.data);
                if (message.type && message.type === 'total') {
                    const totalResult: TotalResult = message;
                    setResult(totalResult);
                } else {
                    const submission: TestCaseSubmission = message;
                    if (!submission.is_pretest_run) {
                        setSubmissions((prev) => [...prev, submission]);

                        const action = Actions.selectTab(resultTabId ?? '');
                        layoutModel?.doAction(action);
                    } else {
                        const action = Actions.selectTab(testCasesTabId ?? '');
                        layoutModel?.doAction(action);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }, [lastMessage, resultTabId, testCasesTabId]);

    const getSubmissionResults = useCallback(async () => {
        try {
            const response = await api.get('submissions/results');
            const submissionResultsList =
                await response.json<SubmissionResult[]>();
            const submissionResultsDict: { [key: number]: SubmissionResult } =
                {};

            for (const submissionResult of submissionResultsList) {
                submissionResultsDict[submissionResult.id] = submissionResult;
            }
            setSubmissionResults(submissionResultsDict);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        getSubmissionResults();
    }, [getSubmissionResults]);

    useEffect(() => {
        if (layoutModel == null) return;

        layoutModel.visitNodes((node) => {
            const name = (node.toJson() as Record<string, string>).name;
            if (name === 'Results') {
                const id = (node.toJson() as any).id;
                setResultTabId(id);
            } else if (name === 'Test Case') {
                const id = (node.toJson() as any).id;
                setTestCasesTabId(id);
            }
        });
    }, [layoutModel]);

    return (
        <Container>
            <div className='w-full'>
                <Flex justify='space-between' align='center' p='xs'></Flex>
            </div>
            <Flex direction='column' h='100%'>
                <Flex direction='column' h='100%'>
                    <ScrollArea h='95%' w='100%'>
                        <Flex h='100%' p='xs'>
                            {submissions.length === 0 && result === null ? (
                                <Flex
                                    direction='column'
                                    justify='center'
                                    align='center'
                                    w='100%'
                                    p='md'
                                >
                                    <FaCode color='gray' fontSize='4em' />
                                    <Text c='dimmed' mt='xs'>
                                        Submit the code to see the results!
                                    </Text>
                                </Flex>
                            ) : (
                                <Table stickyHeader>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>#</Table.Th>
                                            <Table.Th>Time</Table.Th>
                                            <Table.Th>Memory</Table.Th>
                                            <Table.Th>Result</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {submissions.map((submission) => (
                                            <Table.Tr key={submission.number}>
                                                <Table.Td>
                                                    {submission.number}
                                                </Table.Td>
                                                <Table.Td>
                                                    {submission.time.toFixed(6)}{' '}
                                                    s
                                                </Table.Td>
                                                <Table.Td>
                                                    {(
                                                        submission.memory / 1024
                                                    ).toFixed(2)}{' '}
                                                    MB
                                                </Table.Td>
                                                <Table.Td>
                                                    <SubmissionResultIcon
                                                        resultId={
                                                            submission.result_id
                                                        }
                                                        submissionResults={
                                                            submissionResults
                                                        }
                                                    />
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            )}
                        </Flex>
                        <Container h='100%' p='xs'>
                            {result &&
                                result.result &&
                                result.result !== '' && (
                                    <Blockquote c='red' color='red'>
                                        {result.result}
                                    </Blockquote>
                                )}
                            <Space h='md' />
                            {result && !result.is_pretest_run && (
                                <Card
                                    shadow='sm'
                                    p='lg'
                                    radius='xs'
                                    withBorder
                                // bg={
                                //     result.result && result.result !== ''
                                //         ? 'red-100'
                                //         : 'white'
                                // }
                                >
                                    <Text w={700} size='lg'>
                                        Total Result
                                    </Text>
                                    <Text size='md' mt='xs'>
                                        Score: <b>{result.score}</b>
                                    </Text>
                                </Card>
                            )}
                        </Container>
                    </ScrollArea>
                </Flex>
            </Flex>
        </Container>
    );
}

import { ProblemTestCase } from '@/models/Problem';
import {
    SubmissionResult,
    TestCaseSubmission,
    TotalResult,
} from '@/models/Submission';
import api from '@/utils/ky';
import {
    Blockquote,
    Box,
    Button,
    Card,
    Container,
    Flex,
    FloatingIndicator,
    Indicator,
    ScrollArea,
    Space,
    Table,
    Tabs,
    Text,
} from '@mantine/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaCode, FaPlay, FaRegPaperPlane, FaXmark } from 'react-icons/fa6';
import { MosaicBranch, MosaicWindow } from 'react-mosaic-component';
import useWebSocket from 'react-use-websocket';
import SubmissionResultIcon from './SubmissionResult';
import classes from './ResultWindow.module.css';

export default function ResultsWindow({
    path,
    code,
    testCases,
    handleSubmit,
    handleExampleSubmit,
}: {
    path: MosaicBranch[];
    code: string;
    testCases: ProblemTestCase[] | null;
    handleSubmit: (code: string, pretest: boolean) => void;
    handleExampleSubmit: (code: string, pretest: boolean) => void;
}) {
    const [submissions, setSumbissions] = useState<TestCaseSubmission[]>([]);
    const [pretestResults, setPretestResults] = useState<TestCaseSubmission[]>(
        [],
    );
    const [result, setResult] = useState<TotalResult | null>(null);
    const [submissionResults, setSubmissionResults] = useState<{
        [key: number]: SubmissionResult;
    } | null>(null);

    const [activeTab, setActiveTab] = useState<string | null>('first');
    const websocketUrl = `ws://localhost:9010/general/ws`;
    const { sendMessage, lastMessage, readyState } = useWebSocket(
        websocketUrl,
        {
            shouldReconnect: () => true,
            reconnectAttempts: 10,
            reconnectInterval: 2000,
        },
    );

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const message = JSON.parse(lastMessage.data);
                if (message.type && message.type === 'total') {
                    const totalResult: TotalResult = message;
                    setResult(totalResult);
                } else {
                    const submission: TestCaseSubmission = message;
                    if (submission.is_pretest_run) {
                        setPretestResults((prev) => [...prev, submission]);
                    } else {
                        setSumbissions((prev) => [...prev, submission]);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }, [lastMessage]);

    useEffect(() => {
        testCases?.sort((a, b) => a.number - b.number);
    }, [testCases]);

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

    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const [value, setValue] = useState<string | null>();

    useEffect(() => {
        setValue(testCases ? `case-${testCases[0].number}` : null);
    }, [testCases]);

    const controlsRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const setControlRef = (val: string) => (node: HTMLButtonElement | null) => {
        if (node) {
            controlsRefs.current[val] = node;
        }
    };

    const getResultString = (result: TestCaseSubmission) => {
        if (result.result_id === 1) {
            return (
                <Text size='md' c='green'>
                    Correct
                </Text>
            );
        } else if (result.result_id === 2) {
            return (
                <Text size='md' c='red'>
                    Wrong Answer
                </Text>
            );
        } else if (result.result_id === 3) {
            return (
                <Text size='md' c='yellow'>
                    Time Limit Exceeded
                </Text>
            );
        } else if (result.result_id === 4) {
            return (
                <Text size='md' c='blue'>
                    Memory Limit Exceeded
                </Text>
            );
        } else if (result.result_id === 5) {
            return (
                <Text size='md' c='blue'>
                    Compilation Error
                </Text>
            );
        }
    };

    useEffect(() => {
        getSubmissionResults();
    }, [getSubmissionResults]);

    const submitCode = async () => {
        setSumbissions([]);
        setResult(null);
        handleSubmit(code, false);
        if (activeTab === 'first') {
            setActiveTab('second');
        }
    };

    const submitCodeExample = async () => {
        setPretestResults([]);
        setResult(null);
        handleExampleSubmit(code, true);
        if (activeTab === 'second') {
            setActiveTab('first');
        }
    };

    return (
        <MosaicWindow
            additionalControls={[]}
            title='Submissions'
            path={path}
            renderToolbar={() => (
                <div className='w-full'>
                    <Flex justify='space-between' align='center' p='xs'>
                        <Tabs value={activeTab} onChange={setActiveTab}>
                            <Tabs.List>
                                <Tabs.Tab value='first'>Test Cases</Tabs.Tab>
                                <Tabs.Tab value='second'>Results</Tabs.Tab>
                            </Tabs.List>
                        </Tabs>

                        <Flex gap='sm'>
                            <Button
                                leftSection={<FaPlay />}
                                onClick={submitCodeExample}
                                variant='light'
                            >
                                Run Example
                            </Button>
                            <Button
                                leftSection={<FaRegPaperPlane />}
                                onClick={submitCode}
                            >
                                Submit
                            </Button>
                        </Flex>
                    </Flex>
                </div>
            )}
        >
            <Flex direction='column' h='100%' bg='white'>
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.Panel value='first'>
                        <Box>
                            {testCases && (
                                <Tabs
                                    variant='none'
                                    value={value}
                                    onChange={setValue}
                                    py={10}
                                >
                                    <Tabs.List
                                        ref={setRootRef}
                                        className={classes.list}
                                        p={8}
                                    >
                                        {testCases.map((test, index) => {
                                            const subResult =
                                                pretestResults.find(
                                                    (submission) =>
                                                        submission.number ===
                                                        test.number,
                                                );
                                            const color =
                                                subResult?.result_id === 1
                                                    ? 'green'
                                                    : 'red';

                                            return (
                                                <Indicator
                                                    key={test.number}
                                                    position='top-end'
                                                    size='7'
                                                    ml={10}
                                                    p={2}
                                                    color={color}
                                                    disabled={
                                                        subResult === undefined
                                                    }
                                                >
                                                    <Tabs.Tab
                                                        value={`case-${test.number}`}
                                                        ref={setControlRef(
                                                            `case-${test.number}`,
                                                        )}
                                                        className={classes.tab}
                                                    >
                                                        <Text size='sm'>{`Case ${test.number}`}</Text>
                                                    </Tabs.Tab>
                                                </Indicator>
                                            );
                                        })}

                                        <FloatingIndicator
                                            target={
                                                value
                                                    ? controlsRefs.current[
                                                    value
                                                    ]
                                                    : null
                                            }
                                            parent={rootRef}
                                            className={classes.indicator}
                                        />
                                    </Tabs.List>

                                    {testCases.map((test, index) => {
                                        const partialResult = pretestResults.find(
                                            (submission) =>
                                                submission.number ===
                                                test.number,
                                        );

                                        return (
                                            <Tabs.Panel
                                                key={index}
                                                value={`case-${test.number}`}
                                                px='md'
                                            >
                                                <ScrollArea>
                                                    {partialResult && (
                                                        <Box mb='md'>
                                                            {getResultString(
                                                                partialResult,
                                                            )}
                                                        </Box>
                                                    )}
                                                    {(partialResult?.notes && partialResult.notes !== '') || (result && result.is_pretest_run && result.result !== '') && (
                                                        <Blockquote c={'red'} color='red'>
                                                            {partialResult?.notes ?? result?.result}
                                                        </Blockquote>
                                                    )}
                                                    <Box>
                                                        <Text
                                                            size='sm'
                                                            c='gray'
                                                        >
                                                            Input =
                                                        </Text>
                                                        <Box
                                                            bg='gray.1'
                                                            p='xs'
                                                            style={{
                                                                borderRadius:
                                                                    '6px',
                                                            }}
                                                        >
                                                            {test.input}
                                                        </Box>
                                                    </Box>

                                                    <Box mt='md'>
                                                        <Text
                                                            size='sm'
                                                            c='gray'
                                                        >
                                                            Target =
                                                        </Text>

                                                        <Box
                                                            bg='gray.1'
                                                            p='xs'
                                                            style={{
                                                                borderRadius:
                                                                    '6px',
                                                            }}
                                                        >
                                                            {test.output}
                                                        </Box>
                                                    </Box>
                                                    {partialResult && partialResult.notes === '' && (
                                                        <Box mt='md'>
                                                            <Text
                                                                size='sm'
                                                                c='gray'
                                                            >
                                                                Result =
                                                            </Text>
                                                            <Box
                                                                bg='gray.1'
                                                                p='xs'
                                                                style={{
                                                                    borderRadius:
                                                                        '6px',
                                                                }}
                                                            >
                                                                {partialResult.output}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </ScrollArea>
                                            </Tabs.Panel>
                                        );
                                    })}
                                </Tabs>
                            )}
                        </Box>
                    </Tabs.Panel>

                    <Tabs.Panel value='second'>
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
                                            <FaCode
                                                color='gray'
                                                fontSize='4em'
                                            />
                                            <Text c='dimmed' mt='xs'>
                                                Submit the code to see the
                                                results!
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
                                                {submissions.map(
                                                    (submission) => (
                                                        (
                                                            <Table.Tr
                                                                key={
                                                                    submission.number
                                                                }
                                                            >
                                                                <Table.Td>
                                                                    {
                                                                        submission.number
                                                                    }
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    {submission.time.toFixed(
                                                                        6,
                                                                    )}{' '}
                                                                    s
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    {(
                                                                        submission.memory /
                                                                        1024
                                                                    ).toFixed(
                                                                        2,
                                                                    )}{' '}
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
                                                        )
                                                    ),
                                                )}
                                            </Table.Tbody>
                                        </Table>
                                    )}
                                </Flex>
                                <Container h='100%' p='xs'>
                                    {result && result.result &&
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
                                            bg={
                                                result.result &&
                                                    result.result !== ''
                                                    ? 'red-100'
                                                    : 'white'
                                            }
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
                    </Tabs.Panel>
                </Tabs>
            </Flex>
        </MosaicWindow>
    );
}

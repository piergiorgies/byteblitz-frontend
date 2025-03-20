import { ProblemTestCase } from "@/models/Problem";
import { SubmissionResult, TestCaseSubmission, TotalResult } from "@/models/Submission";
import api from "@/utils/ky";
import { Box, Button, Card, Flex, FloatingIndicator, ScrollArea, Table, Tabs, Text } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCode, FaPlay, FaRegPaperPlane } from "react-icons/fa6";
import { MosaicBranch, MosaicWindow } from "react-mosaic-component";
import useWebSocket from "react-use-websocket";
import SubmissionResultIcon from "./SubmissionResult";
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
    const [pretestResults, setPretestResults] = useState<TestCaseSubmission[]>([]);
    const [result, setResult] = useState<TotalResult | null>(null);
    const [submissionResults, setSubmissionResults] = useState<{
        [key: number]: SubmissionResult;
    } | null>(null);

    const [activeTab, setActiveTab] = useState<string | null>('first');
    const websocketUrl = `ws://localhost:9000/general/ws`;
    const { sendMessage, lastMessage, readyState } = useWebSocket(websocketUrl, {
        shouldReconnect: () => true,
        reconnectAttempts: 10,
        reconnectInterval: 2000,
    });

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const message = JSON.parse(lastMessage.data);
                if (message.type && message.type === 'total') {
                    const totalResult: TotalResult = message;
                    setResult(totalResult);
                }
                else {
                    const submission: TestCaseSubmission = message;
                    if (submission.is_pretest_run) {
                        if (activeTab === 'second') {
                            setActiveTab('first');
                        }
                        setPretestResults((prev) => [...prev, submission]);
                    }
                    else {
                        if (activeTab === 'first') {
                            setActiveTab('second');
                        }
                        setSumbissions((prev) => [...prev, submission]);
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    }, [lastMessage]);

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
    const [value, setValue] = useState<string | null>("case-1");
    const controlsRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const setControlRef = (val: string) => (node: HTMLButtonElement | null) => {
        if (node) {
            controlsRefs.current[val] = node;
        }
    };

    const getResultString = (result: TestCaseSubmission) => {

        // get the tab ref for the selected tab
        const selectedTabRef = controlsRefs.current[result.number];
        const indicator = rootRef?.querySelector('.mantine-tabs-indicator');

        console.log(selectedTabRef);
        console.log(indicator);

        if (result.result_id === 1) {
            return (
                <Text size='md' c='green'>Correct</Text>
            );
        }
        else if (result.result_id === 2) {
            return (
                <Text size='md' c='red'>Wrong Answer</Text>
            );
        }
        else if (result.result_id === 3) {
            return (
                <Text size='md' c='yellow'>Time Limit Exceeded</Text>
            );
        }
        else if (result.result_id === 4) {
            return (
                <Text size='md' c='blue'>Memory Limit Exceeded</Text>
            );
        }
        else if (result.result_id === 5) {
            return (
                <Text size='md' c='blue'>Compilation Error</Text>
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
    };

    const submitCodeExample = async () => {
        setPretestResults([]);
        setResult(null);
        handleExampleSubmit(code, true);
    };

    return (
        <MosaicWindow additionalControls={[]} title='Submissions' path={path}
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
            )
            }
        >
            <Flex direction='column' h='100%' bg='white'>
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.Panel value='first'>
                        <Box>
                            {testCases && (
                                <Tabs variant="none" value={value} onChange={setValue} p={10}>
                                    <Tabs.List ref={setRootRef} className={classes.list}>
                                        {testCases.map((test, index) => (
                                            <Tabs.Tab
                                                key={test.number}
                                                value={`case-${test.number}`}
                                                ref={setControlRef(`case-${test.number}`)}
                                                className={classes.tab}
                                            >
                                                {`Case ${index + 1}`}
                                            </Tabs.Tab>
                                        ))}

                                        <FloatingIndicator
                                            target={value ? controlsRefs.current[value] : null}
                                            parent={rootRef}
                                            className={classes.indicator}
                                        />
                                    </Tabs.List>

                                    {testCases.map((test, index) => {
                                        const result = pretestResults.find(
                                            (submission) => submission.number === test.number
                                        );

                                        return (
                                            <Tabs.Panel key={index} value={`case-${index + 1}`} p="md">
                                                <ScrollArea>
                                                    {result && (
                                                        <Box mb="md">
                                                            {getResultString(result)}
                                                        </Box>
                                                    )}
                                                    <Box>
                                                        <Text size="sm" c="gray">Input =</Text>
                                                        <Box bg="gray.1" p="xs" style={{ borderRadius: '10px' }}>
                                                            {test.input}
                                                        </Box>
                                                    </Box>

                                                    <Box mt="md">
                                                        <Text size="sm" c="gray">Target =</Text>

                                                        <Box bg="gray.1" p="xs" style={{ borderRadius: '10px' }}>
                                                            {test.output}
                                                        </Box>
                                                    </Box>
                                                    {result && (
                                                        <Box mt="md">
                                                            <Text size="sm" c="gray">Result =</Text>
                                                            <Box bg="gray.1" p="xs" style={{ borderRadius: '10px' }}>
                                                                {result.output}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </ScrollArea>
                                            </Tabs.Panel>
                                        )
                                    }
                                    )}
                                </Tabs>
                            )}
                        </Box>
                    </Tabs.Panel>

                    <Tabs.Panel value='second'>
                        <Flex direction='column' h='100%'>
                            <ScrollArea h='95%' w='100%'>
                                <Flex h='100%' p='xs'>
                                    {submissions.length === 0 ? (
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
                                                    console.log(submission),
                                                    <Table.Tr key={submission.number}>
                                                        <Table.Td>
                                                            {submission.number}
                                                        </Table.Td>
                                                        <Table.Td>
                                                            {submission.time.toFixed(6)} s
                                                        </Table.Td>
                                                        <Table.Td>
                                                            {(submission.memory / 1024).toFixed(2)} MB
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <SubmissionResultIcon
                                                                resultId={submission.result_id}
                                                                submissionResults={submissionResults}
                                                            />
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    )}
                                </Flex>

                                {result && (
                                    <Card shadow='sm' p='lg' radius='md' withBorder bg={result.result && result.result !== '' ? 'red-100' : 'white'}>
                                        <Text w={700} size='lg'>Total Result</Text>
                                        <Text size='md' mt='xs'>Score: <b>{result.score}</b></Text>
                                        {result.result && result.result !== '' && (
                                            <Text c='red' size='md' mt='xs'>Error: {result.result}</Text>
                                        )}
                                    </Card>
                                )}
                            </ScrollArea>
                        </Flex>
                    </Tabs.Panel>
                </Tabs>
            </Flex>
        </MosaicWindow >
    );
}
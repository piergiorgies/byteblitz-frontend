import { ProblemTestCase } from '@/models/Problem';
import {
    Blockquote,
    Box,
    FloatingIndicator,
    Indicator,
    ScrollArea,
    Tabs,
    Text,
} from '@mantine/core';
import { useContext, useEffect, useRef, useState } from 'react';
import classes from './ResultWindow.module.css';
import { TestCaseSubmission, TotalResult } from '@/models/Submission';
import { SubmissionContext } from '../contexts/SubmissionContext';
import useWebSocket from 'react-use-websocket';

export default function PretestWindow({
    testCases,
}: {
    testCases: ProblemTestCase[] | null;
}) {
    useEffect(() => {
        if (testCases === null) return;
        testCases?.sort((a, b) => a.number - b.number);
    }, [testCases]);

    const { pretestResults, setPretestResults, result, setResult } =
        useContext(SubmissionContext);

    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const [value, setValue] = useState<string | null>();

    useEffect(() => {
        setValue(
            testCases && testCases[0] ? `case-${testCases[0].number}` : null,
        );
    }, [testCases]);

    const controlsRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const setControlRef = (val: string) => (node: HTMLButtonElement | null) => {
        if (node) {
            controlsRefs.current[val] = node;
        }
    };
    const websocketUrl = `wss://byteblitz.ziocecio.it/api/general/ws`;
    const { sendMessage, lastMessage, readyState } = useWebSocket(
        websocketUrl,
        {
            shouldReconnect: () => true,
            reconnectAttempts: 10,
            reconnectInterval: 2000,
            share: true,
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
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }, [lastMessage]);

    const getResultString = (result: TestCaseSubmission) => {
        const colorMap: Record<number, string> = {
            1: 'green',
            2: 'red',
            3: 'yellow',
            4: 'blue',
            5: 'blue',
        };
        const labelMap: Record<number, string> = {
            1: 'Correct',
            2: 'Wrong Answer',
            3: 'Time Limit Exceeded',
            4: 'Memory Limit Exceeded',
            5: 'Compilation Error',
        };
        if (!colorMap[result.result_id]) return null;
        return (
            <Text size='md' c={colorMap[result.result_id]}>
                {labelMap[result.result_id]}
            </Text>
        );
    };

    if (!Array.isArray(testCases) || testCases.length === 0) {
        return (
            <Box p='md'>
                <Text c='dimmed'>No test cases available.</Text>
            </Box>
        );
    }

    return (
        <Box>
            {testCases && (
                <Tabs variant='none' value={value} onChange={setValue} py={10}>
                    <Tabs.List ref={setRootRef} className={classes.list} p={8}>
                        {testCases.map((test, index) => {
                            const subResult = pretestResults.find(
                                (submission) =>
                                    submission.number === test.number,
                            );
                            const color =
                                subResult?.result_id === 1 ? 'green' : 'red';

                            return (
                                <Indicator
                                    key={test.number}
                                    position='top-end'
                                    size='7'
                                    ml={10}
                                    p={2}
                                    color={color}
                                    disabled={subResult === undefined}
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
                            target={value ? controlsRefs.current[value] : null}
                            parent={rootRef}
                            className={classes.indicator}
                        />
                    </Tabs.List>

                    {testCases.map((test, index) => {
                        const partialResult = pretestResults.find(
                            (submission) => submission.number === test.number,
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
                                            {getResultString(partialResult)}
                                        </Box>
                                    )}
                                    {((partialResult?.notes != null &&
                                        partialResult.notes !== '') ||
                                        (result &&
                                            result.is_pretest_run &&
                                            result.result !== '')) && (
                                        <Blockquote c={'red'} color='red'>
                                            {partialResult?.notes ??
                                                result?.result}
                                        </Blockquote>
                                    )}
                                    <Box>
                                        <Text size='sm' c='gray'>
                                            Input =
                                        </Text>
                                        <Box
                                            bg='gray.1'
                                            p='xs'
                                            style={{
                                                borderRadius: '6px',
                                            }}
                                        >
                                            <pre>{test.input}</pre>
                                        </Box>
                                    </Box>

                                    <Box mt='md'>
                                        <Text size='sm' c='gray'>
                                            Target =
                                        </Text>

                                        <Box
                                            bg='gray.1'
                                            p='xs'
                                            style={{
                                                borderRadius: '6px',
                                            }}
                                        >
                                            {test.output}
                                        </Box>
                                    </Box>
                                    {partialResult &&
                                        partialResult.notes === '' && (
                                            <Box mt='md'>
                                                <Text size='sm' c='gray'>
                                                    Result =
                                                </Text>
                                                <Box
                                                    bg='gray.1'
                                                    p='xs'
                                                    style={{
                                                        borderRadius: '6px',
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
    );
}

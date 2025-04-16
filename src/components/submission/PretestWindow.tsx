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

export default function PretestWindow({
    testCases,
}: {
    testCases: ProblemTestCase[] | null;
}) {
    useEffect(() => {
        testCases?.sort((a, b) => a.number - b.number);
    }, [testCases]);

    const { pretestResults, result } = useContext(SubmissionContext);

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
                                            {test.input}
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

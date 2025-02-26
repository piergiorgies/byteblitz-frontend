'use client';

import { Editor } from '@monaco-editor/react';
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';

import dynamic from 'next/dynamic';

const Mosaic = dynamic(
    () => import('react-mosaic-component').then((mod) => mod.Mosaic),
    {
        ssr: false,
    },
);
const MosaicWindow = dynamic(
    () => import('react-mosaic-component').then((mod) => mod.MosaicWindow),
    {
        ssr: false,
    },
);

import 'react-mosaic-component/react-mosaic-component.css';
import Markdown from 'react-markdown';
import api from '@/utils/ky';
import { MosaicBranch } from 'react-mosaic-component';
import { useParams } from 'next/navigation';
import { Problem } from '@/models/Problem';
import { objectToCamel } from 'ts-case-convert';
import {
    Button,
    Center,
    Combobox,
    Container,
    Divider,
    Flex,
    ScrollArea,
    Table,
    Text,
    Title,
    Tooltip,
    useCombobox,
} from '@mantine/core';
import { Language } from '@/models/Language';
import {
    FaChevronDown,
    FaCode,
    FaMemory,
    FaRegCircleCheck,
    FaRegCircleXmark,
    FaRegClock,
    FaRegFileExcel,
    FaRegPaperPlane,
    FaUpload,
} from 'react-icons/fa6';
import { SubmissionResult, TestCaseSubmission } from '@/models/Submission';

export default function Submission() {
    const params = useParams();
    const [problemInfo, setProblemInfo] = useState<Problem | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
        null,
    );
    const [code, setCode] = useState<string>('');

    const getProblemInfo = useCallback(async () => {
        const { problemId } = params;
        try {
            const response = await api.get(`problems/${problemId}`);
            const problem = objectToCamel(await response.json<Problem>());
            setProblemInfo(problem);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        getProblemInfo();
    }, [getProblemInfo]);

    const handleSubmit = async (code: string) => {
        try {
            const response = await api.post('submissions', {
                json: {
                    problem_id: params.problemId,
                    language_id: (selectedLanguage?.id ?? 1).toString(),
                    submitted_code: code,
                    notes: '',
                },
            });

            console.log(response);
        } catch (error) {
            console.log(error);
        }
    };

    const windows: { [key: string]: (path: MosaicBranch[]) => JSX.Element } = {
        '0': (path: MosaicBranch[]) => (
            <ProblemWindow path={path} problemInfo={problemInfo} />
        ),
        '1': (path: MosaicBranch[]) => (
            <MonacoWindow
                path={path}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                code={code}
                setCode={setCode}
            />
        ),
        '2': (path: MosaicBranch[]) => (
            <ResultsWindow
                path={path}
                code={code}
                handleSubmit={handleSubmit}
            />
        ),
    };

    return (
        <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
            <Mosaic
                renderTile={(count, path) => windows[count.toString()](path)}
                initialValue={{
                    direction: 'row',
                    first: '0',
                    second: {
                        direction: 'column',
                        first: '1',
                        second: '2',
                    },
                    splitPercentage: 40,
                }}
            />
        </div>
    );
}

function ProblemWindow({
    path,
    problemInfo,
}: {
    path: MosaicBranch[];
    problemInfo: any;
}) {
    return (
        <MosaicWindow additionalControls={[]} title='Problem' path={path}>
            <Container fluid bg='white' h='100%'>
                <Center>
                    <Title fs='italic'>{problemInfo?.title ?? ''}</Title>
                </Center>

                <Markdown>{problemInfo?.description ?? ''}</Markdown>
            </Container>
        </MosaicWindow>
    );
}

function ResultsWindow({
    path,
    code,
    handleSubmit,
}: {
    path: MosaicBranch[];
    code: string;
    handleSubmit: (code: string) => void;
}) {
    const [submissions, setSumbissions] = useState<TestCaseSubmission[]>([]);
    const [submissionResults, setSubmissionResults] = useState<{
        [key: number]: SubmissionResult;
    } | null>(null);

    const getSubmissionResultIcon = (resultId: number) => {
        if (submissionResults == null) return <></>;
        const resultCode = submissionResults[resultId].code;

        if (resultCode === 'AC') {
            return (
                <Tooltip position='top-start' label='Accepted Answer'>
                    <Flex direction='row' align='center' gap='xs' c='green'>
                        <Text>AC</Text> <FaRegCircleCheck />
                    </Flex>
                </Tooltip>
            );
        } else if (resultCode === 'WA') {
            return (
                <Tooltip position='top-start' label='Wrong Answer'>
                    <Flex direction='row' align='center' gap='xs' c='red'>
                        <Text>WA</Text>
                        <FaRegCircleXmark />
                    </Flex>
                </Tooltip>
            );
        } else if (resultCode === 'TLE') {
            return (
                <Tooltip position='top-start' label='Time Limit'>
                    <Flex direction='row' align='center' gap='xs' c='orange'>
                        <Text>TLE</Text>
                        <FaRegClock />
                    </Flex>
                </Tooltip>
            );
        } else if (resultCode === 'MLE') {
            return (
                <Tooltip position='top-start' label='Memory Limit'>
                    <Flex direction='row' align='center' gap='xs' c='orange'>
                        <Text>MLE</Text>
                        <FaMemory />
                    </Flex>
                </Tooltip>
            );
        } else if (resultCode === 'CE') {
            return (
                <Tooltip position='top-start' label='Compilation Error'>
                    <Flex direction='row' align='center' gap='xs' c='red'>
                        <Text>CE</Text>
                        <FaRegFileExcel />
                    </Flex>
                </Tooltip>
            );
        }

        return <></>;
    };

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

            // setSumbissions([
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 2 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 3 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 4 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 5 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            //     { number: 1, notes: '', time: 10, memory: 10, resultId: 1 },
            // ]);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        getSubmissionResults();
    }, [getSubmissionResults]);

    const submitCode = async () => {
        console.log('Submitting Code:', code);
        handleSubmit(code);
    };

    return (
        <MosaicWindow additionalControls={[]} title='Submissions' path={path}>
            <Flex direction='column' h='100%' bg='white'>
                <Flex p='xs' justify='end'>
                    <Button
                        leftSection={<FaRegPaperPlane />}
                        onClick={submitCode}
                    >
                        Submit
                    </Button>
                </Flex>

                <Divider />

                <Flex h='100%' p='xs'>
                    {submissions.length === 0 ? (
                        <Flex
                            direction='column'
                            justify='center'
                            align='center'
                            w='100%'
                        >
                            <FaCode color='gray' fontSize='4em' />
                            <Text c='dimmed' mt='xs'>
                                Submit the code to see the results!
                            </Text>
                        </Flex>
                    ) : (
                        <ScrollArea h='95%' w='100%'>
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
                                                {submission.time} ms
                                            </Table.Td>
                                            <Table.Td>
                                                {submission.memory} MB
                                            </Table.Td>
                                            <Table.Td>
                                                {getSubmissionResultIcon(
                                                    submission.resultId,
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    )}
                </Flex>
            </Flex>
        </MosaicWindow>
    );
}

function MonacoWindow({
    path,
    selectedLanguage,
    code,
    setCode,
    setSelectedLanguage,
}: {
    path: MosaicBranch[];
    selectedLanguage: Language | null;
    code: string;
    setCode: (code: string) => void;
    setSelectedLanguage: Dispatch<SetStateAction<Language | null>>;
}) {
    const [languages, setLanguages] = useState<Language[]>([]);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const getLanguages = useCallback(async () => {
        try {
            const response = await api.get('problems/languages/available');
            const returnedLanguages = objectToCamel(
                await response.json<Language[]>(),
            );
            setLanguages(returnedLanguages);
            if (returnedLanguages.length > 0)
                setSelectedLanguage(returnedLanguages[0]);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        getLanguages().then(() => combobox.closeDropdown());
    }, [getLanguages]);

    return (
        <MosaicWindow additionalControls={[]} title='Code' path={path}>
            <Flex bg='white' justify='space-between' px='xs'>
                <Combobox
                    store={combobox}
                    width={250}
                    position='bottom-start'
                    onOptionSubmit={(value) => {
                        setSelectedLanguage(
                            languages.find(
                                (lang) => lang.id.toString() === value,
                            ) || null,
                        );
                        combobox.closeDropdown();
                    }}
                >
                    <Combobox.Target>
                        <Button
                            size='xs'
                            color='gray'
                            variant='subtle'
                            onClick={() => combobox.toggleDropdown()}
                        >
                            <Flex align='center'>
                                <Text me='xs'>
                                    {selectedLanguage?.name ?? ''}
                                </Text>
                                <FaChevronDown />
                            </Flex>
                        </Button>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                        <Combobox.Options>
                            {languages.map((language) => (
                                <Combobox.Option
                                    value={language.id.toString()}
                                    key={language.id}
                                >
                                    {language.name}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>

                <Flex>
                    <Tooltip label='Load code'>
                        <Button size='xs' color='gray' variant='subtle'>
                            <FaUpload />
                        </Button>
                    </Tooltip>
                </Flex>
            </Flex>

            <Editor
                theme='vs-dark'
                language={selectedLanguage?.code ?? 'cpp'}
                value={code}
                onChange={(value) => setCode(value || '')}
            />
        </MosaicWindow>
    );
}

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
import useWebSocket, { ReadyState } from 'react-use-websocket';

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
    Card,
    Center,
    Combobox,
    Container,
    Divider,
    Flex,
    ScrollArea,
    Space,
    Table,
    Tabs,
    Text,
    Title,
    Tooltip,
    useCombobox,
} from '@mantine/core';
import { Language } from '@/models/Language';
import {
    FaChevronDown,
    FaCloud,
    FaCode,
    FaPlay,
    FaRegCircleCheck,
    FaRegPaperPlane,
    FaUpload,
} from 'react-icons/fa6';
import { SubmissionResult, TestCaseSubmission, TotalResult } from '@/models/Submission';
import { useDebouncedCallback } from '@mantine/hooks';
import SubmissionResultIcon from '@/components/submission/SubmissionResult';
import SubmissionTable from '@/components/submission/SubmissionTable';
import { IoCloudDoneOutline } from "react-icons/io5";

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

    const handleSubmit = async (code: string, pretest: boolean) => {
        try {
            const response = await api.post('submissions', {
                json: {
                    problem_id: params.problemId,
                    language_id: (selectedLanguage?.id ?? 1).toString(),
                    submitted_code: code,
                    notes: '',
                    is_pretest_run: pretest,
                },
            });
        } catch (error) {
            console.log(error);
        }
    };

    const windows: { [key: string]: (path: MosaicBranch[]) => JSX.Element } = {
        '0': (path: MosaicBranch[]) => (
            <ProblemWindow path={path} problemInfo={problemInfo} setCode={setCode} />
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
                handleExampleSubmit={handleSubmit}
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
    setCode,
}: {
    path: MosaicBranch[];
    problemInfo: any;
    setCode: Dispatch<SetStateAction<string>>;
}) {
    const [activeTab, setActiveTab] = useState<string | null>('first');

    return (
        <MosaicWindow
            additionalControls={[]}
            title='Problem'
            path={path}
            renderToolbar={() => (
                <div className='w-full'>
                    <Flex w='100%'>
                        <Tabs value={activeTab} onChange={setActiveTab}>
                            <Tabs.List>
                                <Tabs.Tab value='first'>Problem</Tabs.Tab>
                                <Tabs.Tab value='second'>Submissions</Tabs.Tab>
                            </Tabs.List>
                        </Tabs>
                    </Flex>
                </div>
            )}
        >
            <Container fluid bg='white' h='100%'>
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.Panel value='first'>
                        <Center>
                            <Title fs='italic'>{problemInfo?.title ?? ''}</Title>
                        </Center>
                        <Markdown>{problemInfo?.description ?? ''}</Markdown>
                    </Tabs.Panel>
                    <Tabs.Panel value='second'>
                        <Center>
                            <Title fs='italic'>Submissions</Title>
                        </Center>
                        <SubmissionTable
                            setCode={setCode}
                            problemId={problemInfo?.id ?? 0}
                        />
                    </Tabs.Panel>
                </Tabs>
            </Container>
        </MosaicWindow>
    );
}

function ResultsWindow({
    path,
    code,
    handleSubmit,
    handleExampleSubmit,
}: {
    path: MosaicBranch[];
    code: string;
    handleSubmit: (code: string, pretest: boolean) => void;
    handleExampleSubmit: (code: string, pretest: boolean) => void;
}) {
    const [submissions, setSumbissions] = useState<TestCaseSubmission[]>([]);
    const [result, setResult] = useState<TotalResult | null>(null);
    const [submissionResults, setSubmissionResults] = useState<{
        [key: number]: SubmissionResult;
    } | null>(null);

    const websocketUrl = `ws://localhost:9010/general/ws`;
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
                    setSumbissions((prev) => [...prev, submission]);
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

    useEffect(() => {
        getSubmissionResults();
    }, [getSubmissionResults]);

    const submitCode = async () => {
        setSumbissions([]);
        setResult(null);
        handleSubmit(code, false);
    };

    const submitCodeExample = async () => {
        setSumbissions([]);
        setResult(null);
        handleExampleSubmit(code, true);
    };

    return (
        <MosaicWindow additionalControls={[]} title='Submissions' path={path}>
            <Flex direction='column' h='100%' bg='white'>
                <Flex p='xs' justify='end'>
                    <Button
                        leftSection={<FaPlay />}
                        onClick={submitCodeExample}
                        variant='light'
                    >
                        Run Example
                    </Button>
                    <Space w={5} />
                    <Button
                        leftSection={<FaRegPaperPlane />}
                        onClick={submitCode}
                    >
                        Submit
                    </Button>
                </Flex>

                <Divider />

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
            </Flex>
        </MosaicWindow >
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

    const saveCode = useDebouncedCallback((code: string) => {
        localStorage.setItem('savedCode', code);
        setSaved(true);
    }, 1000);

    const [saved, setSaved] = useState(false);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    useEffect(() => {
        const savedCode = localStorage.getItem('savedCode');
        if (savedCode) {
            setCode(savedCode);
        }
    }, []);

    const getLanguages = useCallback(async () => {
        try {
            const response = await api.get('problems/languages/available');
            const returnedLanguages = objectToCamel(
                await response.json<Language[]>(),
            );
            setLanguages(returnedLanguages);
            if (returnedLanguages.length > 0) {
                const selectedLanguageId = localStorage.getItem('selectedLanguage') ?? '1';
                setSelectedLanguage(returnedLanguages.find(lang => lang.id.toString() === selectedLanguageId) ?? returnedLanguages[0]);
            }
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
                        localStorage.setItem('selectedLanguage', value);
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
                    {saved && (
                        <Tooltip label='Code saved locally'>
                            <Button color='green' variant='subtle'>
                                <IoCloudDoneOutline />
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip label='Load code'>
                        <Button color='gray' variant='subtle'>
                            <FaUpload />
                        </Button>
                    </Tooltip>
                </Flex>
            </Flex>

            <Editor
                theme='vs-dark'
                language={selectedLanguage?.code ?? 'cpp'}
                value={code}
                onChange={(value) => {
                    setSaved(false);
                    setCode(value || '')
                    saveCode(value || '');
                }
                }
            />
        </MosaicWindow>
    );
}

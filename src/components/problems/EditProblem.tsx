'use client';

import {
    Box,
    Button,
    Checkbox,
    Divider,
    Flex,
    Group,
    NumberInput,
    Select,
    SimpleGrid,
    Table,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useForm } from '@mantine/form';
import { RichTextEditor } from '@mantine/tiptap';
import { Markdown } from 'tiptap-markdown';
import { FaPlus, FaRegFileZipper, FaX } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import {
    ConstraintsInfoInForm,
    Problem,
    ProblemTestCase,
} from '@/models/Problem';
import { Language } from '@/models/Language';
import api from '@/utils/ky';

import '@mantine/tiptap/styles.css';
import '@mantine/dropzone/styles.css';
import { parseTestCasesZipFile } from '@/utils/files';

type onProblemSave = (problem: Problem) => Promise<void>;

export default function EditProblem({
    onProblemSave,
    savedProblem,
}: {
    onProblemSave: onProblemSave;
    savedProblem?: Problem;
}) {
    const problemTextEditor = useEditor({
        extensions: [StarterKit, Markdown],
        content: savedProblem?.description ?? '',
        immediatelyRender: false,
    });

    const problemInfoForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            title: savedProblem?.title ?? '',
            points: savedProblem?.points ?? 100,
            versionNumber: 1,
            isPublic: savedProblem?.isPublic ?? false,
            description: savedProblem?.description ?? '',
            timeLimit: 1000,
            memoryLimit: 256,
        },
    });

    const [languages, setLanguages] = useState<Language[]>([]);
    const [specificLimits, setSpecificLimits] = useState<
        ConstraintsInfoInForm[]
    >(savedProblem?.constraints ?? []);
    const [problemTestCases, setProblemTestCases] = useState<ProblemTestCase[]>(
        savedProblem?.testCases ?? [],
    );
    const [isProblemSaving, setIsProblemSaving] = useState(false);

    const addSpecificLimit = () => {
        setSpecificLimits((prev) => [
            ...prev,
            { languageId: -1, timeLimit: 1000, memoryLimit: 256 },
        ]);
    };
    const removeSpecificLimit = (index: number) => {
        setSpecificLimits((prev) => prev.filter((_, i) => i !== index));
    };
    const updateSpecificLimit = (
        index: number,
        key: keyof ConstraintsInfoInForm,
        value: string | number | null,
    ) => {
        setSpecificLimits((prev) =>
            prev.map((constraint, i) =>
                i === index ? { ...constraint, [key]: value } : constraint,
            ),
        );
    };

    const addTestCase = () => {
        setProblemTestCases((prev) => [
            ...prev,
            { input: '', output: '', isPretest: false, points: 0 },
        ]);
    };
    const removeTestCase = (index: number) => {
        setProblemTestCases((prev) => prev.filter((_, i) => i !== index));
    };
    const updateTestCase = (
        index: number,
        key: keyof ProblemTestCase,
        value: string | number,
    ) => {
        setProblemTestCases((prev) =>
            prev.map((testCase, i) =>
                i === index ? { ...testCase, [key]: value } : testCase,
            ),
        );
    };

    const saveProblem = async (values: typeof problemInfoForm.values) => {
        setIsProblemSaving(true);

        const limits = new Map<number, ConstraintsInfoInForm>();
        for (const limit of specificLimits) {
            const id = Number(limit.languageId);
            limits.set(id, {
                languageId: id,
                timeLimit: limit.timeLimit,
                memoryLimit: limit.memoryLimit,
            });
        }

        for (const language of languages) {
            if (!limits.has(language.id)) {
                limits.set(Number(language.id), {
                    languageId: Number(language.id),
                    timeLimit: values.timeLimit,
                    memoryLimit: values.memoryLimit,
                });
            }
        }

        const mergedLimits = Array.from(limits.values()).reduce<
            ConstraintsInfoInForm[]
        >((acc, curr) => {
            const saved = acc.find(
                (limit) => limit.languageId === curr.languageId,
            );
            if (saved != null) {
                saved.timeLimit = Math.min(saved.timeLimit, curr.timeLimit);
                saved.memoryLimit = Math.min(
                    saved.memoryLimit,
                    curr.memoryLimit,
                );
            } else {
                acc.push(curr);
            }

            return acc;
        }, []);

        const problem: Problem = {
            title: values.title,
            description:
                problemTextEditor?.storage?.markdown?.getMarkdown() ?? '',
            points: values.points,
            isPublic: values.isPublic,
            constraints: mergedLimits,
            testCases: problemTestCases,
        };

        await onProblemSave(problem);

        setIsProblemSaving(false);
    };

    const getLanguages = async () => {
        try {
            const response = await api.get('admin/problems/languages/available');
            const availableLanguages = await response.json<Language[]>();
            setLanguages(availableLanguages);
        } catch (error) {
            console.log(error);
        }
    };

    const onTestCasesFileDrop = async (files: FileWithPath[]) => {
        const testCaseFiles = await parseTestCasesZipFile(files);
        const testCases: ProblemTestCase[] = [];
        const singlePoints = Number(
            100 / (testCaseFiles.sortedFileNames.length / 2),
        );

        for (let i = 0; i < testCaseFiles.sortedFileNames.length; i += 2) {
            const caseName = testCaseFiles.sortedFileNames[i]
                .split('.')
                .slice(0, 2)
                .join('.');

            testCases.push({
                input: testCaseFiles.results[caseName].in ?? '',
                output: testCaseFiles.results[caseName].out ?? '',
                points: singlePoints,
                isPretest: false,
            });
        }

        setProblemTestCases(testCases);
    };

    useEffect(() => {
        getLanguages();
    }, []);

    return (
        <Flex direction='column' gap='md'>
            <form>
                <Title>General info</Title>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                    <TextInput
                        label='Title'
                        placeholder='Title'
                        key={problemInfoForm.key('title')}
                        {...problemInfoForm.getInputProps('title')}
                    />

                    <NumberInput
                        label='Points'
                        placeholder='100'
                        key={problemInfoForm.key('points')}
                        {...problemInfoForm.getInputProps('points')}
                    />

                    <NumberInput
                        label='Version number'
                        placeholder='1'
                        key={problemInfoForm.key('versionNumber')}
                        {...problemInfoForm.getInputProps('versionNumber')}
                    />

                    <Flex justify='center' align='center'>
                        <Checkbox
                            label='Public?'
                            key={problemInfoForm.key('isPublic')}
                            {...problemInfoForm.getInputProps('isPublic', {
                                type: 'checkbox',
                            })}
                        />
                    </Flex>
                </SimpleGrid>
            </form>

            <Box>
                <Text>Problem text:</Text>
                <RichTextEditor editor={problemTextEditor} mih='30em'>
                    <RichTextEditor.Toolbar sticky stickyOffset={60}>
                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Bold />
                            <RichTextEditor.Italic />
                            <RichTextEditor.Underline />
                            <RichTextEditor.Strikethrough />
                            <RichTextEditor.ClearFormatting />
                            <RichTextEditor.Highlight />
                            <RichTextEditor.Code />
                        </RichTextEditor.ControlsGroup>
                    </RichTextEditor.Toolbar>

                    <RichTextEditor.Content />
                </RichTextEditor>
            </Box>

            <form>
                <Title>Problem limits</Title>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                    <NumberInput
                        label='Time limit (ms)'
                        placeholder='1000'
                        key={problemInfoForm.key('timeLimit')}
                        {...problemInfoForm.getInputProps('timeLimit')}
                    />

                    <NumberInput
                        label='Memory limit (MB)'
                        placeholder='256'
                        key={problemInfoForm.key('memoryLimit')}
                        {...problemInfoForm.getInputProps('memoryLimit')}
                    />
                </SimpleGrid>
            </form>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th></Table.Th>
                        <Table.Th>Language</Table.Th>
                        <Table.Th>Time limit (ms)</Table.Th>
                        <Table.Th>Memory limit (MB)</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {specificLimits.map((constraint, index) => (
                        <Table.Tr key={index}>
                            <Table.Td>
                                <Button
                                    size='xs'
                                    color='red'
                                    variant='subtle'
                                    onClick={() => removeSpecificLimit(index)}
                                >
                                    <FaX />
                                </Button>
                            </Table.Td>
                            <Table.Td>
                                <Select
                                    data={languages.map((language) => {
                                        return {
                                            value: language.id.toString(),
                                            label: language.name,
                                        };
                                    })}
                                    value={
                                        constraint.languageId !== -1
                                            ? constraint.languageId.toString()
                                            : null
                                    }
                                    onChange={(value) =>
                                        updateSpecificLimit(
                                            index,
                                            'languageId',
                                            value,
                                        )
                                    }
                                    allowDeselect
                                />
                            </Table.Td>
                            <Table.Td>
                                <NumberInput
                                    value={constraint.timeLimit}
                                    onChange={(value) =>
                                        updateSpecificLimit(
                                            index,
                                            'timeLimit',
                                            value,
                                        )
                                    }
                                />
                            </Table.Td>
                            <Table.Td>
                                <NumberInput
                                    value={constraint.memoryLimit}
                                    onChange={(value) =>
                                        updateSpecificLimit(
                                            index,
                                            'memoryLimit',
                                            value,
                                        )
                                    }
                                />
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
                <Table.Caption>
                    <Button
                        leftSection={<FaPlus />}
                        variant='transparent'
                        color='gray'
                        onClick={addSpecificLimit}
                    >
                        Add constraints
                    </Button>
                </Table.Caption>
            </Table>

            <Divider my='xs' />

            <Title>Test cases</Title>

            <Dropzone
                onDrop={onTestCasesFileDrop}
                onReject={(files) => console.log('rejected files', files)}
                maxSize={5 * 1024 ** 2}
                accept={[MIME_TYPES.zip]}
            >
                <Group
                    justify='center'
                    gap='xl'
                    mih='220'
                    style={{ pointerEvents: 'none' }}
                >
                    <Dropzone.Idle>
                        <Title c='dimmed'>
                            <FaRegFileZipper />
                        </Title>
                    </Dropzone.Idle>

                    <Flex direction='column'>
                        <Text size='xl'>
                            Upload the zip with the test cases
                        </Text>
                        <Text c='dimmed' size='sm'>
                            Make sure the file inside are in the right format
                        </Text>
                    </Flex>
                </Group>
            </Dropzone>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th></Table.Th>
                        <Table.Th>Input</Table.Th>
                        <Table.Th>Output</Table.Th>
                        <Table.Th>Points</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {problemTestCases.map((testCase, index) => (
                        <Table.Tr key={index}>
                            <Table.Td>
                                <Button
                                    size='xs'
                                    color='red'
                                    variant='subtle'
                                    onClick={() => removeTestCase(index)}
                                >
                                    <FaX />
                                </Button>
                            </Table.Td>
                            <Table.Td>
                                <Textarea
                                    placeholder='Input'
                                    value={testCase.input}
                                    minRows={3}
                                    maxRows={3}
                                    onChange={(event) =>
                                        updateTestCase(
                                            index,
                                            'input',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                            </Table.Td>
                            <Table.Td>
                                <Textarea
                                    placeholder='Output'
                                    value={testCase.output}
                                    minRows={3}
                                    maxRows={3}
                                    onChange={(event) =>
                                        updateTestCase(
                                            index,
                                            'output',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                            </Table.Td>
                            <Table.Td>
                                <NumberInput
                                    placeholder='Points'
                                    value={testCase.points}
                                    onChange={(value) =>
                                        updateTestCase(index, 'points', value)
                                    }
                                />
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
                <Table.Caption>
                    <Button
                        leftSection={<FaPlus />}
                        variant='transparent'
                        color='gray'
                        onClick={addTestCase}
                    >
                        Add test case
                    </Button>
                </Table.Caption>
            </Table>

            <Flex justify='end'>
                <form onSubmit={problemInfoForm.onSubmit(saveProblem)}>
                    <Button type='submit' loading={isProblemSaving}>
                        Save
                    </Button>
                </form>
            </Flex>
        </Flex>
    );
}

import {
    Box,
    Button,
    Center,
    Container,
    Divider,
    Flex,
    Tabs,
    Title,
    Text,
    Stack,
} from '@mantine/core';
import { MosaicBranch, MosaicWindow } from 'react-mosaic-component';
import SubmissionTable from './SubmissionTable';
import { Dispatch, SetStateAction, useState } from 'react';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { FaArrowLeft, FaStopwatch } from 'react-icons/fa6';
import Difficulty from '../problems/Difficulty';

export default function ProblemWindow({
    path,
    problemInfo,
    setCode,
    goBackUrl,
}: {
    path: MosaicBranch[];
    problemInfo: any;
    setCode: Dispatch<SetStateAction<string>>;
    goBackUrl?: string;
}) {
    const [activeTab, setActiveTab] = useState<string | null>('first');

    const problemTextEditor = useEditor({
        extensions: [
            StarterKit,
            Markdown,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: problemInfo?.description,
        immediatelyRender: false,
        editable: false,
    });

    const handleTabChange = (value: string | null) => {
        if (value) setActiveTab(value);
    };

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
            <Container fluid bg='white' py='xs' h='100%'>
                <Tabs value={activeTab} onChange={handleTabChange} h='100%'>
                    <Tabs.Panel value='first' h='100%'>
                        <Flex
                            direction='column'
                            h='100%'
                            style={{ overflowY: 'auto' }}
                        >
                            <Flex
                                justify='space-between'
                                align='center'
                                pos='relative'
                            >
                                {goBackUrl == null ? (
                                    <Box />
                                ) : (
                                    <Button
                                        variant='subtle'
                                        leftSection={<FaArrowLeft />}
                                        component='a'
                                        href={goBackUrl}
                                    >
                                        Go back
                                    </Button>
                                )}

                                <Center
                                    pos='absolute'
                                    left='50%'
                                    style={{
                                        transform: 'translateX(-50%)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Title fs='italic'>
                                        {problemInfo?.title ?? ''}
                                    </Title>
                                </Center>
                                <Difficulty
                                    difficulty={problemInfo?.difficulty}
                                    size='xl'
                                />
                            </Flex>

                            <Stack mt='sm' gap={0}>
                                <Flex
                                    fz='xs'
                                    fs='italic'
                                    justify='center'
                                    align='center'
                                    gap='xs'
                                    c='dimmed'
                                >
                                    <FaStopwatch />
                                    <Text>Time limit: </Text>
                                    <Text fw='bolder'>100 ms</Text>
                                </Flex>
                                <Flex
                                    fz='xs'
                                    fs='italic'
                                    justify='center'
                                    align='center'
                                    gap='xs'
                                    c='dimmed'
                                >
                                    <FaStopwatch />
                                    <Text>Memory limit: </Text>
                                    <Text fw='bolder'>100 MB</Text>
                                </Flex>
                            </Stack>

                            <Divider my='xs' />
                            <Box>
                                <RichTextEditor
                                    mt='md'
                                    style={{ border: 0 }}
                                    editor={problemTextEditor}
                                    mih='30em'
                                >
                                    <RichTextEditor.Content />
                                </RichTextEditor>
                            </Box>
                        </Flex>
                    </Tabs.Panel>

                    {activeTab === 'second' && (
                        <Tabs.Panel value='second'>
                            <Center>
                                <Title fs='italic'>Submissions</Title>
                            </Center>
                            <SubmissionTable
                                setCode={setCode}
                                problemId={problemInfo?.id ?? 0}
                            />
                        </Tabs.Panel>
                    )}
                </Tabs>
            </Container>
        </MosaicWindow>
    );
}

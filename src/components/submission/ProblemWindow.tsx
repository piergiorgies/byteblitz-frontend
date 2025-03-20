import {
    Box,
    Center,
    Container,
    Divider,
    Flex,
    Tabs,
    Title,
} from '@mantine/core';
import { MosaicBranch, MosaicWindow } from 'react-mosaic-component';
import SubmissionTable from './SubmissionTable';
import { Dispatch, SetStateAction, useState } from 'react';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';

export default function ProblemWindow({
    path,
    problemInfo,
    setCode,
}: {
    path: MosaicBranch[];
    problemInfo: any;
    setCode: Dispatch<SetStateAction<string>>;
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
                            <Center>
                                <Title fs='italic'>
                                    {problemInfo?.title ?? ''}
                                </Title>
                            </Center>
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
                        {/* <Markdown>{problemInfo?.description ?? ''}</Markdown> */}
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

import { Box, Button, Center, Container, Text, Flex, Stack, Title } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { FaArrowLeft, FaStopwatch } from 'react-icons/fa6';
import Difficulty from '../problems/Difficulty';

export default function ProblemWindow({
    problemInfo,
    goBackUrl
}: {
    problemInfo: any,
    goBackUrl?: string;
}) {
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

    return (
        <Container>
            <Container fluid bg='white' py='xs' h='100%'>
                <Flex direction='column' h='100%' style={{ overflowY: 'auto' }}>
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
                            size='lg'
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
            </Container>
        </Container>
    );
}

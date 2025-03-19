import { Center, Container, Flex, Tabs, Title } from "@mantine/core";
import Markdown from "react-markdown";
import { MosaicBranch, MosaicWindow } from "react-mosaic-component";
import SubmissionTable from "./SubmissionTable";
import { Dispatch, SetStateAction, useState } from "react";

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

    const handleTabChange = (value: string | null) => {
        if (value)
            setActiveTab(value);
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
            <Container fluid bg='white' h='100%'>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tabs.Panel value="first">
                        <Center>
                            <Title fs="italic">{problemInfo?.title ?? ''}</Title>
                        </Center>
                        <Markdown>{problemInfo?.description ?? ''}</Markdown>
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
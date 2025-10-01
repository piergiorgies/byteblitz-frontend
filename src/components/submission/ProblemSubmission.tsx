'use client';

import { Problem } from '@/models/Problem';
import api from '@/utils/ky';
import { Layout, Model, TabNode } from 'flexlayout-react';
import { useEffect, useState } from 'react';
import { objectToCamel } from 'ts-case-convert';
import ProblemWindow from './ProblemWindow';
import MonacoWindow from './MonacoWindow';
import ResultsWindow from './ResultWindow';
import SubmissionWindow from './SubmissionWindow';
import PretestWindow from './PretestWindow';
import { ActionIcon, Flex, Tooltip } from '@mantine/core';
import { FaRotateLeft } from 'react-icons/fa6';
import 'flexlayout-react/style/underline.css';

const masterLayout = {
    global: {},
    borders: [],
    layout: {
        type: 'column',
        weight: 100,
        children: [
            {
                type: 'tabset',
                weight: 50,
                children: [
                    {
                        type: 'tab',
                        name: 'Problem',
                        component: 'ProblemWindow',
                        enableClose: false,
                        enablePopoutOverlay: true,
                    },
                    {
                        type: 'tab',
                        name: 'Submissions',
                        component: 'SubmissionWindow',
                        enableClose: false,
                    },
                ],
            },
            {
                type: 'row',
                weight: 50,
                children: [
                    {
                        type: 'tabset',
                        weight: 50,
                        children: [
                            {
                                type: 'tab',
                                name: 'Code',
                                component: 'MonacoWindow',
                                enableClose: false,
                            },
                        ],
                    },
                    {
                        type: 'tabset',
                        weight: 50,
                        children: [
                            {
                                type: 'tab',
                                name: 'Test Case',
                                component: 'PretestWindow',
                                enableClose: false,
                            },
                            {
                                type: 'tab',
                                name: 'Results',
                                component: 'ResultsWindow',
                                enableClose: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
};

export default function ProblemSubmission({
    problemId,
}: {
    problemId: number;
}) {
    const [problemInfo, setProblemInfo] = useState<Problem | null>(null);

    const [model, setModel] = useState<Model | null>(null);

    useEffect(() => {
        const fetchProblemInfo = async () => {
            try {
                const response = await api.get(`problems/${problemId}`);
                const problem = objectToCamel(await response.json<Problem>());
                setProblemInfo(problem);

                const savedLayout = localStorage.getItem('layout');
                const newModel = savedLayout
                    ? Model.fromJson(JSON.parse(savedLayout))
                    : Model.fromJson(masterLayout);
                setModel(newModel);
            } catch (error) {
                console.error('Failed to fetch problem info:', error);
            }
        };

        fetchProblemInfo();
    }, [problemId]);
    const resetDefaultWindowLayout = () => {
        if (model) {
            const newModel = Model.fromJson(masterLayout);
            setModel(newModel);
        }
    };

    const factory = (node: TabNode) => {
        const component = node.getComponent();
        if (component === 'ProblemWindow') {
            return <ProblemWindow problemInfo={problemInfo} />;
        }
        if (component === 'MonacoWindow') {
            return <MonacoWindow problemInfo={problemInfo} />;
        }
        if (component === 'ResultsWindow') {
            return <ResultsWindow layoutModel={model} />;
        }

        if (component === 'SubmissionWindow') {
            return <SubmissionWindow problemId={problemInfo?.id ?? 0} />;
        }

        if (component === 'PretestWindow') {
            return <PretestWindow testCases={problemInfo?.testCases ?? []} />;
        }
    };

    useEffect(() => {
        if (model) {
            model.addChangeListener(() => {
                localStorage.setItem('layout', JSON.stringify(model.toJson()));
            });
        }
    }, [model]);

    return (
        <Flex
            className='w-100 relative'
            style={{ height: 'calc(100vh - 60px)' }}
        >
            <Flex className='absolute bottom-4 right-4 z-10'>
                <Tooltip label='Reset default layout' position='left' withArrow>
                    <ActionIcon
                        variant='light'
                        radius='xl'
                        size='xl'
                        onClick={resetDefaultWindowLayout}
                    >
                        <FaRotateLeft />
                    </ActionIcon>
                </Tooltip>
            </Flex>

            {model && <Layout model={model} factory={factory} />}
        </Flex>
    );
}

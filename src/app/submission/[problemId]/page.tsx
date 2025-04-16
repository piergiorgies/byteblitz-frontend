'use client';
import { use, useEffect, useState } from 'react';
import api from '@/utils/ky';
import { useParams } from 'next/navigation';
import { Problem } from '@/models/Problem';
import { objectToCamel } from 'ts-case-convert';
import { Language } from '@/models/Language';

import { Layout, Model, TabNode } from 'flexlayout-react';
import 'flexlayout-react/style/underline.css';

import ProblemWindow from '@/components/submission/ProblemWindow';
import MonacoWindow from '@/components/submission/MonacoWindow';
import ResultsWindow from '@/components/submission/ResultWindow';
import { ActionIcon, Flex, Tooltip } from '@mantine/core';
import { FaRotateLeft } from 'react-icons/fa6';
import SubmissionWindow from '@/components/submission/SubmissionWindow';
import PretestWindow from '@/components/submission/PretestWindow';

const master_layout = {
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

export default function Submission() {
    const params = useParams();
    const [problemInfo, setProblemInfo] = useState<Problem | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
        null,
    );
    const [code, setCode] = useState<string>('');
    const [model, setModel] = useState<Model | null>(null);

    // Fetch problem info and initialize layout model after data is retrieved
    useEffect(() => {
        const fetchProblemInfo = async () => {
            const { problemId } = params;
            try {
                const response = await api.get(`problems/${problemId}`);
                const problem = objectToCamel(await response.json<Problem>());
                setProblemInfo(problem);

                // Attempt to load the model from localStorage
                const savedLayout = localStorage.getItem('layout');
                const newModel = savedLayout
                    ? Model.fromJson(JSON.parse(savedLayout))
                    : Model.fromJson(master_layout);
                setModel(newModel);
            } catch (error) {
                console.error('Failed to fetch problem info:', error);
            }
        };

        fetchProblemInfo();
    }, [params.problemId]);

    const resetDefaultWindowLayout = () => {
        if (model) {
            const newModel = Model.fromJson(master_layout); // Reset to default layout
            setModel(newModel); // Update the state with the new model
        }
    };

    const handleSubmit = async (code: string, pretest: boolean) => {
        try {
            await api.post('submissions', {
                json: {
                    problem_id: params.problemId,
                    language_id: (selectedLanguage?.id ?? 1).toString(),
                    submitted_code: code,
                    notes: '',
                    is_pretest_run: pretest,
                },
            });
        } catch (error) {
            console.error('Submission error:', error);
        }
    };

    const factory = (node: TabNode) => {
        const component = node.getComponent();
        if (component === 'ProblemWindow') {
            return <ProblemWindow problemInfo={problemInfo} />;
        }
        if (component === 'MonacoWindow') {
            return <MonacoWindow />;
        }
        if (component === 'ResultsWindow') {
            return <ResultsWindow />;
        }

        if (component === 'SubmissionWindow') {
            console.log('SubmissionWindow');
            return (
                <SubmissionWindow
                    setCode={setCode}
                    problemId={problemInfo?.id ?? 0}
                />
            );
        }

        if (component === 'PretestWindow') {
            return <PretestWindow testCases={problemInfo?.testCases ?? []} />;
        }
    };

    // Save layout to localStorage whenever the layout changes
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

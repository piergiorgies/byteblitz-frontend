'use client';
import {
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
import api from '@/utils/ky';
import { MosaicBranch } from 'react-mosaic-component';
import { useParams } from 'next/navigation';
import { Problem, ProblemTestCase } from '@/models/Problem';
import { objectToCamel } from 'ts-case-convert';
import { Language } from '@/models/Language';

import ProblemWindow from '@/components/submission/ProblemWindow';
import MonacoWindow from '@/components/submission/MonacoWindow';
import ResultsWindow from '@/components/submission/ResultWindow';

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
                testCases={problemInfo?.testCases ?? null}
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

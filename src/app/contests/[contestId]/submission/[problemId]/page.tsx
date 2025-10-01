'use client';
import ProblemSubmission from '@/components/submission/ProblemSubmission';
import api from '@/utils/ky';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
export default function SubmissionPage() {
    const params = useParams();
    const { problemId, contestId } = params;
    // const submitSolution = async (
    //     code: string,
    //     pretest: boolean,
    //     selectedLanguageId: number,
    // ) => {
    //     try {
    //         await api.post('submissions', {
    //             json: {
    //                 problem_id: problemId,
    //                 language_id: selectedLanguageId,
    //                 submitted_code: code,
    //                 notes: '',
    //                 is_pretest_run: pretest,
    //                 contest_id: contestId,
    //             },
    //         });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    useEffect(() => {
        const handleSaveShortcut = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault(); // stop browser save
                console.log('Intercepted Ctrl+S! Triggering save...');
            }
        };

        window.addEventListener('keydown', handleSaveShortcut);
        return () => {
            window.removeEventListener('keydown', handleSaveShortcut);
        };
    }, []);
    return <ProblemSubmission problemId={Number(problemId)} />;
}

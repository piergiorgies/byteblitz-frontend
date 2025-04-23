'use client';
import ProblemSubmission from '@/components/submission/ProblemSubmission';
import api from '@/utils/ky';
import { useParams } from 'next/navigation';
export default function SubmissionPage() {
    const params = useParams();
    const { problemId, contestId } = params;
    const submitSolution = async (
        code: string,
        pretest: boolean,
        selectedLanguageId: number,
    ) => {
        try {
            await api.post('submissions', {
                json: {
                    problem_id: problemId,
                    language_id: selectedLanguageId,
                    submitted_code: code,
                    notes: '',
                    is_pretest_run: pretest,
                    contest_id: contestId,
                },
            });
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <ProblemSubmission
            problemId={Number(problemId)}
            goBackUrl='/contests'
        />
    );
}
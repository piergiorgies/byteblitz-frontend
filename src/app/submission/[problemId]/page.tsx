'use client';
import { useParams } from 'next/navigation';
import ProblemSubmission from '@/components/submission/ProblemSubmission';



export default function Submission() {
    const params = useParams();

    const { problemId } = params;

    return (
        <ProblemSubmission
            problemId={Number(problemId)}
            goBackUrl='/contests' />
    )
}

'use client';
import ProblemSubmission from '@/components/submission/ProblemSubmission';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
export default function SubmissionPage() {
    const params = useParams();
    const { problemId } = params;

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

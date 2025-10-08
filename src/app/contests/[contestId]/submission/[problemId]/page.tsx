'use client';
import ProblemSubmission from '@/components/submission/ProblemSubmission';
import { showNotification } from '@mantine/notifications';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
export default function SubmissionPage() {
    const params = useParams();
    const { problemId } = params;

    useEffect(() => {
        const handleSaveShortcut = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                showNotification({
                    title: 'Save',
                    message: 'Code saved successfully!',
                    color: 'green'
                });
            }
        };

        window.addEventListener('keydown', handleSaveShortcut);
        return () => {
            window.removeEventListener('keydown', handleSaveShortcut);
        };
    }, []);
    return <ProblemSubmission problemId={Number(problemId)} />;
}

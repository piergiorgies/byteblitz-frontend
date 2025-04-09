import { Language } from '@/models/Language';
import { TestCaseSubmission, TotalResult } from '@/models/Submission';
import { createContext, Dispatch, SetStateAction } from 'react';

export interface SubmissionContextType {
    code: string;
    setCode:  Dispatch<SetStateAction<string>>;
    selectedLanguage: Language | null;
    setSelectedLanguage: Dispatch<SetStateAction<Language | null>>;
    submissions: TestCaseSubmission[];
    setSubmissions: Dispatch<SetStateAction<TestCaseSubmission[]>>;
    result: TotalResult | null;
    setResult: Dispatch<SetStateAction<TotalResult | null>>;
    pretestResults: TestCaseSubmission[];
    setPretestResults: Dispatch<SetStateAction<TestCaseSubmission[]>>;
}

export const SubmissionContext = createContext<SubmissionContextType>({
    code: '',
    setCode: () => {},
    selectedLanguage: null,
    setSelectedLanguage: () => {},
    submissions: [],
    setSubmissions: () => {},
    result: null,
    setResult: () => {},
    pretestResults: [],
    setPretestResults: () => {},
});

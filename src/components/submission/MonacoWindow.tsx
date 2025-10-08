import { Language } from '@/models/Language';
import api from '@/utils/ky';
import {
    Button,
    Combobox,
    Flex,
    useCombobox,
    Text,
    Tooltip,
} from '@mantine/core';
import { useDebouncedCallback, useFileDialog } from '@mantine/hooks';
import { Editor } from '@monaco-editor/react';
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { FaChevronDown, FaUpload } from 'react-icons/fa6';
import { IoCloudDoneOutline } from 'react-icons/io5';
import { objectToCamel } from 'ts-case-convert';
import { SubmissionContext } from '../contexts/SubmissionContext';
import { Problem } from '@/models/Problem';


type MonacoWindowProps = {
    problemInfo: Problem | null;
}

type SavedCodeEntry = {
    problemId: number;
    languageId: number;
    code: string;
    date: string;
}

export default function MonacoWindow({ problemInfo }: MonacoWindowProps) {
    const [languages, setLanguages] = useState<Language[]>([]);
    const { code, setCode, selectedLanguage, setSelectedLanguage } =
        useContext(SubmissionContext);

    const saveCode = useDebouncedCallback((code: string) => {
        if (!problemInfo) return;

        const existingValue = localStorage.getItem('savedCode');
        const parsed: SavedCodeEntry[] = existingValue ? JSON.parse(existingValue) : [];

        const existingIndex = parsed.findIndex(
            (entry) => entry.problemId === problemInfo.id && entry.languageId === selectedLanguage?.id
        );

        if (existingIndex !== -1) {
            parsed[existingIndex] = {
                problemId: problemInfo.id || 0,
                languageId: selectedLanguage?.id || 0,
                code,
                date: new Date().toISOString(),
            };
        } else {
            if (parsed.length >= 10) {
                parsed.shift();
            }

            parsed.push({
                problemId: problemInfo.id || 0,
                languageId: selectedLanguage?.id || 0,
                code,
                date: new Date().toISOString(),
            });
        }

        localStorage.setItem('savedCode', JSON.stringify(parsed));
        setSaved(true);
    }, 1000);

    const [saved, setSaved] = useState(false);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    useEffect(() => {
        const savedValue = localStorage.getItem('savedCode');
        if (savedValue && problemInfo) {
            const parsed: SavedCodeEntry[] = JSON.parse(savedValue);
            const entry = parsed.find((e) => e.problemId === problemInfo.id && e.languageId === selectedLanguage?.id);
            if (entry) {
                setCode(entry.code);
            }
        }
    }, [problemInfo, setCode, selectedLanguage]);

    const getLanguages = useCallback(async () => {
        try {
            const response = await api.get('problems/languages/available');
            const returnedLanguages = objectToCamel(
                await response.json<Language[]>(),
            );
            setLanguages(returnedLanguages);
            if (returnedLanguages.length > 0) {
                const selectedLanguageId =
                    localStorage.getItem('selectedLanguage') ?? '1';
                setSelectedLanguage(
                    returnedLanguages.find(
                        (lang) => lang.id.toString() === selectedLanguageId,
                    ) ?? returnedLanguages[0],
                );
            }
        } catch (error) {
            console.log(error);
        }
    }, [setSelectedLanguage]);


    const options = useMemo(() => {
        const accept = languages.map((lang) => '.' + lang.fileExtension.toString()).join(', ');
        console.log('File dialog accept:', accept);
        return {
            multiple: false,
            accept,
            resetOnOpen: true,
        };
    }, [languages]);

    const fileDialog = useFileDialog(options);

    useEffect(() => {
        getLanguages().then(() => combobox.closeDropdown());
    }, [getLanguages]);

    const pickedFiles = Array.from(fileDialog.files ?? []);

    useEffect(() => {
        if (pickedFiles.length > 0) {
            const file = pickedFiles[0];
            const extension = file.name.split('.').pop()?.toLowerCase();
            const language = languages.find(
                (lang) => lang.fileExtension.toLowerCase() === extension,
            );
            if (language) {
                setSelectedLanguage(language);
                localStorage.setItem('selectedLanguage', language.id.toString());
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    setCode(text);
                    saveCode(text);
                }
            };
            reader.readAsText(file);
        }
        fileDialog.reset();
    }, [pickedFiles, setCode, saveCode, languages, setSelectedLanguage, fileDialog]);

    return (
        <>
            <Flex justify='space-between' px='xs'>
                <Combobox
                    store={combobox}
                    width={250}
                    position='bottom-start'
                    onOptionSubmit={(value) => {
                        setSelectedLanguage(
                            languages.find(
                                (lang) => lang.id.toString() === value,
                            ) || null,
                        );
                        combobox.closeDropdown();
                        localStorage.setItem('selectedLanguage', value);
                    }}
                >
                    <Combobox.Target>
                        <Button
                            size='xs'
                            color='gray'
                            variant='subtle'
                            onClick={() => combobox.toggleDropdown()}
                        >
                            <Flex align='center'>
                                <Text me='xs'>
                                    {selectedLanguage?.name ?? ''}
                                </Text>
                                <FaChevronDown />
                            </Flex>
                        </Button>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                        <Combobox.Options>
                            {languages.map((language) => (
                                <Combobox.Option
                                    value={language.id.toString()}
                                    key={language.id}
                                >
                                    {language.name}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>

                <Flex>
                    {saved && (
                        <Tooltip label='Code saved locally'>
                            <Button color='green' variant='subtle'>
                                <IoCloudDoneOutline />
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip label='Load code'>
                        <Button color='gray' variant='subtle' onClick={() => fileDialog.open()}>
                            <FaUpload />
                        </Button>
                    </Tooltip>
                </Flex>
            </Flex>

            <Editor
                height='100%'
                width='100%'
                theme='vs-dark'
                language={selectedLanguage?.code ?? 'cpp'}
                value={code}
                onChange={(value) => {
                    setSaved(false);
                    setCode(value || '');
                    saveCode(value || '');
                }}
                options={{
                    fontSize: 16,
                    minimap: { enabled: false },
                    scrollbar: { alwaysConsumeMouseWheel: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                }}
            />
        </>
    );
}

import { Language } from '@/models/Language';
import api from '@/utils/ky';
import {
    Button,
    Combobox,
    Flex,
    useCombobox,
    Text,
    Tooltip,
    Container,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { Editor } from '@monaco-editor/react';
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { FaChevronDown, FaUpload } from 'react-icons/fa6';
import { IoCloudDoneOutline } from 'react-icons/io5';
import { objectToCamel } from 'ts-case-convert';
import { SubmissionContext } from '../contexts/SubmissionContext';

export default function MonacoWindow() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const { code, setCode, selectedLanguage, setSelectedLanguage } =
        useContext(SubmissionContext);

    const saveCode = useDebouncedCallback((code: string) => {
        localStorage.setItem('savedCode', code);
        setSaved(true);
    }, 1000);

    const [saved, setSaved] = useState(false);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    useEffect(() => {
        const savedCode = localStorage.getItem('savedCode');
        if (savedCode) {
            setCode(savedCode);
        }
    }, []);

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
    }, []);

    useEffect(() => {
        getLanguages().then(() => combobox.closeDropdown());
    }, [getLanguages]);

    return (
        <Flex mx='md' mb='lg' direction='column' gap='xs'>
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
                        <Button color='gray' variant='subtle'>
                            <FaUpload />
                        </Button>
                    </Tooltip>
                </Flex>
            </Flex>

            <div
                style={{
                    height: 'calc(100vh - 200px)',
                    marginTop: 10,
                    width: '100%',
                }}
            >
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
                    }}
                />
            </div>
        </Flex>
    );
}

import { Tooltip, Flex, Text } from '@mantine/core';
import {
    FaRegCircleCheck,
    FaRegCircleXmark,
    FaRegClock,
    FaMemory,
    FaRegFileExcel,
} from 'react-icons/fa6';

interface SubmissionResultIconProps {
    resultId?: number;
    submissionResults?: { [key: number]: { code: string } } | null;
    label?: string;
}

export default function SubmissionResultIcon({
    resultId,
    submissionResults,
    label,
}: SubmissionResultIconProps) {
    const resultCode =
        label ??
        (resultId !== undefined && submissionResults
            ? submissionResults[resultId]?.code
            : null);

    const resultIcons: Record<string, JSX.Element> = {
        AC: (
            <Tooltip position='top-start' label='Accepted Answer'>
                <Flex direction='row' align='center' gap='xs' c='green'>
                    <Text>AC</Text> <FaRegCircleCheck />
                </Flex>
            </Tooltip>
        ),
        WA: (
            <Tooltip position='top-start' label='Wrong Answer'>
                <Flex direction='row' align='center' gap='xs' c='red'>
                    <Text>WA</Text> <FaRegCircleXmark />
                </Flex>
            </Tooltip>
        ),
        TLE: (
            <Tooltip position='top-start' label='Time Limit'>
                <Flex direction='row' align='center' gap='xs' c='orange'>
                    <Text>TLE</Text> <FaRegClock />
                </Flex>
            </Tooltip>
        ),
        MLE: (
            <Tooltip position='top-start' label='Memory Limit'>
                <Flex direction='row' align='center' gap='xs' c='orange'>
                    <Text>MLE</Text> <FaMemory />
                </Flex>
            </Tooltip>
        ),
        CE: (
            <Tooltip position='top-start' label='Compilation Error'>
                <Flex direction='row' align='center' gap='xs' c='red'>
                    <Text>CE</Text> <FaRegFileExcel />
                </Flex>
            </Tooltip>
        ),
    };

    return resultCode ? resultIcons[resultCode] || null : null;
}

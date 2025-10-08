import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

const COLOR_SCHEMES = ['light', 'dark'] as const;
type ColorSchemeType = (typeof COLOR_SCHEMES)[number];

export default function ColorSchemeChanger() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [localScheme, setLocalScheme] = useState<ColorSchemeType>('light');

    useEffect(() => {
        const storedScheme = localStorage.getItem(
            'mantine-color-scheme',
        ) as ColorSchemeType | null;
        if (storedScheme && COLOR_SCHEMES.includes(storedScheme)) {
            setLocalScheme(storedScheme);
            setColorScheme(storedScheme);
        }
    }, [setColorScheme]);

    const cycleColorScheme = () => {
        const currentIndex = COLOR_SCHEMES.indexOf(localScheme);
        const nextIndex = (currentIndex + 1) % COLOR_SCHEMES.length;
        const nextScheme = COLOR_SCHEMES[nextIndex];
        setLocalScheme(nextScheme);
        setColorScheme(nextScheme);
        localStorage.setItem('mantine-color-scheme', nextScheme);
    };

    const getIcon = () => {
        switch (localScheme) {
            case 'light':
                return <FaSun size={20} />;
            case 'dark':
                return <FaMoon size={20} />;
        }
    };

    const getTooltip = () => {
        switch (localScheme) {
            case 'light':
                return 'Light mode';
            case 'dark':
                return 'Dark mode';
        }
    };

    useEffect(() => {
        const html = document.documentElement;
        if (colorScheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }, [colorScheme]);

    return (
        <Tooltip label={getTooltip()} position='bottom' withArrow>
            <ActionIcon
                variant='subtle'
                onClick={cycleColorScheme}
                size='lg'
                radius='xl'
            >
                {getIcon()}
            </ActionIcon>
        </Tooltip>
    );
};

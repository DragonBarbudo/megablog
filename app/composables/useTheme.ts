
export const useTheme = () => {
    const isDark = useState<boolean>('theme-dark', () => false);

    const toggleTheme = () => {
        isDark.value = !isDark.value;
        updateDOM();
    };

    const updateDOM = () => {
        if (import.meta.client) {
            const html = document.documentElement;
            if (isDark.value) {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    };

    const initTheme = () => {
        if (import.meta.client) {
            const stored = localStorage.getItem('theme');
            if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                isDark.value = true;
            } else {
                isDark.value = false;
            }
            updateDOM();
        }
    };

    return {
        isDark,
        toggleTheme,
        initTheme
    };
};

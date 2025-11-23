export const useFormatDate = () => {
    const { locale } = useI18n();
    function formatDate(value: string) {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        
        const formattedDate = date.toLocaleDateString(locale.value, options);
        return formattedDate;
        }

        function formatDateTime(value: string) {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        const formatted = date.toLocaleString(locale.value, options);
        // Remplacer le point après l'abréviation du mois par un point avec espace
        // et ajouter "à" avant l'heure
        return formatted.replace('.', '. ').replace(' à ', ' à ');
    }

    return {
        formatDate,
        formatDateTime
    }
}
// UI utility functions

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
}

function getInitials(name) {
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('');
}

function getMonthName(monthNumber) {
    const months = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[monthNumber - 1] || '';
}

function getPriorityText(priority) {
    switch (priority) {
        case 'low':
            return 'Bassa';
        case 'medium':
            return 'Media';
        case 'high':
            return 'Alta';
        default:
            return priority;
    }
}

function initYearSelect() {
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= currentYear - 5; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }
}

export {
    formatDate,
    getInitials,
    getMonthName,
    getPriorityText,
    initYearSelect
};
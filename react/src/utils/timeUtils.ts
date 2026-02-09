export function generateTimeOptions(): string[] {
    const times: string[] = [];

    // AM hours: 1am-11am
    for (let i = 1; i <= 11; i++) {
        times.push(`${i} am`);
    }

    // 12pm (noon)
    times.push('12 pm');

    // PM hours: 1pm-11pm
    for (let i = 1; i <= 11; i++) {
        times.push(`${i} pm`);
    }

    // 12am (midnight)
    times.push('12 am');

    return times;
}

export function getHourIndex(timeString: string): number {
    const [hour, period] = timeString.split(' ');
    const hourNum = parseInt(hour);

    // Timeline order: 1am-11am (indices 0-10), 12pm (index 11), 1pm-11pm (indices 12-22), 12am (index 23)
    if (period === 'am') {
        if (hourNum === 12) {
            return 23; // 12am is at the end
        }
        return hourNum - 1; // 1am=0, 2am=1, etc.
    } else {
        if (hourNum === 12) {
            return 11; // 12pm comes after 11am
        }
        return 11 + hourNum; // 1pm=12, 2pm=13, etc.
    }
}

export function validateTimeRange(start: string, end: string): boolean {
    const startIndex = getHourIndex(start);
    const endIndex = getHourIndex(end);
    return startIndex < endIndex;
}

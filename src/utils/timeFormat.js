export const formatTime = (time) => {
    const seconds = String(Math.round(time)).padStart(2, '0');
    const miliseconds = String(Math.round(time * 100) % 100).padStart(2, '0');
    return `${seconds}:${miliseconds}`
}
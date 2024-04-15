export function getShortContent(content: string): string {
    return content.substring(0, 100) + '...';
}
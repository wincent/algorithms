export default function pluralize(word: string, count: number): string {
	return count === 1 ? word : `${word}s`;
}

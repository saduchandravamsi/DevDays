import type { Game } from '../types/game';

/**
 * Filters games by title using a case-insensitive partial match.
 */
export function filterGamesByTitle(
    games: Game[],
    searchTerm: string,
): Game[] {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (normalizedSearchTerm === '') {
        return games;
    }

    return games.filter((game) =>
        game.title.toLowerCase().includes(normalizedSearchTerm),
    );
}
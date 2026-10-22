import { describe, expect, it } from 'vitest';
import { filterGamesByTitle } from './gameSearch';
import type { Game } from '../types/game';

const games: Game[] = [
    {
        id: 1,
        title: 'DevOps Dominion',
        description: 'A DevOps game',
        starRating: 4,
        category: null,
        publisher: null,
    },
    {
        id: 2,
        title: 'Pipeline Conquest',
        description: 'A pipeline game',
        starRating: 5,
        category: null,
        publisher: null,
    },
    {
        id: 3,
        title: 'Server Siege',
        description: 'A server game',
        starRating: 4,
        category: null,
        publisher: null,
    },
];

describe('filterGamesByTitle', () => {
    it('returns games whose title contains the search term', () => {
        const result = filterGamesByTitle(games, 'DevOps');

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('DevOps Dominion');
    });

    it('matches titles case-insensitively', () => {
        const result = filterGamesByTitle(games, 'devops');

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('DevOps Dominion');
    });

    it('matches partial titles', () => {
        const result = filterGamesByTitle(games, 'pipe');

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Pipeline Conquest');
    });

    it('returns an empty array when no games match', () => {
        const result = filterGamesByTitle(
            games,
            'this-game-does-not-exist',
        );

        expect(result).toEqual([]);
    });

    it('returns all games when the search term is empty', () => {
        const result = filterGamesByTitle(games, '');

        expect(result).toEqual(games);
    });

    it('ignores leading and trailing whitespace', () => {
        const result = filterGamesByTitle(games, '  devops  ');

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('DevOps Dominion');
    });
});
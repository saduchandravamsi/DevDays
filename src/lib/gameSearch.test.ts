import { describe, it, expect } from 'vitest';

import type { Game } from '../types/game';

import { filterGamesByTitle } from './gameSearch';

const games: Game[] = [
    {
        id: 1,
        title: 'Super Mario',
        description: 'A platform game',
        starRating: 4.5,
        category: {
            id: 1,
            name: 'Adventure',
        },
        publisher: {
            id: 1,
            name: 'Nintendo',
        },
    },
    {
        id: 2,
        title: 'Mario Kart',
        description: 'A racing game',
        starRating: 4.2,
        category: {
            id: 2,
            name: 'Racing',
        },
        publisher: {
            id: 2,
            name: 'Nintendo',
        },
    },
    {
        id: 3,
        title: 'Chess Master',
        description: 'A strategy game',
        starRating: 4.8,
        category: {
            id: 3,
            name: 'Strategy',
        },
        publisher: {
            id: 3,
            name: 'Board Games Inc.',
        },
    },
];

describe('filterGamesByTitle', () => {
    it('returns all games when the search term is empty', () => {
        expect(filterGamesByTitle(games, '')).toEqual(games);
    });

    it('filters games by a partial title match', () => {
        const result = filterGamesByTitle(games, 'Mario');

        expect(result.map((game) => game.title)).toEqual([
            'Super Mario',
            'Mario Kart',
        ]);
    });

    it('matches titles case-insensitively', () => {
        const result = filterGamesByTitle(games, 'mArIo');

        expect(result.map((game) => game.title)).toEqual([
            'Super Mario',
            'Mario Kart',
        ]);
    });

    it('ignores leading and trailing whitespace', () => {
        const result = filterGamesByTitle(games, '  mario  ');

        expect(result.map((game) => game.title)).toEqual([
            'Super Mario',
            'Mario Kart',
        ]);
    });

    it('returns an empty array when there are no matches', () => {
        expect(filterGamesByTitle(games, 'zelda')).toEqual([]);
    });
});
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';

import { categories, publishers, games } from '../../db/schema';

import type { Database } from './db';

import {
    getAllGames,
    getAllGameIds,
    getGameById,
    getGamesPage,
} from './games';

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });

    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    describe('getGamesPage', () => {
        it('returns the requested page of games', async () => {
            await seedGames(db, 5);

            const result = await getGamesPage(db, {
                page: 1,
                limit: 2,
            });

            expect(result.games.map((game) => game.title)).toEqual([
                'Game 01',
                'Game 02',
            ]);

            expect(result.page).toBe(1);
            expect(result.limit).toBe(2);
            expect(result.total).toBe(5);
            expect(result.totalPages).toBe(3);
        });

        it('returns the correct games for a later page', async () => {
            await seedGames(db, 5);

            const result = await getGamesPage(db, {
                page: 2,
                limit: 2,
            });

            expect(result.games.map((game) => game.title)).toEqual([
                'Game 03',
                'Game 04',
            ]);

            expect(result.page).toBe(2);
            expect(result.limit).toBe(2);
            expect(result.total).toBe(5);
            expect(result.totalPages).toBe(3);
        });

        it('returns the remaining games on the last page', async () => {
            await seedGames(db, 5);

            const result = await getGamesPage(db, {
                page: 3,
                limit: 2,
            });

            expect(result.games.map((game) => game.title)).toEqual([
                'Game 05',
            ]);

            expect(result.page).toBe(3);
            expect(result.limit).toBe(2);
            expect(result.total).toBe(5);
            expect(result.totalPages).toBe(3);
        });

        it('returns an empty games array when the page is beyond the last page', async () => {
            await seedGames(db, 5);

            const result = await getGamesPage(db, {
                page: 4,
                limit: 2,
            });

            expect(result.games).toEqual([]);
            expect(result.page).toBe(4);
            expect(result.limit).toBe(2);
            expect(result.total).toBe(5);
            expect(result.totalPages).toBe(3);
        });

        it('preserves category and publisher information', async () => {
            await seedGames(db, 2);

            const result = await getGamesPage(db, {
                page: 1,
                limit: 2,
            });

            expect(result.games[0].category).toEqual({
                id: expect.any(Number),
                name: 'Strategy',
            });

            expect(result.games[0].publisher).toEqual({
                id: expect.any(Number),
                name: 'Pub One',
            });
        });

        it('rejects invalid page and limit values', async () => {
            await expect(
                getGamesPage(db, {
                    page: 0,
                    limit: 2,
                }),
            ).rejects.toThrow();

            await expect(
                getGamesPage(db, {
                    page: 1,
                    limit: 0,
                }),
            ).rejects.toThrow();
        });

        it('rejects non-integer page and limit values', async () => {
            await expect(
                getGamesPage(db, {
                    page: 1.5,
                    limit: 2,
                }),
            ).rejects.toThrow();

            await expect(
                getGamesPage(db, {
                    page: 1,
                    limit: 2.5,
                }),
            ).rejects.toThrow();
        });
    });

    describe('getAllGames', () => {
        it('returns all games ordered by title', async () => {
            await seedGames(db, 3);

            const all = await getAllGames(db);

            expect(all.map((g) => g.title)).toEqual([
                'Game 01',
                'Game 02',
                'Game 03',
            ]);

            expect(all[0].category).toEqual({
                id: expect.any(Number),
                name: 'Strategy',
            });

            expect(all[0].publisher).toEqual({
                id: expect.any(Number),
                name: 'Pub One',
            });
        });
    });

    describe('getAllGameIds', () => {
        it('returns all game ids ordered by title', async () => {
            await seedGames(db, 3);

            const ids = await getAllGameIds(db);
            const all = await getAllGames(db);

            expect(ids).toEqual(all.map((g) => g.id));
        });
    });

    describe('getGameById', () => {
        it('fetches a single game by id', async () => {
            await seedGames(db, 2);

            const ids = await getAllGameIds(db);
            const game = await getGameById(db, ids[0]);

            expect(game?.title).toBe('Game 01');
        });

        it('returns null for a non-existent game', async () => {
            await seedGames(db, 2);

            expect(await getGameById(db, 99999)).toBeNull();
        });
    });
});
import { test, expect, type Response } from '@playwright/test';

test.describe('Game Listing and Navigation', () => {
  test('should display games with titles on index page', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
    });

    await test.step('Verify games grid is visible', async () => {
      const gamesGrid = page.getByTestId('games-grid');
      await expect(gamesGrid).toBeVisible();
    });

    await test.step('Verify game cards are displayed', async () => {
      const gameCards = page.getByTestId('game-card');
      await expect(gameCards.first()).toBeVisible();
      expect(await gameCards.count()).toBeGreaterThan(0);
    });

    await test.step('Verify game cards have titles with content', async () => {
      const gameCards = page.getByTestId('game-card');

      await expect(
        gameCards.first().getByTestId('game-title'),
      ).toBeVisible();

      await expect(
        gameCards.first().getByTestId('game-title'),
      ).not.toBeEmpty();
    });
  });

  test('should navigate to correct game details page when clicking on a game', async ({
    page,
  }) => {
    let gameId: string | null;
    let gameTitle: string | null;

    await test.step('Navigate to homepage and wait for games to load', async () => {
      await page.goto('/');

      const gamesGrid = page.getByTestId('games-grid');
      await expect(gamesGrid).toBeVisible();
    });

    await test.step('Get first game information and click it', async () => {
      const firstGameCard = page.getByTestId('game-card').first();

      gameId = await firstGameCard.getAttribute('data-game-id');
      gameTitle = await firstGameCard.getAttribute('data-game-title');

      await firstGameCard.click();
    });

    await test.step('Verify navigation to game details page', async () => {
      await expect(page).toHaveURL(`/game/${gameId}`);
      await expect(page.getByTestId('game-details')).toBeVisible();
    });

    await test.step('Verify game title matches clicked game', async () => {
      if (gameTitle) {
        await expect(
          page.getByTestId('game-details-title'),
        ).toHaveText(gameTitle);
      }
    });
  });

  test('should display game details with all required information', async ({
    page,
  }) => {
    await test.step('Navigate to specific game details page', async () => {
      await page.goto('/game/1');

      await expect(
        page.getByTestId('game-details'),
      ).toBeVisible();
    });

    await test.step('Verify game title is displayed', async () => {
      const gameTitle = page.getByTestId('game-details-title');

      await expect(gameTitle).toBeVisible();
      await expect(gameTitle).not.toBeEmpty();
    });

    await test.step('Verify game description is displayed', async () => {
      const gameDescription = page.getByTestId(
        'game-details-description',
      );

      await expect(gameDescription).toBeVisible();
      await expect(gameDescription).not.toBeEmpty();
    });

    await test.step(
      'Verify publisher or category information is present',
      async () => {
        const publisherExists = await page
          .getByTestId('game-details-publisher')
          .isVisible();

        const categoryExists = await page
          .getByTestId('game-details-category')
          .isVisible();

        expect(publisherExists || categoryExists).toBeTruthy();

        if (publisherExists) {
          await expect(
            page.getByTestId('game-details-publisher'),
          ).not.toBeEmpty();
        }

        if (categoryExists) {
          await expect(
            page.getByTestId('game-details-category'),
          ).not.toBeEmpty();
        }
      },
    );
  });

  test('should display a button to back the game', async ({ page }) => {
    await test.step('Navigate to game details page', async () => {
      await page.goto('/game/1');

      await expect(
        page.getByTestId('game-details'),
      ).toBeVisible();
    });

    await test.step(
      'Verify back game button is visible and enabled',
      async () => {
        const backButton = page.getByTestId('back-game-button');

        await expect(backButton).toBeVisible();
        await expect(backButton).toContainText('Support This Game');
        await expect(backButton).toBeEnabled();
      },
    );
  });

  test('should be able to navigate back to home from game details', async ({
    page,
  }) => {
    await test.step('Navigate to game details page', async () => {
      await page.goto('/game/1');

      await expect(
        page.getByTestId('game-details'),
      ).toBeVisible();
    });

    await test.step('Click back to all games link', async () => {
      const backLink = page.getByRole('link', {
        name: /back to all games/i,
      });

      await expect(backLink).toBeVisible();
      await backLink.click();
    });

    await test.step('Verify navigation back to homepage', async () => {
      await expect(page).toHaveURL('/');
      await expect(
        page.getByTestId('games-grid'),
      ).toBeVisible();
    });
  });

  test('should return a 404 page for a non-existent game', async ({
    page,
  }) => {
    let response: Response | null;

    await test.step('Navigate to non-existent game', async () => {
      response = await page.goto('/game/99999');
    });

    await test.step('Verify a branded 404 page is served', async () => {
      expect(response?.status()).toBe(404);

      await expect(page).toHaveTitle(
        /Page Not Found - Tailspin Toys/,
      );

      await expect(
        page.getByTestId('not-found'),
      ).toBeVisible();

      await expect(
        page.getByTestId('not-found-heading'),
      ).not.toBeEmpty();

      await expect(
        page.getByTestId('not-found-home-link'),
      ).toBeVisible();
    });
  });

  // ------------------------------------------------------------
  // Game Search Tests
  // ------------------------------------------------------------

  test('should filter games by title while typing', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('game-search');

    await expect(searchInput).toBeVisible();

    await searchInput.fill('DevOps');

    const visibleCards = page.locator(
      '[data-testid="game-card"]:not([hidden])',
    );

    await expect(visibleCards).toHaveCount(1);

    await expect(
      visibleCards.first().getByTestId('game-title'),
    ).toContainText('DevOps Dominion');
  });

  test('should search for games case-insensitively', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('game-search');

    await expect(searchInput).toBeVisible();

    await searchInput.fill('devops');

    const visibleCards = page.locator(
      '[data-testid="game-card"]:not([hidden])',
    );

    await expect(visibleCards).toHaveCount(1);

    await expect(
      visibleCards.first().getByTestId('game-title'),
    ).toContainText('DevOps Dominion');
  });

  test('should display an empty state when no games match the search', async ({
    page,
  }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('game-search');

    await expect(searchInput).toBeVisible();

    await searchInput.fill('this-game-does-not-exist');

    const visibleCards = page.locator(
      '[data-testid="game-card"]:not([hidden])',
    );

    await expect(visibleCards).toHaveCount(0);

    const emptyState = page.getByTestId('game-search-empty');

    await expect(emptyState).toBeVisible();

    await expect(emptyState).toContainText(
      'No games found matching "this-game-does-not-exist".',
    );
  });

  test('should restore all games when the search is cleared', async ({
    page,
  }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('game-search');

    await expect(searchInput).toBeVisible();

    const gameCards = page.getByTestId('game-card');

    const initialCount = await gameCards.count();

    await expect(initialCount).toBe(21);

    await searchInput.fill('DevOps');

    const visibleCards = page.locator(
      '[data-testid="game-card"]:not([hidden])',
    );

    await expect(visibleCards).toHaveCount(1);

    await expect(
      visibleCards.first().getByTestId('game-title'),
    ).toContainText('DevOps Dominion');

    await searchInput.fill('');

    await expect(visibleCards).toHaveCount(initialCount);
  });

  test('should have an accessible game search input', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('game-search');

    await expect(searchInput).toBeVisible();

    await expect(searchInput).toHaveAttribute(
      'id',
      'game-search',
    );

    await expect(
      page.getByLabel('Search games by title'),
    ).toBeVisible();

    await searchInput.focus();

    await expect(searchInput).toBeFocused();
  });
});
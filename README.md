# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## 🎮 Adding a New Game — Responsiveness Guide

Every game on this site must work on **phones (375px+), tablets, and large monitors**. Follow these rules to keep games responsive out of the box.

### 1. Use the responsive base (already in place)

The following are set globally in `index.css` — **do not override them with fixed sizes**:

```css
/* Universal box-sizing — no surprises */
*, *::before, *::after { box-sizing: border-box; }

/* CSS variables for consistent spacing & breakpoints */
:root {
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --spacing-xs: 4px;  --spacing-sm: 8px;
  --spacing-md: 16px; --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### 2. Mobile-first CSS

- Write **single-column layout first** (no media query needed).
- Add **side-by-side layout** inside `@media (min-width: 768px)`.
- Never start with `flex-direction: row` on the main game area — use `column` by default, `row` on wide screens.

### 3. Say NO to fixed pixel sizes

| ❌ Bad | ✅ Good |
|---|---|
| `width: 400px` | `max-width: 400px; width: 100%` |
| `font-size: 32px` | `font-size: clamp(20px, 5vw, 36px)` |
| `min-width: 96px` | `min-width: clamp(28px, 8vw, 64px)` |
| `padding: 20px` | `padding: clamp(8px, 3vw, 24px)` |
| `flex: 0 0 400px` | `flex: 1 1 100%; max-width: 400px` |
| `height: 400px` | `aspect-ratio: 1/1; max-height: 400px` |

### 4. Use `dvh` instead of `vh`

`100vh` is **taller than the visible area on mobile** (browser chrome counts). Always use:

```css
min-height: 100dvh;
/* or */
height: calc(100dvh - 120px);
```

### 5. SVG games must scale

- Give the `<svg>` `width="100%" height="100%"` and a suitable `viewBox`.
- Place it inside a wrapper with `max-width` + `aspect-ratio`.
- Let the SVG `viewBox` handle internal scaling — never hardcode `width`/`height` in pixels on the `<svg>` itself (except as `maxWidth`/`maxHeight` inline style).

### 6. Contain overflow

Every game container should have:

```css
overflow-x: hidden;
max-width: 100%;
```

(Site-wide, `.App` already has `overflow-x: hidden`.)

### 7. Test on real device sizes

Before committing, test your game at these widths (use browser DevTools):

| Device | Width |
|---|---|
| iPhone SE | 375px |
| iPhone 14 Pro | 390px |
| Tablet (portrait) | 768px |
| Small laptop | 1024px |
| Desktop | 1440px+ |

### 8. Keyboard/button games (like Hangman)

- Buttons must use `min-width` + `min-height` with `clamp()` — never fixed dimensions.
- Row gaps should also use `clamp()`.
- Add a **second breakpoint** (`@media (max-width: 375px)`) for very small phones if needed.

### 9. Leaderboard & secondary content

Leaderboards, stats panels, etc. should sit **below** the game and stack full-width on mobile. The existing `Leaderboard.css` already has a `@media (max-width: 600px)` breakpoint — follow its pattern.

### 10. Use `GamePage.js` as your route handler

All games are rendered via `/games/:slug` in `GamePage.js`. Your game component receives `fullPage` as a prop — use it to conditionally show/hide leaderboards and set `min-height: 100dvh` when in full-page mode.


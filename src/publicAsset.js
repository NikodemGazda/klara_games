/**
 * Build a URL for a file inside the `public/` folder that works:
 *   - at ANY route depth:  /  /games  /games/hang-man  /games/
 *   - on ANY host:         localhost:3000, Vercel, GitHub Pages subfolder
 *
 * `process.env.PUBLIC_URL` is set by react-scripts to your app's base path
 * (e.g. `/` right now, or `/klara_games/` if you add a `homepage` field).
 */
export default function publicAsset(relPath) {
  const base = process.env.PUBLIC_URL || '/';
  return `${base}${relPath}`;
}
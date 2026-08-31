/*
 * Tailwind is processed as a PostCSS plugin, which is how Tailwind v4 is meant
 * to run under Next.
 *
 * There is no `tailwind.config.js` and there will not be one: v4 configures
 * itself from CSS, and the theme this application uses is already written in
 * `src/app/globals.css` as custom properties. A JavaScript config would be a
 * second place to state a colour, which is the defect `globals.css` was built to
 * prevent — "a number that appears here appears nowhere else".
 */
export default {
  plugins: { "@tailwindcss/postcss": {} }
};

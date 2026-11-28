// Every route in the app. Add new routes here: smoke, axe and screenshot
// tests all run over this list.
export const routes = [
  "/",
  "/about",
  "/blog",
  "/now",
  "/contact",
  "/work/probell",
  "/work/sundet",
];

// Routes in the (pages) group, rendered in the light theme.
export const lightRoutes = routes.filter((route) => route !== "/");

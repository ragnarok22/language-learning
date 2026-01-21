import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { RootLayout } from "./routes/root-layout";
import { AppPage } from "./routes/app";
import { Landing } from "./routes/index";
import { PracticePage } from "./routes/practice";
import { SetupPage } from "./routes/setup";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: AppPage,
});

const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/setup",
  component: SetupPage,
});

const practiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice",
  component: PracticePage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  appRoute,
  setupRoute,
  practiceRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

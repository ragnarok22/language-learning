import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { RootLayout } from "./routes/root-layout";
import { Landing } from "./routes/index";
import { PracticePage } from "./routes/practice";
import { PracticeLessonPage } from "./routes/practice-lesson";
import { SetupPage } from "./routes/setup";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});

// appRoute removed

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

const practiceLessonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/$lessonId",
  component: PracticeLessonPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  setupRoute,
  practiceRoute,
  practiceLessonRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

import { loadFonts } from "./figma/fonts";
import { setText } from "./figma/nodes";
import { renderOnboardingScreen } from "./figma/renderer";
import { OnboardingSelectionScreen } from "./types/onboarding";

figma.showUI(__html__, { width: 560, height: 420 });

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "generate") {
    return;
  }

  const screen = msg.screen as OnboardingSelectionScreen;

  await renderOnboardingScreen(screen);
};

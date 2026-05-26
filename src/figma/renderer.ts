import { OnboardingSelectionScreen } from "../types/onboarding";
import { loadFonts } from "./fonts";
import { setText } from "./nodes";

function setAnswerItem(
  answerItem: SceneNode & ChildrenMixin,
  item: OnboardingSelectionScreen["items"][number],
) {
  setText(answerItem, "Emoji", item.emoji);
  setText(answerItem, "Title", item.title);
  setText(answerItem, "Description", item.description);
  setText(answerItem, "Label", item.label);
}

export async function renderOnboardingScreen(
  screen: OnboardingSelectionScreen,
) {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1 || selection[0].type !== "FRAME") {
    figma.notify("Select one onboarding Frame first");
    figma.closePlugin();
    return;
  }

  if (!screen?.title || !screen.items?.length) {
    figma.notify("Invalid screen JSON");
    return;
  }

  const templateFrame = selection[0] as FrameNode;
  const newFrame = templateFrame.clone();

  const parent = templateFrame.parent as BaseNode & ChildrenMixin;
  parent.appendChild(newFrame);

  newFrame.x = templateFrame.x + templateFrame.width + 40;
  newFrame.y = templateFrame.y;
  newFrame.name = screen.pageKey || `${templateFrame.name} / Generated`;

  await loadFonts(newFrame);

  setText(newFrame, "PreTitle", screen.preTitle);
  setText(newFrame, "Title", screen.title);
  setText(newFrame, "Description", screen.description);

  const answerItems = newFrame.findAll(
    (node) => node.name === "Answer Item" && "findOne" in node,
  ) as (SceneNode & ChildrenMixin)[];

  const templateAnswerItem = answerItems[0];

  if (!templateAnswerItem) {
    figma.notify("Answer Item component not found");
    return;
  }

  while (answerItems.length < screen.items.length) {
    const clonedAnswer = (templateAnswerItem as FrameNode).clone();
    const parent = templateAnswerItem.parent as BaseNode & ChildrenMixin;

    parent.appendChild(clonedAnswer);
    answerItems.push(clonedAnswer);
  }

  answerItems.slice(screen.items.length).forEach((node) => {
    node.remove();
  });

  answerItems.slice(0, screen.items.length).forEach((answerItem, index) => {
    setAnswerItem(answerItem, screen.items[index]);
  });

  newFrame.setPluginData("pageKey", screen.pageKey);
  newFrame.setPluginData("mode", screen.mode);
  newFrame.setPluginData("json", JSON.stringify(screen));

  figma.notify("Generated screen");
}

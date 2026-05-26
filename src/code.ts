type OnboardingSelectionScreen = {
  pageKey: string;
  preTitle?: string;
  title: string;
  description?: string;
  mode: "singleSelect" | "multiselect";
  items: {
    value: string;
    emoji?: string;
    title: string;
    description?: string;
    label?: string;
  }[];
};

figma.showUI(__html__, { width: 560, height: 420 });

const loadFonts = async (node: SceneNode & ChildrenMixin) => {
  const textNodes = node.findAll((node) => node.type === "TEXT") as TextNode[];

  for (const textNode of textNodes) {
    if (textNode.fontName !== figma.mixed) {
      await figma.loadFontAsync(textNode.fontName as FontName);
    }
  }
};

const setText = (
  root: SceneNode & ChildrenMixin,
  nodeName: string,
  value?: string,
) => {
  const node = root.findOne(
    (node) => node.type === "TEXT" && node.name === nodeName,
  ) as TextNode | null;

  if (!node) {
    return;
  }

  if (!value) {
    node.visible = false; // FIX: скрываем optional-тексты, если их нет
    return;
  }

  node.visible = true;
  node.characters = value;
};

const setAnswerItem = (
  answerItem: SceneNode & ChildrenMixin,
  item: OnboardingSelectionScreen["items"][number],
) => {
  setText(answerItem, "Emoji", item.emoji);
  setText(answerItem, "Title", item.title);
  setText(answerItem, "Description", item.description);
  setText(answerItem, "Label", item.label);
};

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "generate") {
    return;
  }

  // FIX: теперь ждём весь screen JSON
  const screen = msg.screen as OnboardingSelectionScreen;

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

  await loadFonts(newFrame); // FIX: грузим шрифты всего нового фрейма

  // FIX: маппинг верхних текстов по именам слоёв
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

  // FIX: добавляем недостающие варианты ответов
  while (answerItems.length < screen.items.length) {
    const clonedAnswer = (templateAnswerItem as FrameNode).clone();
    const parent = templateAnswerItem.parent as BaseNode & ChildrenMixin;

    parent.appendChild(clonedAnswer);
    answerItems.push(clonedAnswer);
  }

  // FIX: удаляем лишние варианты ответов
  answerItems.slice(screen.items.length).forEach((node) => {
    node.remove();
  });

  // FIX: заполняем все answers из JSON
  answerItems.slice(0, screen.items.length).forEach((answerItem, index) => {
    setAnswerItem(answerItem, screen.items[index]);
  });

  // FIX: сохраняем mode/pageKey в pluginData, чтобы потом использовать для flow/tests
  newFrame.setPluginData("pageKey", screen.pageKey);
  newFrame.setPluginData("mode", screen.mode);
  newFrame.setPluginData("json", JSON.stringify(screen));

  figma.notify("Generated screen");
};

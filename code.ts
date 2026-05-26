// плагин открывает UI
figma.showUI(__html__, { width: 320, height: 220 });

figma.ui.onmessage = async msg => {
  if (msg.type !== 'generate') {
    return;
  }

  const selection = figma.currentPage.selection;

  if (selection.length !== 1 || selection[0].type !== 'FRAME') {
    figma.notify('Select one onboarding Frame first');
    figma.closePlugin();
    return;
  }

  const templateFrame = selection[0] as FrameNode;

  const newFrame = templateFrame.clone();

  const parent = templateFrame.parent as BaseNode & ChildrenMixin;
  parent.appendChild(newFrame);

  newFrame.x = templateFrame.x + templateFrame.width + 40;
  newFrame.y = templateFrame.y;
  newFrame.name = `${templateFrame.name} / Generated`;

  const textNodes = newFrame.findAll(node => node.type === 'TEXT') as TextNode[];

  // обязательно грузим шрифты перед изменением текста
  for (const textNode of textNodes) {
    await figma.loadFontAsync(textNode.fontName as FontName);
  }

  // пока MVP — меняем первый крупный текст как title
  const titleNode = textNodes.find(node => node.characters === 'Choose your gender');
  if (titleNode) {
    titleNode.characters = msg.title;
  }

  // берем только ноды, у которых есть children/findOne
  const answerItems = newFrame.findAll(
    node => node.name === 'Answer Item' && 'findOne' in node,
  ) as (SceneNode & ChildrenMixin)[];

  // оставляем только 2 ответа
  answerItems.slice(2).forEach(node => {
    node.remove();
  });

  // меняем Label внутри первых двух Answer Item
  answerItems.slice(0, 2).forEach((answerItem, index) => {
    const label = answerItem.findOne(
      node => node.type === 'TEXT' && node.name === 'Label',
    ) as TextNode | null;

    if (label) {
      label.characters = msg.answers[index];
    }
  });

  figma.notify('Generated screen');
  figma.closePlugin();
};

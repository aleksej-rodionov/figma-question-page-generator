const selection = figma.currentPage.selection;

if (selection.length !== 1 || selection[0].type !== 'FRAME') {
  figma.notify('Select one onboarding Frame first');
  figma.closePlugin();
} else {
  const templateFrame = selection[0] as FrameNode;
  const newFrame = templateFrame.clone();
  const parent = templateFrame.parent as BaseNode & ChildrenMixin;
  parent.appendChild(newFrame);
  newFrame.x = templateFrame.x + templateFrame.width + 40;
  newFrame.y = templateFrame.y;
  newFrame.name = `${templateFrame.name} / Generated`;
  const answerItems = newFrame.findAll(node => node.name === 'Answer Item');
  answerItems.slice(2).forEach(node => {
    node.remove();
  });
  figma.notify('Generated test screen');
  figma.closePlugin();
}

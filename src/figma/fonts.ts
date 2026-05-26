// грузит шрифты всего нового фрейма
export async function loadFonts(node: SceneNode & ChildrenMixin) {
  const textNodes = node.findAll((node) => node.type === "TEXT") as TextNode[];

  for (const textNode of textNodes) {
    if (textNode.fontName !== figma.mixed) {
      await figma.loadFontAsync(textNode.fontName as FontName);
    }
  }
}

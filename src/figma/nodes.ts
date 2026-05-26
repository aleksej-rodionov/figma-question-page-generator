export function setText(
  root: SceneNode & ChildrenMixin,
  nodeName: string,
  value?: string,
) {
  const node = root.findOne(
    (node) => node.type === "TEXT" && node.name === nodeName,
  ) as TextNode | null;

  if (!node) return;

  if (!value) {
    node.visible = false;
    return;
  }

  node.visible = true;
  node.characters = value;
}

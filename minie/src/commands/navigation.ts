import { TreeStore } from '../models/TreeStore';

export type Direction = 'up' | 'down' | 'left' | 'right';

export function navigate(store: TreeStore, currentId: string, dir: Direction): string {
    const node = store.getNode(currentId);
    if (!node) return currentId;

    switch (dir) {
    case 'left':
        return node.parent ? node.parent.data.id : currentId;
    case 'right':
        return node.children[0]?.data.id ?? currentId;
    case 'up': {
        const prev = getSibling(node, -1);
        return prev ?? currentId;
    }
    case 'down': {
        const next = getSibling(node, 1);
        return next ?? currentId;
    }
    default:
        return currentId;
    }
}

function getSibling(node: any, offset: number): string | null {
    const parent = node.parent;
    if (!parent) return null;
    const siblings = parent.children;
    const idx = siblings.indexOf(node);
    if (idx < 0) return null;
    const target = siblings[idx + offset];
    return target ? target.data.id : null;
}

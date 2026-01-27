export interface NodeData {
    id: string;
    text?: string;
    [key: string]: any;
}

export class TreeNode {
    data: NodeData;
    // 可以是TreeNode或null, 默认值是null
    parent: TreeNode | null = null;
    children: TreeNode[] = [];

    constructor(data: NodeData) {
        this.data = data;
    }

    addChild(child: TreeNode) {
        child.parent = this;
        this.children.push(child);
    }

    removeChildById(id: string) {
        const idx = this.children.findIndex(c => c.data.id === id);
        if (idx >= 0) {
            const [removed] = this.children.splice(idx, 1);
            removed.parent = null;
            return removed;
        }
        return null;
    }

    findById(id: string): TreeNode | null {
        if (this.data.id === id) return this;
        for (const c of this.children) {
            const r = c.findById(id);
            if (r) return r;
        }
        return null;
    }
}

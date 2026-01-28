/**
 * `NodeData` 描述 Mind Map 节点自身携带的业务数据，
 * 仅强约束 `id`，其余字段全部放宽，方便逐步迁移旧模型。
 */
export interface NodeData {
    id: string;
    text?: string;
    [key: string]: any;
}

/**
 * `TreeNode` 是最小可用的多叉树抽象，后续可逐步替换老项目中的 `node` 模块。
 * - `parent` 用于指向父节点，根节点将保持 `null`
 * - `children` 维护顺序数组，保持与旧实现一致
 */
export class TreeNode {
    data: NodeData;
    parent: TreeNode | null = null;
    children: TreeNode[] = [];

    constructor(data: NodeData) {
        this.data = data;
    }

    /**
     * 将子节点挂载到当前节点末尾，自动维护 parent 指针。
     */
    addChild(child: TreeNode) {
        child.parent = this;
        this.children.push(child);
    }

    /**
     * 根据 id 删除子节点，如果不存在返回 null。
     * 返回被删除的节点，方便外层逻辑做撤销或重新挂载。
     */
    removeChildById(id: string) {
        const idx = this.children.findIndex(c => c.data.id === id);
        if (idx >= 0) {
            const [removed] = this.children.splice(idx, 1);
            removed.parent = null;
            return removed;
        }
        return null;
    }

    /**
     * 深度优先搜索节点，命中即返回，不存在则返回 null。
     */
    findById(id: string): TreeNode | null {
        if (this.data.id === id) return this;
        for (const c of this.children) {
            const r = c.findById(id);
            if (r) return r;
        }
        return null;
    }
}

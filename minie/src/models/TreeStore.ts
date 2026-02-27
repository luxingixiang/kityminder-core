import { TreeNode, NodeData } from './Node';

/**
 * TreeStore 封装 Mind Map 的核心增删改查逻辑，
 * 形成“数据层 -> 渲染层”之间的分割，便于后续单测与 UI 复用。
 */
export class TreeStore {
    readonly root: TreeNode;

    constructor(rootData: NodeData) {
        this.root = new TreeNode(rootData);
    }

    /**
     * 通过 id 查找节点，若不存在则返回 null。
     */
    getNode(id: string): TreeNode | null {
        return this.root.findById(id);
    }

    /**
     * 创建子节点并插入到目标父节点，可指定插入位置。
     */
    addNode(parentId: string, data: NodeData, index?: number): TreeNode {
        if (this.getNode(data.id)) {
            throw new Error(`Node id "${data.id}" already exists`);
        }
        const parent = this.getNodeOrThrow(parentId);
        const node = new TreeNode(data);
        parent.insertChild(node, index);
        return node;
    }

    /**
     * 删除节点但不允许删除根节点，返回被删除的节点对象。
     */
    removeNode(id: string): TreeNode {
        this.ensureNotRoot(id);
        const node = this.getNodeOrThrow(id);
        const parent = node.parent;
        if (!parent) {
            throw new Error(`Node "${id}" is detached from tree`);
        }
        parent.removeChildById(id);
        return node;
    }

    /**
     * 将已存在的节点挂载到目标父节点（用于撤销/重做）。
     */
    attachNode(parentId: string, node: TreeNode, index?: number) {
        if (this.getNode(node.data.id)) {
            throw new Error(`Node id "${node.data.id}" already exists`);
        }
        const parent = this.getNodeOrThrow(parentId);
        if (node === parent) {
            throw new Error('Cannot attach node into itself');
        }
        // 防止将父节点挂载到自己的后代节点中
        if (this.isDescendant(parent, node)) {
            throw new Error('Cannot attach parent into its descendant');
        }
        parent.insertChild(node, index);
    }

    /**
     * 将节点移动到新的父节点，可自定义在子节点数组中的位置。
     */
    moveNode(nodeId: string, targetParentId: string, index?: number): TreeNode {
        this.ensureNotRoot(nodeId);
        const node = this.getNodeOrThrow(nodeId);
        const targetParent = this.getNodeOrThrow(targetParentId);

        if (node === targetParent) {
            throw new Error('Cannot move node into itself');
        }
        if (this.isDescendant(targetParent, node)) {
            throw new Error('Cannot move parent into its descendant');
        }

        node.parent?.removeChildById(nodeId);
        targetParent.insertChild(node, index);
        return node;
    }

    /**
     * 更新节点文本。
     */
    updateNodeText(nodeId: string, text: string) {
        const node = this.getNodeOrThrow(nodeId);
        node.data.text = text;
    }

    private getNodeOrThrow(id: string): TreeNode {
        const node = this.getNode(id);
        if (!node) {
            throw new Error(`Node "${id}" not found`);
        }
        return node;
    }

    private ensureNotRoot(id: string) {
        if (this.root.data.id === id) {
            throw new Error('Cannot delete or move the root node');
        }
    }

    /**
     * 判断 candidate 是否为 potentialAncestor 的后代节点。
     */
    private isDescendant(candidate: TreeNode, potentialAncestor: TreeNode): boolean {
        let current: TreeNode | null = candidate.parent;
        while (current) {
            if (current === potentialAncestor) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }
}

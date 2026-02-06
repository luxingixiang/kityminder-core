import { TreeStore } from '../models/TreeStore';
import { TreeNode, type NodeData } from '../models/Node';

export interface ProtocolNode {
    data: NodeData;
    children?: ProtocolNode[];
}

export interface ProtocolTree {
    root: ProtocolNode;
}

export function exportToJSON(store: TreeStore): ProtocolTree {
    return { root: toProtocolNode(store.root) };
}

export function importFromJSON(tree: ProtocolTree): TreeStore {
    if (!tree || !tree.root) {
        throw new Error('协议数据缺少 root 节点');
    }
    const seen = new Set<string>();
    const store = new TreeStore(tree.root.data);
    seen.add(tree.root.data.id);
    attachChildren(store.root, tree.root.children || [], seen);
    return store;
}

function toProtocolNode(node: TreeNode): ProtocolNode {
    return {
        data: node.data,
        children: node.children.map(toProtocolNode)
    };
}

function attachChildren(parent: TreeNode, children: ProtocolNode[], seen: Set<string>) {
    for (const child of children) {
        if (!child || !child.data) {
            throw new Error('子节点缺少 data');
        }
        if (seen.has(child.data.id)) {
            throw new Error(`检测到重复的节点 id: ${child.data.id}`);
        }
        seen.add(child.data.id);
        const node = new TreeNode(child.data);
        parent.insertChild(node);
        attachChildren(node, child.children || [], seen);
    }
}

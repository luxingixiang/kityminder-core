import { describe, it, expect } from 'vitest';
import { TreeNode } from '@core/models/Node';

describe('TreeNode', () => {
    it('links parent/child when addChild is called', () => {
        const root = new TreeNode({ id: 'root' });
        const child = new TreeNode({ id: 'child' });

        root.addChild(child);

        expect(root.children).toHaveLength(1);
        expect(root.children[0]).toBe(child);
        expect(child.parent).toBe(root);
    });

    it('removes child by id and detaches parent pointer', () => {
        const root = new TreeNode({ id: 'root' });
        const childA = new TreeNode({ id: 'A' });
        const childB = new TreeNode({ id: 'B' });

        root.addChild(childA);
        root.addChild(childB);

        const removed = root.removeChildById('A');

        expect(removed?.data.id).toBe('A');
        expect(root.children).toHaveLength(1);
        expect(root.children[0].data.id).toBe('B');
        expect(removed?.parent).toBeNull();
    });

    it('finds nested nodes by id', () => {
        const root = new TreeNode({ id: 'root' });
        const level1 = new TreeNode({ id: 'lv1' });
        const level2 = new TreeNode({ id: 'lv2' });
        const level3 = new TreeNode({ id: 'lv3' });

        root.addChild(level1);
        level1.addChild(level2);
        level2.addChild(level3);

        const found = root.findById('lv3');
        expect(found).toBe(level3);

        const missing = root.findById('unknown');
        expect(missing).toBeNull();
    });

    it('inserts child at specific index when requested', () => {
        const root = new TreeNode({ id: 'root' });
        const childA = new TreeNode({ id: 'A' });
        const childB = new TreeNode({ id: 'B' });
        const childC = new TreeNode({ id: 'C' });

        root.addChild(childA);
        root.insertChild(childB, 0);
        root.insertChild(childC, 1);

        expect(root.children.map(n => n.data.id)).toEqual(['B', 'C', 'A']);
    });
});

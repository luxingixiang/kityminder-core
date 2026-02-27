import { describe, it, expect } from 'vitest';
import { TreeStore } from '@core/models/TreeStore';
import { navigate } from '@core/commands/navigation';

describe('navigation', () => {
    const build = () => {
        const store = new TreeStore({ id: 'root' });
        store.addNode('root', { id: 'A' });
        store.addNode('root', { id: 'B' });
        store.addNode('root', { id: 'C' });
        store.addNode('B', { id: 'B-1' });
        return store;
    };

    it('moves left to parent', () => {
        const store = build();
        expect(navigate(store, 'B-1', 'left')).toBe('B');
    });

    it('moves right to first child', () => {
        const store = build();
        expect(navigate(store, 'B', 'right')).toBe('B-1');
        expect(navigate(store, 'C', 'right')).toBe('C');
    });

    it('moves up/down among siblings', () => {
        const store = build();
        expect(navigate(store, 'B', 'up')).toBe('A');
        expect(navigate(store, 'B', 'down')).toBe('C');
        expect(navigate(store, 'A', 'up')).toBe('A');
        expect(navigate(store, 'C', 'down')).toBe('C');
    });
});

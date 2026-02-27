import { describe, it, expect } from 'vitest';
import { CommandRegistry, normalizeShortcut } from '@core/commands/registry';

describe('CommandRegistry', () => {
    it('normalizes shortcuts consistently', () => {
        expect(normalizeShortcut('Ctrl+Shift+Z')).toBe('ctrl+shift+z');
        expect(normalizeShortcut('shift+ctrl+z')).toBe('ctrl+shift+z');
    });

    it('executes command by shortcut', () => {
        const registry = new CommandRegistry();
        let fired = 0;
        registry.register({
            name: 'undo',
            handler: () => { fired += 1; },
            shortcuts: ['ctrl+z']
        });

        const handled = registry.executeByShortcut('ctrl+z');
        expect(handled).toBe(true);
        expect(fired).toBe(1);
    });
});

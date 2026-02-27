import { CommandRegistry, eventToShortcut } from './registry';

export function bindShortcuts(registry: CommandRegistry, target: Window | Document = window) {
    const handler: EventListener = (event) => {
        const keyboardEvent = event as KeyboardEvent;
        const shortcut = eventToShortcut(keyboardEvent);
        const handled = registry.executeByShortcut(shortcut);
        if (handled) {
            keyboardEvent.preventDefault();
        }
    };
    target.addEventListener('keydown', handler);
    return () => target.removeEventListener('keydown', handler);
}
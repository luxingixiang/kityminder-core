export type CommandHandler = () => void;

export interface CommandEntry {
    name: string;
    handler: CommandHandler;
    shortcuts?: string[];
}

export class CommandRegistry {
    private commands = new Map<string, CommandEntry>();
    private shortcutMap = new Map<string, string>();

    register(entry: CommandEntry) {
        this.commands.set(entry.name, entry);
        if (entry.shortcuts) {
            for (const key of entry.shortcuts) {
                this.shortcutMap.set(normalizeShortcut(key), entry.name);
            }
        }
    }

    execute(name: string) {
        const entry = this.commands.get(name);
        if (!entry) {
            throw new Error(`Command "${name}" not found`);
        }
        entry.handler();
    }

    executeByShortcut(shortcut: string) {
        const name = this.shortcutMap.get(normalizeShortcut(shortcut));
        if (!name) return false;
        this.execute(name);
        return true;
    }
}

export function normalizeShortcut(shortcut: string) {
    return shortcut
        .toLowerCase()
        .split('+')
        .map(part => part.trim())
        .filter(Boolean)
        .sort()
        .join('+');
}

export function eventToShortcut(event: KeyboardEvent) {
    const parts: string[] = [];
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    parts.push(event.key.toLowerCase());
    return normalizeShortcut(parts.join('+'));
}

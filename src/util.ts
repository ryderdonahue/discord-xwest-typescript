/* eslint-disable @typescript-eslint/no-explicit-any */
import { Config } from './config';

export function shuffle(a: Array<any>): Array<any> {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

export function SanitizeMarkdown(str: string): string {
    return replaceAll(replaceAll(replaceAll(str, '`', ''), '\\', ''), `\n`, '');
}


export function checkIfMod(id: string): boolean {
    let isMod = false;
    Config.moderatorIds.map(val => {
        if (val === id) {
            isMod = true;
        }
    })

    return isMod;
}

export function checkIfDuplicate(array: any[], id: string): boolean {
    let found = false;
    array.map(val => {
        if (val == id) {
            found = true;
        }
    });

    return found;
}

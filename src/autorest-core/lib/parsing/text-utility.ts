import { DataHandleRead } from '../data-store/data-store';
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const regexNewLine = /\r?\n/g;

export function LineIndices(text: string): number[] {
  let indices = [0];

  let match: RegExpExecArray | null;
  while ((match = regexNewLine.exec(text)) !== null) {
    indices.push(match.index + match[0].length);
  }

  return indices;
}

export function Lines(text: string): string[] {
  return text.split(regexNewLine);
}

export async function IndexToPosition(text: DataHandleRead | string, index: number): Promise<sourceMap.Position> {
  const startIndices = typeof text === "string" ? LineIndices(text) : await (await text.ReadMetadata()).lineIndices;
  // bin. search for last `<item> <= index`
  let lineIndexMin = 0;
  let lineIndexMax = startIndices.length;
  while (lineIndexMin < lineIndexMax - 1) {
    const lineIndex = (lineIndexMin + lineIndexMax) / 2 | 0;
    if (startIndices[lineIndex] <= index) {
      lineIndexMin = lineIndex;
    } else {
      lineIndexMax = lineIndex;
    }
  }

  return {
    column: index - startIndices[lineIndexMin],
    line: 1 + lineIndexMin,
  };
}

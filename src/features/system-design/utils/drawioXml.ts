/**
 * Draw.io XML extraction, sanitization, validation and repair.
 *
 * This file is intentionally defensive because LLMs often generate XML that is
 * "string-valid" but structurally invalid for diagrams.net/draw.io.
 */

export interface DrawioXmlResult {
  xml: string;
  warnings: string[];
  valid: boolean;
}

function getAttr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
  return match?.[1] ?? null;
}

function hasAttr(tag: string, name: string, value?: string): boolean {
  const found = getAttr(tag, name);
  if (value === undefined) return found !== null;
  return found === value;
}

function extractCells(rootContent: string): string[] {
  return (
    rootContent.match(
      /<mxCell\b[^>]*\/>|<mxCell\b[^>]*>[\s\S]*?<\/mxCell>/g,
    ) ?? []
  );
}

function getOpeningTag(cell: string): string {
  return cell.match(/^<mxCell\b[^>]*>/)?.[0] ?? cell;
}

function isRootCell(cell: string): boolean {
  const tag = getOpeningTag(cell);
  const id = getAttr(tag, 'id');
  return id === '0' || id === '1';
}

function setAttr(tag: string, name: string, value: string): string {
  const attrRegex = new RegExp(`\\b${name}="[^"]*"`, 'i');

  if (attrRegex.test(tag)) {
    return tag.replace(attrRegex, `${name}="${value}"`);
  }

  return tag.replace(/>$/, ` ${name}="${value}">`);
}

function replaceOpeningTag(cell: string, nextTag: string): string {
  return cell.replace(/^<mxCell\b[^>]*>/, nextTag);
}

function renumberNonRootCells(cells: string[], warnings: string[]): string[] {
  const root0 =
    cells.find((cell) => getAttr(getOpeningTag(cell), 'id') === '0') ??
    '<mxCell id="0"/>';
  const root1 =
    cells.find((cell) => getAttr(getOpeningTag(cell), 'id') === '1' && getAttr(getOpeningTag(cell), 'parent') === '0') ??
    '<mxCell id="1" parent="0"/>';

  const normalCells = cells.filter((cell) => {
    const tag = getOpeningTag(cell);
    const id = getAttr(tag, 'id');
    return !(id === '0' || (id === '1' && getAttr(tag, 'parent') === '0'));
  });

  const idMap = new Map<string, string>();
  let nextId = 2;

  for (const cell of normalCells) {
    const oldId = getAttr(getOpeningTag(cell), 'id');
    if (!oldId) continue;

    if (!idMap.has(oldId)) {
      idMap.set(oldId, String(nextId++));
    } else {
      // Duplicate source ids cannot be referenced safely. Give this duplicate a new id.
      idMap.set(`${oldId}__duplicate_${nextId}`, String(nextId++));
    }
  }

  let duplicateCounter = 0;
  const usedIds = new Set(['0', '1']);
  const renumbered: string[] = [];

  for (const cell of normalCells) {
    let tag = getOpeningTag(cell);
    const oldId = getAttr(tag, 'id');

    if (!oldId) {
      warnings.push('Dropped mxCell with missing id during renumbering.');
      continue;
    }

    let newId = idMap.get(oldId);

    if (!newId || usedIds.has(newId)) {
      newId = String(nextId++);
    }

    // If duplicate old ids appear, the first keeps the mapped id; later duplicates get unique ids.
    if (renumbered.some((existing) => getAttr(getOpeningTag(existing), 'id') === newId)) {
      duplicateCounter += 1;
      newId = String(nextId++);
      warnings.push(`Renumbered duplicate mxCell id=${oldId} to id=${newId}.`);
    }

    usedIds.add(newId);

    tag = setAttr(tag, 'id', newId);

    const parent = getAttr(tag, 'parent');
    const source = getAttr(tag, 'source');
    const target = getAttr(tag, 'target');

    if (
      parent &&
      parent !== '0' &&
      parent !== '1' &&
      idMap.has(parent)
    ) {
      tag = setAttr(
        tag,
        'parent',
        idMap.get(parent)!,
      );
    }

    if (source && idMap.has(source)) {
      tag = setAttr(
        tag,
        'source',
        idMap.get(source)!,
      );
    }

    if (target && idMap.has(target)) {
      tag = setAttr(
        tag,
        'target',
        idMap.get(target)!,
      );
    }

    renumbered.push(
      replaceOpeningTag(
        cell,
        tag,
      ),
    );
  }

  if (duplicateCounter > 0 || normalCells.length > 0) {
    warnings.push('Normalized Draw.io mxCell ids and edge references.');
  }

  return [root0, root1, ...renumbered];
}

function isValidCell(cell: string): boolean {
  const tag = getOpeningTag(cell);
  const id = getAttr(tag, 'id');

  if (!id) return false;

  // Draw.io root cells are allowed to be self-closing/simple.
  if (id === '0') return true;
  if (id === '1') return getAttr(tag, 'parent') === '0';

  // A non-root mxCell must not contain another mxCell.
  const inner = cell.replace(/^<mxCell\b[^>]*>/, '').replace(/<\/mxCell>$/, '');
  if (/<mxCell\b/i.test(inner)) return false;

  const isVertex = hasAttr(tag, 'vertex', '1');
  const isEdge = hasAttr(tag, 'edge', '1');

  // Every normal cell must be either a vertex or an edge.
  if (!isVertex && !isEdge) return false;

  // Every normal cell must have a parent.
  //
  // Flat diagrams normally use parent="1".
  // Professional container diagrams may instead use a group or swimlane
  // mxCell as the parent. Whole-document reference validation happens later.
  const parent = getAttr(tag, 'parent');

  if (!parent) return false;

  if (parent === id) return false;

  // Vertices need geometry with x/y/width/height.
  if (isVertex) {
    const geometry = cell.match(/<mxGeometry\b[^>]*(?:\/>|>[\s\S]*?<\/mxGeometry>)/)?.[0] ?? '';
    if (!geometry) return false;
    if (!hasAttr(geometry, 'as', 'geometry')) return false;
    if (!hasAttr(geometry, 'x')) return false;
    if (!hasAttr(geometry, 'y')) return false;
    if (!hasAttr(geometry, 'width')) return false;
    if (!hasAttr(geometry, 'height')) return false;
  }

  // Edges need source, target, and relative geometry.
  if (isEdge) {
    if (!hasAttr(tag, 'source')) return false;
    if (!hasAttr(tag, 'target')) return false;

    const geometry = cell.match(/<mxGeometry\b[^>]*(?:\/>|>[\s\S]*?<\/mxGeometry>)/)?.[0] ?? '';
    if (!geometry) return false;
    if (!hasAttr(geometry, 'as', 'geometry')) return false;
    if (!hasAttr(geometry, 'relative', '1')) return false;
  }

  return true;
}

function hasParentCycle(
  cells: string[],
): boolean {
  const parentById =
    new Map<string, string>();

  for (const cell of cells) {
    const tag =
      getOpeningTag(cell);

    const id =
      getAttr(tag, 'id');

    const parent =
      getAttr(tag, 'parent');

    if (
      id &&
      parent &&
      id !== '0' &&
      id !== '1'
    ) {
      parentById.set(
        id,
        parent,
      );
    }
  }

  for (
    const startId of
    parentById.keys()
  ) {
    const visited =
      new Set<string>();

    let current:
      string | undefined =
      startId;

    while (
      current &&
      current !== '0' &&
      current !== '1'
    ) {
      if (visited.has(current)) {
        return true;
      }

      visited.add(current);

      current =
        parentById.get(current);
    }
  }

  return false;
}

/**
 * Structural validation before loading into diagrams.net.
 */
export function isValidDrawioXml(xml: string): boolean {
  if (!xml || typeof xml !== 'string') return false;

  const modelMatch = xml.match(/<mxGraphModel\b[^>]*>[\s\S]*<\/mxGraphModel>/);
  if (!modelMatch) return false;

  const rootMatch = xml.match(/<root\b[^>]*>([\s\S]*?)<\/root>/);
  if (!rootMatch) return false;

  // Reject malformed closing tags like </mxCell/>.
  if (/<\/[A-Za-z][\w.-]*\s*\/>/.test(xml)) return false;

  const rootContent = rootMatch[1];
  const cells = extractCells(rootContent);

  if (cells.length < 3) return false;

  const ids = new Set<string>();
  let hasRoot0 = false;
  let hasRoot1 = false;
  let normalCellCount = 0;

  for (const cell of cells) {
    if (!isValidCell(cell)) return false;

    const id = getAttr(getOpeningTag(cell), 'id');
    if (!id || ids.has(id)) return false;

    ids.add(id);

    if (id === '0') hasRoot0 = true;
    else if (id === '1') hasRoot1 = true;
    else normalCellCount += 1;
  }

  if (
    !hasRoot0 ||
    !hasRoot1 ||
    normalCellCount === 0
  ) {
    return false;
  }

  if (hasParentCycle(cells)) {
    return false;
  }

  // Validate whole-document references only after every mxCell id is known.
  //
  // This allows professional Draw.io container structures such as:
  // group -> child node
  // swimlane -> child node
  // parent group -> nested group
  for (const cell of cells) {
    const tag =
      getOpeningTag(cell);

    const id =
      getAttr(tag, 'id');

    if (!id || id === '0') {
      continue;
    }

    const parent =
      getAttr(tag, 'parent');

    if (!parent || !ids.has(parent)) {
      return false;
    }

    if (parent === id) {
      return false;
    }

    if (hasAttr(tag, 'edge', '1')) {
      const source =
        getAttr(tag, 'source');

      const target =
        getAttr(tag, 'target');

      if (
        !source ||
        !target ||
        !ids.has(source) ||
        !ids.has(target)
      ) {
        return false;
      }

      if (
        source === '0' ||
        source === '1' ||
        target === '0' ||
        target === '1'
      ) {
        return false;
      }
    }
  }

  // Remove all valid mxCell blocks. Anything tag-like left directly under root
  // means orphan mxGeometry/mxPoint or another unsupported object exists.
  const leftover = rootContent
    .replace(
      /<mxCell\b[^>]*\/>|<mxCell\b[^>]*>[\s\S]*?<\/mxCell>/g,
      '',
    )
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  if (/<[A-Za-z][\w.-]*/.test(leftover)) return false;

  return true;
}

/**
 * Extract and repair common LLM XML mistakes.
 */
export function extractAndRepairDrawioXml(rawInput: string): DrawioXmlResult {
  const warnings: string[] = [];

  if (!rawInput || typeof rawInput !== 'string') {
    return { xml: '', warnings: ['AI returned an empty diagram response.'], valid: false };
  }

  let xml = rawInput.trim();

  // Strip markdown fences.
  const fenced = xml
    .replace(/^```xml\s*\n?/i, '')
    .replace(/^```\s*\n?/, '')
    .replace(/\n?```\s*$/, '');

  if (fenced !== xml) {
    warnings.push('Removed markdown code fences from the AI response.');
    xml = fenced.trim();
  }

  // Extract only mxGraphModel.
  const modelMatch = xml.match(/<mxGraphModel\b[^>]*>[\s\S]*<\/mxGraphModel>/);
  if (modelMatch) {
    if (modelMatch[0] !== xml) {
      warnings.push('Extracted the mxGraphModel block from surrounding text.');
    }
    xml = modelMatch[0];
  }

  // Repair malformed closing tags: </mxCell/> -> </mxCell>
  const closeTagFixed = xml.replace(/<\/([A-Za-z][\w.-]*)\s*\/>/g, '</$1>');
  if (closeTagFixed !== xml) {
    warnings.push('Repaired malformed closing tags.');
    xml = closeTagFixed;
  }

  // Escape stray ampersands.
  const escaped = xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
  if (escaped !== xml) {
    warnings.push('Escaped unescaped ampersands.');
    xml = escaped;
  }

  // Repair empty/missing ids.
  let counter = 1000;

  const emptyIdFixed = xml.replace(/id=""/g, () => `id="${counter++}"`);
  if (emptyIdFixed !== xml) {
    warnings.push('Assigned ids to cells with empty id attributes.');
    xml = emptyIdFixed;
  }

  const missingIdFixed = xml.replace(/<mxCell(?![^>]*\bid=)/g, () => `<mxCell id="${counter++}"`);
  if (missingIdFixed !== xml) {
    warnings.push('Assigned ids to mxCell elements with missing id attributes.');
    xml = missingIdFixed;
  }

  const emptyParentFixed = xml.replace(/parent=""/g, 'parent="1"');
  if (emptyParentFixed !== xml) {
    warnings.push('Repaired empty parent attributes.');
    xml = emptyParentFixed;
  }

  // Rebuild the root using only valid mxCell blocks. This removes orphan
  // mxGeometry/mxPoint nodes that cause diagrams.net "Could not add object"
  // console errors.
  const openingModel = xml.match(/<mxGraphModel\b[^>]*>/)?.[0] ?? '<mxGraphModel>';
  const rootMatch = xml.match(/<root\b[^>]*>([\s\S]*?)<\/root>/);

  if (!rootMatch) {
    warnings.push('Missing Draw.io root element.');
    return { xml, warnings, valid: false };
  }

  const cells = renumberNonRootCells(extractCells(rootMatch[1]), warnings);
  const validCells: string[] = [];
  const seen = new Set<string>();

  for (const cell of cells) {
    const id = getAttr(getOpeningTag(cell), 'id');

    if (!id || seen.has(id)) {
      warnings.push(`Dropped invalid or duplicate mxCell${id ? ` id=${id}` : ''}.`);
      continue;
    }

    if (!isValidCell(cell)) {
      warnings.push(`Dropped structurally invalid mxCell id=${id}.`);
      continue;
    }

    seen.add(id);
    validCells.push(cell);
  }

  const root0 = validCells.find((cell) => getAttr(getOpeningTag(cell), 'id') === '0') ?? '<mxCell id="0"/>';
  const root1 =
    validCells.find((cell) => getAttr(getOpeningTag(cell), 'id') === '1') ??
    '<mxCell id="1" parent="0"/>';

  const otherCells = validCells.filter((cell) => !isRootCell(cell));

  xml = `${openingModel}<root>${root0}${root1}${otherCells.join('')}</root></mxGraphModel>`;

  const valid = isValidDrawioXml(xml);

  if (!valid) {
    warnings.push('The repaired XML is still not a valid Draw.io mxGraphModel document.');
  }

  return { xml, warnings, valid };
}

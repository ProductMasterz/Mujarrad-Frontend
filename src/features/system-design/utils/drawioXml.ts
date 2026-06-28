/**
 * Draw.io XML extraction, sanitization, validation and repair.
 *
 * Task 5 requires that AI-generated diagram XML is never loaded into the
 * Draw.io embed unless it has been extracted from any surrounding text,
 * sanitized, repaired where possible, and structurally validated.
 */

export interface DrawioXmlResult {
  xml: string;
  warnings: string[];
  valid: boolean;
}

/**
 * Structural validation: the value must contain an mxGraphModel with a root
 * node. This is intentionally lightweight — Draw.io itself is the final parser,
 * but we must guarantee the basic shape before loading.
 */
export function isValidDrawioXml(xml: string): boolean {
  if (!xml || typeof xml !== 'string') {
    return false;
  }

  const hasModel = /<mxGraphModel[\s\S]*<\/mxGraphModel>/.test(xml);
  const hasRoot = /<root[\s>]/.test(xml) && /<\/root>/.test(xml);

  // Reject documents that still contain malformed closing tags like </mxCell/>,
  // which break Draw.io's XML parser ("expected '>'").
  const hasMalformedCloseTag = /<\/[A-Za-z][\w.-]*\s*\/>/.test(xml);

  return hasModel && hasRoot && !hasMalformedCloseTag;
}

/**
 * Extract the diagram XML from a raw AI response and repair the common defects
 * that break the Draw.io embed loader. Returns the cleaned XML plus a list of
 * warnings describing every repair that was applied.
 */
export function extractAndRepairDrawioXml(rawInput: string): DrawioXmlResult {
  const warnings: string[] = [];

  if (!rawInput || typeof rawInput !== 'string') {
    return { xml: '', warnings: ['AI returned an empty diagram response.'], valid: false };
  }

  let xml = rawInput.trim();

  // Strip markdown code fences (```xml ... ``` or ``` ... ```).
  const fenced = xml.replace(/^```xml\s*\n?/i, '').replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
  if (fenced !== xml) {
    warnings.push('Removed markdown code fences from the AI response.');
    xml = fenced.trim();
  }

  // Extract only the mxGraphModel block if surrounded by explanation text.
  const match = xml.match(/<mxGraphModel[\s\S]*<\/mxGraphModel>/);
  if (match) {
    if (match[0] !== xml) {
      warnings.push('Extracted the mxGraphModel block from surrounding text.');
    }
    xml = match[0];
  }

  // Repair malformed closing tags such as </mxCell/> -> </mxCell>. Models
  // occasionally emit a stray slash before the '>' on closing tags, which makes
  // the document fail to parse ("expected '>'").
  const closeTagFixed = xml.replace(/<\/([A-Za-z][\w.-]*)\s*\/>/g, '</$1>');
  if (closeTagFixed !== xml) {
    warnings.push('Repaired malformed closing tags (e.g. </mxCell/>).');
    xml = closeTagFixed;
  }

  // Escape stray ampersands that are not part of an existing entity.
  const escaped = xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g, '&amp;');
  if (escaped !== xml) {
    warnings.push('Escaped unescaped & characters in the XML.');
    xml = escaped;
  }

  // Repair empty/missing ids on cells so Draw.io does not drop them.
  let counter = 100;
  const emptyIdFixed = xml.replace(/id=""/g, () => `id="${counter++}"`);
  if (emptyIdFixed !== xml) {
    warnings.push('Assigned ids to cells that had an empty id attribute.');
    xml = emptyIdFixed;
  }

  const missingIdFixed = xml.replace(/<mxCell(?![^>]*\bid=)/g, () => `<mxCell id="${counter++}"`);
  if (missingIdFixed !== xml) {
    warnings.push('Assigned ids to mxCell elements that had no id attribute.');
    xml = missingIdFixed;
  }

  // Repair empty parent attributes so cells attach to the default layer.
  const parentFixed = xml.replace(/parent=""/g, 'parent="1"');
  if (parentFixed !== xml) {
    warnings.push('Repaired empty parent attributes.');
    xml = parentFixed;
  }

  const valid = isValidDrawioXml(xml);

  if (!valid) {
    warnings.push('The repaired XML is still not a valid Draw.io mxGraphModel document.');
  }

  return { xml, warnings, valid };
}

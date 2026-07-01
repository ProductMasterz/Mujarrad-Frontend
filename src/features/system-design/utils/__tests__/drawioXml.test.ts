import { describe, expect, it } from '@jest/globals';

import { extractAndRepairDrawioXml, isValidDrawioXml } from '../drawioXml';

const VALID_XML =
  '<mxGraphModel><root><mxCell id="0" /><mxCell id="1" parent="0" /></root></mxGraphModel>';

describe('isValidDrawioXml', () => {
  it('returns false for empty, null, or non-string input', () => {
    expect(isValidDrawioXml('')).toBe(false);
    expect(isValidDrawioXml(null as unknown as string)).toBe(false);
    expect(isValidDrawioXml(undefined as unknown as string)).toBe(false);
  });

  it('returns true for a well-formed mxGraphModel document', () => {
    expect(isValidDrawioXml(VALID_XML)).toBe(true);
  });

  it('returns false when the mxGraphModel wrapper is missing', () => {
    expect(isValidDrawioXml('<root><mxCell id="0" /></root>')).toBe(false);
  });

  it('returns false when the root node is missing', () => {
    expect(isValidDrawioXml('<mxGraphModel></mxGraphModel>')).toBe(false);
  });

  it('returns false when malformed closing tags like </mxCell/> are present', () => {
    const malformed = '<mxGraphModel><root><mxCell id="0"></mxCell/></root></mxGraphModel>';
    expect(isValidDrawioXml(malformed)).toBe(false);
  });
});

describe('extractAndRepairDrawioXml', () => {
  it('returns invalid with a warning for empty input', () => {
    const result = extractAndRepairDrawioXml('');

    expect(result.valid).toBe(false);
    expect(result.xml).toBe('');
    expect(result.warnings).toContain('AI returned an empty diagram response.');
  });

  it('returns the xml unchanged and valid when already well-formed', () => {
    const result = extractAndRepairDrawioXml(VALID_XML);

    expect(result.valid).toBe(true);
    expect(result.xml).toBe(VALID_XML);
    expect(result.warnings).toEqual([]);
  });

  it('strips markdown code fences around the XML', () => {
    const fenced = '```xml\n' + VALID_XML + '\n```';
    const result = extractAndRepairDrawioXml(fenced);

    expect(result.valid).toBe(true);
    expect(result.xml).toBe(VALID_XML);
    expect(result.warnings).toContain('Removed markdown code fences from the AI response.');
  });

  it('extracts the mxGraphModel block from surrounding explanation text', () => {
    const withPreamble = `Here is the diagram:\n\n${VALID_XML}\n\nLet me know if you need changes.`;
    const result = extractAndRepairDrawioXml(withPreamble);

    expect(result.valid).toBe(true);
    expect(result.xml).toBe(VALID_XML);
    expect(result.warnings).toContain('Extracted the mxGraphModel block from surrounding text.');
  });

  it('repairs malformed closing tags such as </mxCell/>', () => {
    const malformed = '<mxGraphModel><root><mxCell id="0"></mxCell/></root></mxGraphModel>';
    const result = extractAndRepairDrawioXml(malformed);

    expect(result.xml).not.toContain('</mxCell/>');
    expect(result.warnings).toContain('Repaired malformed closing tags (e.g. </mxCell/>).');
  });

  it('escapes stray ampersands that are not already part of an entity', () => {
    const withAmpersand =
      '<mxGraphModel><root><mxCell id="0" value="Sales & Marketing" /></root></mxGraphModel>';
    const result = extractAndRepairDrawioXml(withAmpersand);

    expect(result.xml).toContain('Sales &amp; Marketing');
    expect(result.warnings).toContain('Escaped unescaped & characters in the XML.');
  });

  it('does not double-escape ampersands that are already valid entities', () => {
    const alreadyEscaped =
      '<mxGraphModel><root><mxCell id="0" value="Sales &amp; Marketing" /></root></mxGraphModel>';
    const result = extractAndRepairDrawioXml(alreadyEscaped);

    expect(result.xml).toContain('Sales &amp; Marketing');
    expect(result.xml).not.toContain('&amp;amp;');
    expect(result.warnings).not.toContain('Escaped unescaped & characters in the XML.');
  });

  it('assigns ids to cells with an empty id attribute', () => {
    const emptyId = '<mxGraphModel><root><mxCell id="" /></root></mxGraphModel>';
    const result = extractAndRepairDrawioXml(emptyId);

    expect(result.xml).not.toContain('id=""');
    expect(result.warnings).toContain('Assigned ids to cells that had an empty id attribute.');
  });

  it('assigns ids to mxCell elements that have no id attribute at all', () => {
    const missingId = '<mxGraphModel><root><mxCell /></root></mxGraphModel>';
    const result = extractAndRepairDrawioXml(missingId);

    expect(result.xml).toMatch(/<mxCell id="\d+"/);
    expect(result.warnings).toContain('Assigned ids to mxCell elements that had no id attribute.');
  });

  it('repairs empty parent attributes to point at the default layer', () => {
    const emptyParent = '<mxGraphModel><root><mxCell id="2" parent="" /></root></mxGraphModel>';
    const result = extractAndRepairDrawioXml(emptyParent);

    expect(result.xml).toContain('parent="1"');
    expect(result.warnings).toContain('Repaired empty parent attributes.');
  });

  it('flags the result as still invalid when repairs are not enough', () => {
    const beyondRepair = 'not xml at all, just plain text';
    const result = extractAndRepairDrawioXml(beyondRepair);

    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      'The repaired XML is still not a valid Draw.io mxGraphModel document.',
    );
  });
});

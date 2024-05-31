/**
 * SSML (Speech Synthesis Markup Language) is a subset of XML specifically
 * designed for controlling synthesis. You can see examples of how the SSML
 * should be parsed in `ssml.test.ts`.
 *
 * DO NOT USE CHATGPT, COPILOT, OR ANY AI CODING ASSISTANTS.
 * Conventional auto-complete and Intellisense are allowed.
 *
 * DO NOT USE ANY PRE-EXISTING XML PARSERS FOR THIS TASK.
 * You may use online references to understand the SSML specification, but DO NOT read
 * online references for implementing an XML/SSML parser.
 */

/** Parses SSML to a SSMLNode, throwing on invalid SSML */
export function parseSSML(ssml: string): SSMLNode {
  ssml = ssml.trim();

  if (!ssml.startsWith('<speak') || !ssml.endsWith('</speak>')) {
    throw new Error('Invalid SSML: Missing or incorrect <speak> tags');
  }

  const parseAttributes = (attrString: string): SSMLAttribute[] => {
    const attributes: SSMLAttribute[] = [];
    const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
      attributes.push({ name: match[1], value: match[2] });
    }
    return attributes;
  };

  const parseTag = (str: string): { tag: SSMLTag, rest: string } | null => {
    const tagMatch = str.match(/^<(\w+)([^>]*)>/);
    if (!tagMatch) return null;
    const [fullMatch, name, attrString] = tagMatch;
    return { tag: { name, attributes: parseAttributes(attrString), children: [] }, rest: str.slice(fullMatch.length) };
  };

  const parseNode = (str: string): SSMLNode => {
    const stack: SSMLTag[] = [];
    let root: SSMLTag | null = null;
    let current: SSMLTag | null = null;
    let lastIndex = 0;

    const tagRegex = /<\/?(\w+)([^>]*)>/g;
    let match;
    while ((match = tagRegex.exec(str)) !== null) {
      const [fullMatch, tagName, attrString] = match;
      const isClosingTag = fullMatch.startsWith('</');
      const tagStart = match.index;
      const tagEnd = tagRegex.lastIndex;

      if (!isClosingTag) {
        const tag: SSMLTag = {
          name: tagName,
          attributes: parseAttributes(attrString),
          children: [],
        };

        if (!root) {
          if (tagName !== 'speak') {
            throw new Error('Invalid SSML: Root tag must be <speak>');
          }
          root = tag;
        }

        if (current) {
          current.children.push(tag);
        }

        stack.push(tag);
        current = tag;
      } else {
        const textContent = str.slice(lastIndex, tagStart).trim();
        if (textContent) {
          current!.children.push(unescapeXMLChars(textContent));
        }
        if (stack.length === 0 || stack[stack.length - 1].name !== tagName) {
          throw new Error(`Invalid SSML: Mismatched closing tag </${tagName}>`);
        }
        stack.pop();
        current = stack[stack.length - 1] || null;
      }
      lastIndex = tagEnd;
    }

    if (stack.length > 0) {
      throw new Error('Invalid SSML: Unmatched opening tag');
    }

    return root!;
  };

  return parseNode(ssml);
}

export function ssmlNodeToText(node: SSMLNode): string {
  if (typeof node === 'string') {
    return unescapeXMLChars(node);
  }

  return node.children.map(ssmlNodeToText).join('');
}

// Already done for you
const unescapeXMLChars = (text: string) =>
  text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');



type SSMLNode = SSMLTag | SSMLText
type SSMLTag = {
  name: string
  attributes: SSMLAttribute[]
  children: SSMLNode[]
}
type SSMLText = string
type SSMLAttribute = { name: string; value: string }

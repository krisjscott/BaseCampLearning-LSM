const ALLOWED_TAGS = new Set([
  "P", "BR", "STRONG", "EM", "B", "I", "U", "UL", "OL", "LI", "A", "IMG",
  "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "CODE", "PRE", "SPAN",
  "DIV", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "HR",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(["href", "title", "target", "rel"]),
  IMG: new Set(["src", "alt", "title", "width", "height"]),
};

const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);
const IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

function isSafeUrl(value: string, protocols: Set<string>): boolean {
  // Browsers strip ASCII tab/newline/CR from a URL before evaluating its scheme, so a
  // denylist keyed on startsWith("javascript:") can be bypassed with "java\tscript:" -
  // strip those control characters first so we evaluate what the browser will actually see.
  const cleaned = value.replace(/[\t\n\r]/g, "").trim();
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleaned)) {
    // No scheme - a same-document/relative URL, which is safe.
    return true;
  }
  try {
    return protocols.has(new URL(cleaned, "https://basecamp.invalid").protocol);
  } catch {
    return false;
  }
}

/**
 * Minimal allowlist-based HTML sanitizer for admin-authored lesson reading
 * content. Admin authoring is already role-gated server-side, but this keeps
 * a defense-in-depth layer against stray script tags / event handlers before
 * the markup is rendered into the learner's page via innerHTML.
 */
export function sanitizeLessonHtml(html: string): string {
  if (typeof window === "undefined" || !html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Iterative queue, not a per-child recursive walk: when a disallowed tag is unwrapped
  // (replaced by its own children), those promoted children must be re-queued and scanned
  // too - a single top-down pass that unwraps-and-moves-on lets an attacker smuggle a
  // dangerous attribute past the filter by nesting it inside any disallowed wrapper tag.
  const queue: Element[] = Array.from(doc.body.children);

  while (queue.length > 0) {
    const child = queue.shift()!;

    if (!ALLOWED_TAGS.has(child.tagName)) {
      const promoted = Array.from(child.childNodes);
      child.replaceWith(...promoted);
      promoted.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) queue.push(n as Element);
      });
      continue;
    }

    Array.from(child.attributes).forEach((attr) => {
      const allowed = ALLOWED_ATTRS[child.tagName];
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || !allowed?.has(name)) {
        child.removeAttribute(attr.name);
        return;
      }
      if (name === "href" && !isSafeUrl(attr.value, LINK_PROTOCOLS)) {
        child.removeAttribute(attr.name);
      }
      if (name === "src" && !isSafeUrl(attr.value, IMAGE_PROTOCOLS)) {
        child.removeAttribute(attr.name);
      }
    });

    if (child.tagName === "A") {
      child.setAttribute("rel", "noopener noreferrer");
    }

    Array.from(child.children).forEach((c) => queue.push(c));
  }

  return doc.body.innerHTML;
}

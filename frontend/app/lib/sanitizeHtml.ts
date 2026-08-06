const ALLOWED_TAGS = new Set([
  "P", "BR", "STRONG", "EM", "B", "I", "U", "UL", "OL", "LI", "A", "IMG",
  "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "CODE", "PRE", "SPAN",
  "DIV", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "HR",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(["href", "title", "target", "rel"]),
  IMG: new Set(["src", "alt", "title", "width", "height"]),
};

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return !trimmed.startsWith("javascript:") && !trimmed.startsWith("data:text/html");
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

  function clean(node: Element) {
    Array.from(node.children).forEach((child) => {
      if (!ALLOWED_TAGS.has(child.tagName)) {
        child.replaceWith(...Array.from(child.childNodes));
        return;
      }

      Array.from(child.attributes).forEach((attr) => {
        const allowed = ALLOWED_ATTRS[child.tagName];
        const name = attr.name.toLowerCase();
        if (name.startsWith("on") || !allowed?.has(name)) {
          child.removeAttribute(attr.name);
          return;
        }
        if ((name === "href" || name === "src") && !isSafeUrl(attr.value)) {
          child.removeAttribute(attr.name);
        }
      });

      if (child.tagName === "A") {
        child.setAttribute("rel", "noopener noreferrer");
      }

      clean(child);
    });
  }

  clean(doc.body);
  return doc.body.innerHTML;
}

"use client";

import { ArrowLeft, ChevronDown, ChevronUp, Eye, QrCode, Save, Trash2, Type, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import AdminGuard from "../components/AdminGuard";
import AdminSidebar from "../components/AdminSidebar";
import { useToast } from "../components/Toast";
import { getAuthSession, getCurrentUser, UserResponse } from "../lib/backendApi";
import {
  CERTIFICATE_VARIABLES,
  CertificateTemplateElement,
  CertificateTemplateResponse,
  deleteCertificateTemplate,
  getCertificateTemplate,
  previewCertificateTemplate,
  saveCertificateTemplateLayout,
  uploadCertificateTemplate,
} from "../lib/adminApi";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const RENDER_WIDTH = 760;
const MIN_SIZE = 12;

// Elements need a React key that survives a save - the backend deletes and
// reinserts every element on save, so server `id`s change on every save and
// can't be used as a stable key (that would remount every element's DOM node,
// dropping focus/selection). `_key` is generated once client-side and never
// sent to the backend.
type EditorElement = CertificateTemplateElement & { _key: string };

function makeKey(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `k${Date.now()}${Math.random()}`;
}

function withKeys(elements: CertificateTemplateElement[]): EditorElement[] {
  return elements.map((element) => ({ ...element, _key: makeKey() }));
}

function stripKeys(elements: EditorElement[]): CertificateTemplateElement[] {
  return elements.map(({ _key, ...rest }) => rest);
}

/** Keeps `orderIndex` in sync with array position after any add/delete/reorder. */
function reindexed(elements: EditorElement[]): EditorElement[] {
  return elements.map((element, index) => ({ ...element, orderIndex: index }));
}

// Successive adds are offset so new elements never spawn exactly on top of an
// existing one - otherwise they'd be indistinguishable and unselectable on the canvas.
const SPAWN_STEP = 24;

function newTextElement(order: number): EditorElement {
  const offset = (order % 8) * SPAWN_STEP;
  return {
    _key: makeKey(),
    elementType: "TEXT",
    content: "{{recipient_name}}",
    x: 80 + offset,
    y: 80 + offset,
    width: 300,
    height: 40,
    fontFamily: "Helvetica",
    fontSize: 20,
    fontColor: "#111111",
    bold: false,
    textAlign: "CENTER",
    orderIndex: order,
  };
}

function newQrElement(order: number): EditorElement {
  const offset = (order % 8) * SPAWN_STEP;
  return {
    _key: makeKey(),
    elementType: "QR",
    x: 80 + offset,
    y: 140 + offset,
    width: 100,
    height: 100,
    orderIndex: order,
  };
}

function elementLabel(element: CertificateTemplateElement, index: number): string {
  if (element.elementType === "QR") return `QR code ${index + 1}`;
  const content = (element.content || "").trim();
  if (!content) return `Text field ${index + 1}`;
  return content.length > 28 ? `${content.slice(0, 28)}...` : content;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

type DragMode = "move" | "resize";
type DragState = { index: number; mode: DragMode; startMouseX: number; startMouseY: number; startX: number; startY: number; startWidth: number; startHeight: number };

function CertificateTemplateContent() {
  const toast = useToast();
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [template, setTemplate] = useState<CertificateTemplateResponse | null>(null);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const savedSnapshotRef = useRef<string>("[]");

  const session = getAuthSession();
  const role = session?.role || "";

  const isDirty = template ? JSON.stringify(stripKeys(elements)) !== savedSnapshotRef.current : false;

  useEffect(() => {
    getCurrentUser().then(setAdmin).catch(() => undefined);
    const params = new URLSearchParams(window.location.search);
    setCourseId(params.get("courseId"));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getCertificateTemplate(courseId)
      .then((result) => {
        setTemplate(result);
        const keyed = withKeys(result?.elements || []);
        setElements(keyed);
        savedSnapshotRef.current = JSON.stringify(stripKeys(keyed));
        setSelected(null);
        setPdfError(false);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  // Warn on a hard navigation (refresh/close/typed URL) with unsaved changes -
  // client-side route changes (e.g. the "Back to courses" link) are handled
  // separately below since beforeunload doesn't fire for those.
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  async function handleUpload(file: File) {
    if (!courseId) return;
    setUploading(true);
    try {
      const result = await uploadCertificateTemplate(courseId, file);
      setTemplate(result);
      const keyed = withKeys(result?.elements || []);
      setElements(keyed);
      savedSnapshotRef.current = JSON.stringify(stripKeys(keyed));
      setSelected(null);
      setPdfError(false);
      toast.success("Certificate template uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload the template.");
    } finally {
      setUploading(false);
    }
  }

  function handleReplaceFile(file: File) {
    if (elements.length > 0) {
      const confirmed = window.confirm(
        "Replacing the PDF keeps your existing text/QR placements, but they were positioned for the old page - " +
          "you may need to re-check them against the new page size. Continue?",
      );
      if (!confirmed) return;
    }
    handleUpload(file);
  }

  async function handleSave() {
    if (!template) return;
    setSaving(true);
    try {
      const payload = stripKeys(elements);
      const result = await saveCertificateTemplateLayout(template.id, payload);
      if (result) {
        setTemplate(result);
        // Update server ids by position (the backend returns elements in the same
        // order it was sent) without regenerating local keys, so selection and
        // DOM identity survive a save instead of every element remounting.
        setElements((prev) => prev.map((element, index) => ({ ...element, id: result.elements[index]?.id })));
        savedSnapshotRef.current = JSON.stringify(stripKeys(withKeys(payload)));
      }
      toast.success("Layout saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the layout.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    if (!template) return;
    setPreviewing(true);
    // Open the tab synchronously, inside the click's user-gesture context - opening it only
    // after the fetch below resolves gets silently blocked by the browser's popup blocker,
    // since window.open() after an await no longer counts as user-initiated.
    const previewTab = window.open("", "_blank");
    try {
      const blob = await previewCertificateTemplate(template.id);
      const url = URL.createObjectURL(blob);
      if (previewTab) previewTab.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      previewTab?.close();
      toast.error(err instanceof Error ? err.message : "Could not render a preview.");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleDeleteTemplate() {
    if (!template) return;
    if (!window.confirm("Delete this certificate template? Admins will need to re-upload a PDF and rebuild the layout.")) return;
    try {
      await deleteCertificateTemplate(template.id);
      setTemplate(null);
      setElements([]);
      savedSnapshotRef.current = "[]";
      setSelected(null);
      toast.success("Certificate template deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the template.");
    }
  }

  function addElement(kind: "TEXT" | "QR") {
    setElements((prev) => {
      const element = kind === "TEXT" ? newTextElement(prev.length) : newQrElement(prev.length);
      setSelected(prev.length);
      return [...prev, element];
    });
  }

  function updateSelected(patch: Partial<CertificateTemplateElement>) {
    if (selected === null) return;
    setElements((prev) => prev.map((element, index) => (index === selected ? { ...element, ...patch } : element)));
  }

  function deleteElementAt(index: number) {
    setElements((prev) => reindexed(prev.filter((_, i) => i !== index)));
    setSelected((prevSelected) => {
      if (prevSelected === null) return null;
      if (prevSelected === index) return null;
      return prevSelected > index ? prevSelected - 1 : prevSelected;
    });
  }

  function moveElement(index: number, direction: -1 | 1) {
    setElements((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return reindexed(next);
    });
    setSelected((prevSelected) => {
      if (prevSelected === index) return index + direction;
      if (prevSelected === index + direction) return index;
      return prevSelected;
    });
  }

  const scale = template ? RENDER_WIDTH / template.pageWidth : 1;

  const handlePointerDown = useCallback(
    (index: number, mode: DragMode) => (event: React.MouseEvent) => {
      event.stopPropagation();
      const element = elements[index];
      setSelected(index);
      dragRef.current = {
        index,
        mode,
        startMouseX: event.clientX,
        startMouseY: event.clientY,
        startX: element.x,
        startY: element.y,
        startWidth: element.width,
        startHeight: element.height,
      };
    },
    [elements],
  );

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      const drag = dragRef.current;
      if (!drag || !template) return;
      const dx = (event.clientX - drag.startMouseX) / scale;
      const dy = (event.clientY - drag.startMouseY) / scale;

      setElements((prev) =>
        prev.map((element, index) => {
          if (index !== drag.index) return element;
          if (drag.mode === "move") {
            const maxX = Math.max(0, template.pageWidth - element.width);
            const maxY = Math.max(0, template.pageHeight - element.height);
            return {
              ...element,
              x: Math.min(Math.max(0, drag.startX + dx), maxX),
              y: Math.min(Math.max(0, drag.startY + dy), maxY),
            };
          }

          const maxWidth = Math.max(MIN_SIZE, template.pageWidth - element.x);
          const maxHeight = Math.max(MIN_SIZE, template.pageHeight - element.y);

          if (element.elementType === "QR") {
            // QR codes look distorted stretched - keep resizing square, and
            // clamp to whichever dimension has less room on the page.
            const size = Math.min(
              Math.max(MIN_SIZE, drag.startWidth + Math.max(dx, dy)),
              maxWidth,
              maxHeight,
            );
            return { ...element, width: size, height: size };
          }

          return {
            ...element,
            width: Math.min(Math.max(MIN_SIZE, drag.startWidth + dx), maxWidth),
            height: Math.min(Math.max(MIN_SIZE, drag.startHeight + dy), maxHeight),
          };
        }),
      );
    }

    function onMouseUp() {
      dragRef.current = null;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [scale, template]);

  // Keyboard shortcuts: Escape deselects; Delete/Backspace removes the selected
  // element; arrow keys nudge it (Shift for a bigger step). All disabled while
  // focus is in a form field so typing/editing isn't hijacked.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected(null);
        return;
      }
      if (selected === null || isEditableTarget(event.target)) return;
      const element = elements[selected];
      if (!element || !template) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteElementAt(selected);
        return;
      }

      const step = event.shiftKey ? 10 : 1;
      const maxX = Math.max(0, template.pageWidth - element.width);
      const maxY = Math.max(0, template.pageHeight - element.height);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        updateSelected({ x: Math.max(0, element.x - step) });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        updateSelected({ x: Math.min(maxX, element.x + step) });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        updateSelected({ y: Math.max(0, element.y - step) });
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        updateSelected({ y: Math.min(maxY, element.y + step) });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, elements, template]);

  function confirmLeave(event: React.MouseEvent) {
    if (isDirty && !window.confirm("You have unsaved layout changes. Leave without saving?")) {
      event.preventDefault();
    }
  }

  if (!courseId) {
    return (
      <section className="admin-main">
        <p className="admin-empty">No course selected. Open this page from a course&apos;s certificate action.</p>
      </section>
    );
  }

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/courses" role={role} admin={admin} />
      <section className="admin-main cert-editor-page">
        <div className="admin-panel-heading">
          <div>
            <Link href="/courses" aria-label="Back to courses" onClick={confirmLeave}>
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>
            <h2>Certificate template</h2>
          </div>
        </div>

        {loading ? (
          <p className="admin-empty">Loading...</p>
        ) : !template ? (
          <div className="cert-upload-dropzone">
            <Upload size={28} strokeWidth={1.5} />
            <p>Upload a PDF certificate template for this course to get started.</p>
            <label className="admin-primary-btn">
              <span>{uploading ? "Uploading..." : "Choose PDF"}</span>
              <input
                type="file"
                accept="application/pdf"
                hidden
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleUpload(file);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        ) : (
          <div className="cert-editor-shell">
            <div className="cert-editor-main">
              <div className="cert-editor-toolbar">
                <div className="cert-toolbar-group">
                  <button type="button" className="cert-toolbar-btn" onClick={() => addElement("TEXT")}>
                    <Type size={14} strokeWidth={1.8} /> Add text field
                  </button>
                  <button type="button" className="cert-toolbar-btn" onClick={() => addElement("QR")}>
                    <QrCode size={14} strokeWidth={1.8} /> Add QR code
                  </button>
                </div>

                <div className="cert-toolbar-divider" />

                <div className="cert-toolbar-group">
                  <button type="button" className="cert-toolbar-btn" onClick={handlePreview} disabled={previewing}>
                    <Eye size={14} strokeWidth={1.8} /> {previewing ? "Rendering..." : "Preview"}
                  </button>
                  <label className="cert-toolbar-btn">
                    <Upload size={14} strokeWidth={1.8} />
                    <span>Replace PDF</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handleReplaceFile(file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="cert-toolbar-spacer" />

                <button
                  type="button"
                  className="cert-toolbar-btn primary"
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                >
                  <Save size={14} strokeWidth={1.8} /> {saving ? "Saving..." : isDirty ? "Save layout*" : "Saved"}
                </button>
                <button type="button" className="cert-toolbar-btn danger" onClick={handleDeleteTemplate} aria-label="Delete template">
                  <Trash2 size={15} strokeWidth={1.8} />
                </button>
              </div>

              <div className="cert-editor-canvas-scroll">
                <div className="cert-editor-canvas-header">
                  <span>Template preview</span>
                  <span className="cert-editor-canvas-dims">
                    {Math.round(template.pageWidth)} × {Math.round(template.pageHeight)} pt
                  </span>
                </div>
                <div
                  className="cert-editor-canvas-wrap"
                  ref={canvasRef}
                  style={{ width: RENDER_WIDTH, height: template.pageHeight * scale }}
                >
                  {/* Deselect handler lives on this layer only, separate from the element
                      overlays below - a click on the rendered PDF canvas (or any empty space
                      within it) bubbles up through here and clears the selection, while a
                      click on a `.cert-element` sibling never reaches this layer at all. */}
                  <div className="cert-editor-pdf-layer" onClick={() => setSelected(null)}>
                    {pdfError ? (
                      <div className="cert-pdf-status cert-pdf-error">
                        Could not load the template PDF. Try uploading it again.
                      </div>
                    ) : (
                      <Document
                        file={template.originalPdfUrl}
                        loading={<div className="cert-pdf-status">Loading PDF...</div>}
                        error={<div className="cert-pdf-status cert-pdf-error">Could not load the template PDF.</div>}
                        onLoadError={() => setPdfError(true)}
                      >
                        <Page pageNumber={1} width={RENDER_WIDTH} renderTextLayer={false} renderAnnotationLayer={false} />
                      </Document>
                    )}
                  </div>

                  {elements.map((element, index) => (
                    <div
                      key={element._key}
                      className={`cert-element cert-element-${element.elementType.toLowerCase()} ${selected === index ? "is-selected" : ""}`}
                      style={{
                        left: element.x * scale,
                        top: element.y * scale,
                        width: element.width * scale,
                        height: element.height * scale,
                        justifyContent:
                          element.elementType === "TEXT"
                            ? { LEFT: "flex-start", CENTER: "center", RIGHT: "flex-end" }[element.textAlign || "LEFT"]
                            : "center",
                      }}
                      onMouseDown={handlePointerDown(index, "move")}
                    >
                      {element.elementType === "TEXT" ? (
                        <span
                          style={{
                            width: "100%",
                            fontSize: (element.fontSize || 16) * scale,
                            color: element.fontColor || "#111111",
                            fontWeight: element.bold ? 700 : 400,
                            textAlign: (element.textAlign || "LEFT").toLowerCase() as React.CSSProperties["textAlign"],
                          }}
                        >
                          {element.content || ""}
                        </span>
                      ) : (
                        <span className="cert-element-qr-label">QR</span>
                      )}
                      <div className="cert-element-resize-handle" onMouseDown={handlePointerDown(index, "resize")} />
                    </div>
                  ))}
                </div>
              </div>
              <p className="cert-editor-hint">
                Drag to move, drag the corner handle to resize. Arrow keys nudge the selected element, Delete removes it, Escape deselects.
              </p>
            </div>

            <aside className="cert-editor-panel">
              {elements.length > 0 && (
                <div className="cert-layers-list">
                  <h3>Elements ({elements.length})</h3>
                  {elements.map((element, index) => (
                    <div key={element._key} className={`cert-layer-row ${selected === index ? "is-selected" : ""}`}>
                      <button type="button" className="cert-layer-select" onClick={() => setSelected(index)}>
                        {element.elementType === "TEXT" ? (
                          <Type size={13} strokeWidth={1.8} />
                        ) : (
                          <QrCode size={13} strokeWidth={1.8} />
                        )}
                        <span>{elementLabel(element, index)}</span>
                      </button>
                      <div className="cert-layer-actions">
                        <button
                          type="button"
                          aria-label="Move up"
                          disabled={index === 0}
                          onClick={() => moveElement(index, -1)}
                        >
                          <ChevronUp size={13} strokeWidth={1.8} />
                        </button>
                        <button
                          type="button"
                          aria-label="Move down"
                          disabled={index === elements.length - 1}
                          onClick={() => moveElement(index, 1)}
                        >
                          <ChevronDown size={13} strokeWidth={1.8} />
                        </button>
                        <button type="button" aria-label="Delete element" onClick={() => deleteElementAt(index)}>
                          <X size={13} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selected === null ? (
                <p className="admin-empty">Select an element to edit it, or add a new one from the toolbar.</p>
              ) : (
                <ElementInspector
                  element={elements[selected]}
                  pageWidth={template.pageWidth}
                  pageHeight={template.pageHeight}
                  onChange={updateSelected}
                  onDelete={() => deleteElementAt(selected)}
                />
              )}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function ElementInspector({
  element,
  pageWidth,
  pageHeight,
  onChange,
  onDelete,
}: {
  element: CertificateTemplateElement;
  pageWidth: number;
  pageHeight: number;
  onChange: (patch: Partial<CertificateTemplateElement>) => void;
  onDelete: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertVariable(key: string) {
    const token = `{{${key}}}`;
    const current = element.content || "";
    const el = textareaRef.current;
    if (!el) {
      onChange({ content: current + token });
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + token + current.slice(end);
    onChange({ content: next });
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="cert-inspector">
      <h3>{element.elementType === "TEXT" ? "Text field" : "QR code"}</h3>

      {element.elementType === "TEXT" && (
        <>
          <p className="cert-inspector-section-label">Content</p>
          <label>
            <span>Text ({"{{variable}}"} tokens are replaced with live data)</span>
            <textarea
              ref={textareaRef}
              rows={2}
              value={element.content || ""}
              onChange={(event) => onChange({ content: event.target.value })}
            />
          </label>
          <div className="cert-variable-chips">
            {CERTIFICATE_VARIABLES.map((variable) => (
              <button type="button" key={variable.key} onClick={() => insertVariable(variable.key)}>
                {variable.label}
              </button>
            ))}
          </div>

          <p className="cert-inspector-section-label">Style</p>
          <div className="cert-inspector-grid cert-inspector-grid-top">
            <label>
              <span>Font size</span>
              <input
                type="number"
                min={4}
                max={200}
                value={element.fontSize || 16}
                onChange={(event) => onChange({ fontSize: Math.min(200, Math.max(4, Number(event.target.value) || 4)) })}
              />
            </label>
            <label>
              <span>Color</span>
              <input
                type="color"
                value={element.fontColor || "#111111"}
                onChange={(event) => onChange({ fontColor: event.target.value })}
              />
            </label>
            <label>
              <span>Alignment</span>
              <select
                value={element.textAlign || "LEFT"}
                onChange={(event) => onChange({ textAlign: event.target.value as CertificateTemplateElement["textAlign"] })}
              >
                <option value="LEFT">Left</option>
                <option value="CENTER">Center</option>
                <option value="RIGHT">Right</option>
              </select>
            </label>
          </div>
          <label className="cert-inline-checkbox">
            <input
              type="checkbox"
              checked={!!element.bold}
              onChange={(event) => onChange({ bold: event.target.checked })}
            />
            <span>Bold</span>
          </label>
        </>
      )}

      {element.elementType === "QR" && (
        <p className="cert-hint">
          Encodes a link to the public verification page, generated fresh for every certificate at download time.
          Resizing keeps it square so the code doesn&apos;t distort.
        </p>
      )}

      <p className="cert-inspector-section-label cert-inspector-section-label-bordered">Position &amp; size (pt)</p>
      <div className="cert-inspector-grid">
        <label>
          <span>X</span>
          <input
            type="number"
            min={0}
            max={Math.max(0, Math.round(pageWidth - element.width))}
            value={Math.round(element.x)}
            onChange={(event) => onChange({ x: Math.max(0, Number(event.target.value) || 0) })}
          />
        </label>
        <label>
          <span>Y</span>
          <input
            type="number"
            min={0}
            max={Math.max(0, Math.round(pageHeight - element.height))}
            value={Math.round(element.y)}
            onChange={(event) => onChange({ y: Math.max(0, Number(event.target.value) || 0) })}
          />
        </label>
        <label>
          <span>Width</span>
          <input
            type="number"
            min={MIN_SIZE}
            value={Math.round(element.width)}
            onChange={(event) => onChange({ width: Math.max(MIN_SIZE, Number(event.target.value) || MIN_SIZE) })}
          />
        </label>
        <label>
          <span>Height</span>
          <input
            type="number"
            min={MIN_SIZE}
            value={Math.round(element.height)}
            onChange={(event) => onChange({ height: Math.max(MIN_SIZE, Number(event.target.value) || MIN_SIZE) })}
          />
        </label>
      </div>

      <button type="button" className="admin-icon-danger cert-delete-element" onClick={onDelete}>
        <Trash2 size={14} strokeWidth={1.8} /> Delete element
      </button>
    </div>
  );
}

export default function CertificateTemplatePage() {
  return (
    <AdminGuard>
      <CertificateTemplateContent />
    </AdminGuard>
  );
}

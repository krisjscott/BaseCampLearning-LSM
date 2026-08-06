export type TranscriptCue = {
  start: number;
  end: number;
  text: string;
};

function timeToSeconds(value: string): number {
  const parts = value.trim().split(":").map(Number);
  if (parts.some((part) => Number.isNaN(part))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

/**
 * Parses WebVTT cue text into a transcript - this is what "transcript
 * generated from the subtitle file" means here: no speech-to-text, just
 * reformatting the timed captions the admin already uploaded.
 */
export function parseVtt(content: string): TranscriptCue[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const cues: TranscriptCue[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/(\d{2}:)?\d{2}:\d{2}[.,]\d{3}\s*-->\s*(\d{2}:)?\d{2}:\d{2}[.,]\d{3}/);
    if (match) {
      const [startRaw, endRaw] = line.split("-->").map((part) => part.trim().split(" ")[0].replace(",", "."));
      const start = timeToSeconds(startRaw);
      const end = timeToSeconds(endRaw);
      i += 1;
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i].trim());
        i += 1;
      }
      const text = textLines.join(" ").replace(/<[^>]+>/g, "").trim();
      if (text) cues.push({ start, end, text });
    }
    i += 1;
  }

  return cues;
}

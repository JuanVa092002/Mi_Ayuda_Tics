/**
 * Subtítulos es-CO alineados a las ventanas de locución.
 * Se refinan con la duración real del audio tras el render de preview.
 */
import { voiceoverSegments } from './voiceover-es-CO';

export interface CaptionCueEsCO {
  id: string;
  fromFrame: number;
  toFrame: number;
  text: string;
  subtext?: string;
}

function splitCaption(text: string): { text: string; subtext?: string } {
  if (text.length <= 48) return { text };

  const period = text.indexOf('. ');
  if (period > 12 && period < text.length - 8) {
    return {
      text: text.slice(0, period + 1).trim(),
      subtext: text.slice(period + 2).trim(),
    };
  }

  const comma = text.indexOf(',');
  if (comma > 18 && comma < text.length - 12) {
    return {
      text: text.slice(0, comma + 1).trim(),
      subtext: text.slice(comma + 1).trim(),
    };
  }

  const words = text.split(' ');
  const mid = Math.ceil(words.length / 2);
  return {
    text: words.slice(0, mid).join(' '),
    subtext: words.slice(mid).join(' '),
  };
}

export const captionsEsCO: readonly CaptionCueEsCO[] = voiceoverSegments.map(
  (segment) => {
    const split = splitCaption(segment.text);
    return {
      id: segment.id,
      fromFrame: segment.startFrame,
      toFrame: segment.endFrame,
      text: split.text,
      subtext: split.subtext,
    };
  }
);

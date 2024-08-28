import { Fragment } from "react";
import clsx from "clsx";

/**
 * Text that rises in letter by letter. Re-keyed by its text, so it replays whenever the text changes.
 * Screen readers get the plain text once; the animated letters are hidden from them.
 */
export default function Reveal({ text, className, step = 24 }: { text: string; className?: string; step?: number }) {
  const words = text.split(" ");
  let n = 0;
  return (
    <span key={text} className={clsx("reveal", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={w}>
            <span className="reveal-word">
              {[...word].map((ch, c) => (
                <span key={c} className="reveal-char" style={{ animationDelay: `${n++ * step}ms` }}>
                  {ch}
                </span>
              ))}
            </span>
            {w < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </span>
  );
}

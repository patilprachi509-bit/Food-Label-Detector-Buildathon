import React from 'react';
import { InlineTerm } from './InlineTerm';
import { JARGON_DICTIONARY } from '../utils/jargon';

interface RichTextProps {
  text: string | React.ReactNode;
  isEn: boolean;
}

export const RichText: React.FC<RichTextProps> = ({ text, isEn }) => {
  if (typeof text !== 'string') {
    // If it's already a React Node or null, just pass it through unmodified.
    // This provides a fallback if RichText is accidentally wrapped around non-strings.
    return <>{text}</>;
  }

  // Combine all jargon regex sources into one large capturing group for split()
  const allPatterns = JARGON_DICTIONARY.map(d => d.pattern.source).join('|');
  const combinedRegex = new RegExp(`(${allPatterns})`, 'gi');

  // String.prototype.split with a capturing group puts the matched strings into the resulting array
  // interspersed with the non-matched text. This guarantees zero characters are lost, truncated, or reordered.
  const parts = text.split(combinedRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // Check if this specific part is one of our matched jargon terms
        const matchedEntry = JARGON_DICTIONARY.find(d => {
          return new RegExp(`^${d.pattern.source}$`, 'i').test(part);
        });

        if (matchedEntry) {
          return (
            <InlineTerm
              key={index}
              term={part} // Always render the exact substring that was in the text, preserving its casing
              explanationEn={matchedEntry.explanationEn}
              explanationHi={matchedEntry.explanationHi}
              isEn={isEn}
            />
          );
        }

        // Return the plain text for everything else
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};

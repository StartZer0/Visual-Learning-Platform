import React from 'react';
import { parseMathText } from '../../utils/helpers';
import Math from './Math';

const MathText = ({ children, className = '' }) => {
  if (!children) return null;
  
  const parts = parseMathText(children);
  
  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === 'math') {
          return (
            <Math key={index} block={part.block}>
              {part.content}
            </Math>
          );
        } else {
          // Handle line breaks in text
          const textLines = part.content.split('\n');
          return textLines.map((line, lineIndex) => (
            <React.Fragment key={`${index}-${lineIndex}`}>
              {line}
              {lineIndex < textLines.length - 1 && <br />}
            </React.Fragment>
          ));
        }
      })}
    </div>
  );
};

export default MathText;

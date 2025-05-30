import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

const Math = ({ children, block = false, className = '' }) => {
  try {
    if (block) {
      return (
        <div className={`my-4 ${className}`}>
          <BlockMath math={children} />
        </div>
      );
    } else {
      return (
        <span className={className}>
          <InlineMath math={children} />
        </span>
      );
    }
  } catch (error) {
    console.error('Math rendering error:', error);
    return (
      <span className={`text-red-600 dark:text-red-400 ${className}`}>
        [Math Error: {children}]
      </span>
    );
  }
};

export default Math;

import React from 'react';

interface FoundationProps {
  suits: string[];
}

const Foundation: React.FC<FoundationProps> = ({ suits }) => {
  return (
    <div className="flex justify-between gap-3 py-4">
      {suits.map((pile, index) => (
        <div key={ index } className="opacity-50 w-[12vw] h-[18vw] lg:w-[80px] lg:h-[120px] flex justify-center items-center bg-[#4b0000] border-red-900 border-8 lg:rounded-md rounded">
          <div className="text-red-900 text-[5vw] lg:text-[2rem]">{pile}</div>
        </div>
        
      ))}
    </div>
  );
};

export default Foundation;

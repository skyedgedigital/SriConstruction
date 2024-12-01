'use client';
import React, { useEffect } from 'react';

const UomTable = (props) => {
  const { workOrderNumber, workOrderUnits } = props;
  return (
    <div className='flex flex-col items-center justify-center'>
      List of Unit Of Measurement{`'s`} for {workOrderNumber}
      {workOrderUnits.length === 0 ? (
        <>No UOM Present</>
      ) : (
        <div className='flex'>
          {workOrderUnits.map((ele, index) => {
            return (
              <span key={index} className='text-blue-500 text-lg ml-1'>
                {ele}
                {index === workOrderUnits.length - 1 ? <></> : <>{','}</>}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UomTable;

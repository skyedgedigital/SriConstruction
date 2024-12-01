import React, { useState } from 'react';

const VehicleInformation = (props) => {
  const vehicle = props.vehicle;
  const key = props.key;
  const [showMore, setShowMore] = useState(false);

  return (
    <div
      key={key}
      className="ml-16 flex flex-col shadow-sm my-4 p-4 cursor-pointer border-l-4 border-blue-500 rounded-l-sm"
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.005)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      style={{
        transition: 'background-color 0.3s ease, transform 0.3s ease',
      }}
    >
      <p className="text-2xl">{'Vehicle Number ' + vehicle?.vehicleNumber}</p>
      <p>{'Vehicle Type ' + vehicle?.vehicleType}</p>
      <p>{'Vehicle Location ' + vehicle?.location}</p>
      <p>{'Vendor ' + vehicle?.vendor}</p>

      {/* Dropdown content with smooth animation */}
      <div
        style={{
          maxHeight: showMore ? '500px' : '0px', // Adjust the maxHeight based on the state
          overflow: 'hidden',
          transition: 'max-height 0.5s ease',
        }}
      >
        <p>{'Insurance Number ' + vehicle?.insuranceNumber}</p>
        <p>{'Insurance Expiry Date ' + vehicle?.insuranceExpiryDate}</p>
        <p>{'Gate Pass Number ' + vehicle?.gatePassNumber}</p>
        <p>{'Gate Pass Expiry Date ' + vehicle?.gatePassExpiry}</p>
        <p>{'Tax ' + vehicle?.tax}</p>
        <p>{'Tax Expiry Date ' + vehicle?.taxExpiryDate}</p>
        <p>{'Fitness ' + vehicle?.fitness}</p>
        <p>{'Fitness Expiry ' + vehicle?.fitnessExpiry}</p>
        <p>{'Load Test ' + vehicle?.loadTest}</p>
        <p>{'Load Test Expiry ' + vehicle?.loadTestExpiry}</p>
        <p>{'Safety ' + vehicle?.safety}</p>
        <p>{'Safety Expiry Date ' + vehicle?.safetyExpiryDate}</p>
        <p>{'PUC ' + vehicle?.puc}</p>
        <p>{'PUC Expiry Date ' + vehicle?.pucExpiryDate}</p>
        <p>{'Fuel Type ' + vehicle?.fuelType}</p>
        <p>{'Fuel Cost ' + vehicle?.fuelCost}</p>
        <p>{'EMI ' + vehicle?.emi}</p>
        <p>{'EMI Status ' + vehicle?.emiStatus}</p>
      </div>

      {/* Toggle button to show more or less */}
      <button
        className="mt-2 text-blue-500"
        onClick={() => setShowMore((prev) => !prev)}
      >
        {showMore ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
};

export default VehicleInformation;

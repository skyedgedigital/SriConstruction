'use client';

import VehicleInformation from '@/components/admin/VehicleInformation';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import { CSSProperties, useEffect, useState } from 'react';
import HashLoader from 'react-spinners/HashLoader';

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};

const Page = () => {
  const [vehicles, setVehicles] = useState(null);

  useEffect(() => {
    const fn = async () => {
      const resp = await vehicleAction.FETCH.fetchAllVehicles();
      if (resp?.success) {
        const vehicles = JSON.parse(resp.data);
        setVehicles(vehicles);
      }
    };
    fn();
  }, []);

  return (
    <>
      <div>
        <p className='text-2xl ml-20'>List of All Vehicles</p>
      </div>
      {vehicles ? (
        <div className='flex-wrap'>
          {vehicles.map((vehicle, index) => {
            return <VehicleInformation vehicle={vehicle} key={index} />;

            // return (
            //   <div
            //     key={index}
            //     className="ml-16 flex flex-col shadow-sm my-4 p-4 cursor-pointer border-l-4 border-blue-500 rounded-l-sm"
            //     onMouseEnter={(e) =>
            //       (e.currentTarget.style.transform = "scale(1.005)")
            //     }
            //     onMouseLeave={(e) =>
            //       (e.currentTarget.style.transform = "scale(1)")
            //     }
            //     style={{
            //       transition: "background-color 0.3s ease, transform 0.3s ease",
            //     }}
            //   >
            //     {/* Displaying the first 4 fields */}
            //     <span className="text-2xl">
            //       {"Vehicle Number " + vehicle?.vehicleNumber}
            //     </span>
            //     <span>{"Vehicle Type " + vehicle?.vehicleType}</span>
            //     <span>{"Vehicle Location " + vehicle?.location}</span>
            //     <span>{"Vendor " + vehicle?.vendor}</span>

            //     {/* Toggle to show or hide the extra fields */}
            //     {showMore && (
            //       <div>
            //         <span>{"Insurance Number " + vehicle?.insuranceNumber}</span>
            //         <span>
            //           {"Insurance Expiry Date " + vehicle?.insuranceExpiryDate}
            //         </span>
            //         <span>{"Gate Pass Number " + vehicle?.gatePassNumber}</span>
            //         <span>
            //           {"Gate Pass Expiry Date " + vehicle?.gatePassExpiry}
            //         </span>
            //         <span>{"Tax " + vehicle?.tax}</span>
            //         <span>{"Tax Expiry Date " + vehicle?.taxExpiryDate}</span>
            //         <span>{"Fitness " + vehicle?.fitness}</span>
            //         <span>{"Fitness Expiry " + vehicle?.fitnessExpiry}</span>
            //         <span>{"Load Test " + vehicle?.loadTest}</span>
            //         <span>{"Load Test Expiry " + vehicle?.loadTestExpiry}</span>
            //         <span>{"Safety " + vehicle?.safety}</span>
            //         <span>
            //           {"Safety Expiry Date " + vehicle?.safetyExpiryDate}
            //         </span>
            //         <span>{"PUC " + vehicle?.puc}</span>
            //         <span>{"PUC Expiry Date " + vehicle?.pucExpiryDate}</span>
            //         <span>{"Fuel Type " + vehicle?.fuelType}</span>
            //         <span>{"Fuel Cost " + vehicle?.fuelCost}</span>
            //         <span>{"EMI " + vehicle?.emi}</span>
            //         <span>{"EMI Status " + vehicle?.emiStatus}</span>
            //       </div>
            //     )}

            //     {/* Button to toggle extra fields */}
            //     <button
            //       className="mt-2 text-blue-500"
            //       onClick={() => setShowMore((prev) => !prev)}
            //     >
            //       {showMore ? "Show Less" : "Show More"}
            //     </button>
            //   </div>
            // );
          })}
        </div>
      ) : (
        <>
          <div className='text-center text-2xl'>No Data Available</div>
        </>
      )}
    </>
  );
};

export default Page;

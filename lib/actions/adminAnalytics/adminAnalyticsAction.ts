import {
  fetchDriversCount,
  fetchFleetManagersCount,
  fetchHRCount,
  fetchHrEmps,
  fetchSafetyManagerCount,
  fetchTotalVehicles,
  fetchVehicleHoursAnalytics,
} from './fetch';
import getVehiclesWithHours from './fetchFuelAnalytics';
import { fetchPaymentReport } from './fetchPaymentReport';
import {
  chemicalPurchaseSpend,
  ppePurchaseSpend,
  toolPurchaseSpend,
} from './fetchSafetyData';

const AdminAnalytics = {
  fetchVehicleHoursAnalytics: fetchVehicleHoursAnalytics,
  fetchNumberOfVehicles: fetchTotalVehicles,
  fetchCount: {
    fetchDriver: fetchDriversCount,
    fetchFleetManager: fetchFleetManagersCount,
    fetchHr: fetchHRCount,
    fetchSafety: fetchSafetyManagerCount,
    fetchHrEmps: fetchHrEmps,
  },
  fetchSafetySpend: {
    chemicalPurchaseSpend: chemicalPurchaseSpend,
    ppePurchaseSpend: ppePurchaseSpend,
    toolPurchaseSpend: toolPurchaseSpend,
  },
  fetchVehicles: {
    fetchVehicleHours: getVehiclesWithHours,
  },
  fetchPaymentReport,
};

export default AdminAnalytics;

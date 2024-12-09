import { createFuelManagement, saveFuelPrices } from './create';
import { deleteFuelManagement } from './delete';
import { fetchFuelManagement, fetchSavedFuelPrices } from './fetch';
import { updateFuelManagement } from './update';

const fuelManagementAction = {
  CREATE: {
    createFuelManagement: createFuelManagement,
    saveFuelPrices: saveFuelPrices,
  },
  UPDATE: {
    updateFuelManagement: updateFuelManagement,
  },
  DELETE: {
    deleteFuelManagement: deleteFuelManagement,
  },
  FETCH: {
    fetchFuelManagement: fetchFuelManagement,
    fetchSavedFuelPrices: fetchSavedFuelPrices,
  },
};

export default fuelManagementAction;

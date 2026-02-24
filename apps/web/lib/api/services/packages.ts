import { AxiosInstance } from "axios";

export interface PackageCreateDto {
  title: string;
  description: string;
  sessionCount: number;
  price: number;
  validityDays: number;
  features?: any;
}

export function createPackagesService(axios: AxiosInstance) {
  return {
    /**
     * Create a new package (Therapist)
     */
    async createPackage(data: PackageCreateDto) {
      const response = await axios.post("/packages/therapist", data);
      return response.data;
    },

    /**
     * Get therapist's packages
     */
    async getTherapistPackages() {
      const response = await axios.get("/packages/therapist");
      return response.data;
    },

    /**
     * Get pending packages (Admin)
     */
    async getPendingPackages() {
      const response = await axios.get("/packages/admin/pending");
      return response.data;
    },

    /**
     * Approve package (Admin)
     */
    async approvePackage(packageId: string) {
      const response = await axios.patch(`/packages/admin/${packageId}/approve`);
      return response.data;
    },

    /**
     * Reject package (Admin)
     */
    async rejectPackage(packageId: string) {
      const response = await axios.patch(`/packages/admin/${packageId}/reject`);
      return response.data;
    }
  };
}

export type PackagesService = ReturnType<typeof createPackagesService>;

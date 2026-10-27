import { prisma } from '../config/prisma';
import { BloodGroup } from '../types/enums';

export class DonorService {
  static async searchDonors(filters: { bloodGroup?: BloodGroup; city?: string; town?: string }) {
    const donors = await prisma.donorProfile.findMany({
      where: {
        isAvailable: true,
        ...(filters.bloodGroup ? { bloodGroup: filters.bloodGroup } : {}),
        ...(filters.city ? { city: { contains: filters.city } } : {}),
        ...(filters.town ? { town: { contains: filters.town } } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return donors.map((d) => ({
      donorProfileId: d.id,
      userId: d.userId,
      fullName: d.user.fullName,
      phone: d.user.phone,
      email: d.user.email,
      bloodGroup: d.bloodGroup,
      town: d.town,
      city: d.city,
      isAvailable: d.isAvailable,
      lastDonationDate: d.lastDonationDate,
    }));
  }

  static async updateAvailability(userId: string, isAvailable: boolean) {
    const updated = await prisma.donorProfile.update({
      where: { userId },
      data: { isAvailable },
    });
    return updated;
  }
}

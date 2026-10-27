import { prisma } from '../config/prisma';
import { AccountStatus } from '../types/enums';

export class AdminService {
  static async getPendingOrganizations() {
    return prisma.organization.findMany({
      where: { isVerified: false },
      include: {
        hospitalProfiles: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
        bloodBankProfiles: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAllOrganizations() {
    return prisma.organization.findMany({
      include: {
        hospitalProfiles: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
        bloodBankProfiles: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
        inventories: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async verifyOrganization(organizationId: string, isVerified: boolean, adminUserId: string) {
    const updated = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.update({
        where: { id: organizationId },
        data: {
          isVerified,
          verifiedAt: isVerified ? new Date() : null,
        },
      });

      // Also activate or suspend staff users affiliated with this organization
      const hospitalStaff = await tx.hospitalProfile.findMany({
        where: { organizationId },
        select: { userId: true },
      });
      const bloodBankStaff = await tx.bloodBankProfile.findMany({
        where: { organizationId },
        select: { userId: true },
      });

      const userIds = [...hospitalStaff.map((h) => h.userId), ...bloodBankStaff.map((b) => b.userId)];

      if (userIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            status: isVerified ? AccountStatus.ACTIVE : AccountStatus.SUSPENDED,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: isVerified ? 'VERIFY_ORGANIZATION' : 'REJECT_ORGANIZATION',
          targetEntity: 'Organization',
          entityId: organizationId,
          details: JSON.stringify({ organizationName: org.name, isVerified }),
        },
      });

      return org;
    });

    return updated;
  }

  static async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        userRoles: {
          include: { role: true },
        },
        donorProfile: {
          select: { bloodGroup: true, city: true, town: true, isAvailable: true },
        },
        hospitalProfile: {
          include: { organization: { select: { id: true, name: true, isVerified: true } } },
        },
        bloodBankProfile: {
          include: { organization: { select: { id: true, name: true, isVerified: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateUserStatus(userId: string, status: string, adminUserId: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_USER_STATUS',
        targetEntity: 'User',
        entityId: userId,
        details: JSON.stringify({ newStatus: status, userEmail: updated.email }),
      },
    });

    return updated;
  }

  static async getStats() {
    const [totalDonors, totalRequests, openRequests, totalHospitals, totalBloodBanks, pendingApprovals, inventorySum] =
      await Promise.all([
        prisma.donorProfile.count(),
        prisma.bloodRequest.count(),
        prisma.bloodRequest.count({ where: { status: 'OPEN' } }),
        prisma.organization.count({ where: { type: 'HOSPITAL' } }),
        prisma.organization.count({ where: { type: 'BLOOD_BANK' } }),
        prisma.organization.count({ where: { isVerified: false } }),
        prisma.bloodInventory.aggregate({ _sum: { unitsAvailable: true } }),
      ]);

    return {
      totalDonors,
      totalRequests,
      openRequests,
      totalHospitals,
      totalBloodBanks,
      pendingApprovals,
      totalStockUnits: inventorySum._sum.unitsAvailable || 0,
    };
  }

  static async getAuditLogs() {
    return prisma.auditLog.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}


import { prisma } from '../config/prisma';
import { BloodGroup, TransactionType, BatchStatus } from '../types/enums';

export class InventoryService {
  static async getInventory(organizationId?: string) {
    return prisma.bloodInventory.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        organization: {
          select: { name: true, city: true, phone: true },
        },
      },
    });
  }

  static async addReceipt(data: {
    organizationId: string;
    bloodGroup: BloodGroup;
    units: number;
    collectionDate: string;
    expiryDate: string;
    donorRef?: string;
    performedByUserId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create batch
      const batch = await tx.inventoryBatch.create({
        data: {
          organizationId: data.organizationId,
          bloodGroup: data.bloodGroup,
          units: data.units,
          collectionDate: new Date(data.collectionDate),
          expiryDate: new Date(data.expiryDate),
          donorRef: data.donorRef,
          batchStatus: BatchStatus.AVAILABLE,
        },
      });

      // 2. Upsert BloodInventory
      await tx.bloodInventory.upsert({
        where: {
          organizationId_bloodGroup: {
            organizationId: data.organizationId,
            bloodGroup: data.bloodGroup,
          },
        },
        update: {
          unitsAvailable: { increment: data.units },
        },
        create: {
          organizationId: data.organizationId,
          bloodGroup: data.bloodGroup,
          unitsAvailable: data.units,
        },
      });

      // 3. Log transaction
      await tx.inventoryTransaction.create({
        data: {
          organizationId: data.organizationId,
          batchId: batch.id,
          transactionType: TransactionType.RECEIPT,
          bloodGroup: data.bloodGroup,
          units: data.units,
          reason: 'Verified stock receipt added to inventory',
          performedByUserId: data.performedByUserId,
        },
      });

      return batch;
    });
  }

  static async issueStock(data: {
    organizationId: string;
    bloodGroup: BloodGroup;
    units: number;
    recipientHospitalId?: string;
    reason: string;
    performedByUserId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const inventory = await tx.bloodInventory.findUnique({
        where: {
          organizationId_bloodGroup: {
            organizationId: data.organizationId,
            bloodGroup: data.bloodGroup,
          },
        },
      });

      if (!inventory || inventory.unitsAvailable < data.units) {
        throw new Error(`Insufficient verified stock for group ${data.bloodGroup}. Available: ${inventory?.unitsAvailable || 0}`);
      }

      await tx.bloodInventory.update({
        where: { id: inventory.id },
        data: { unitsAvailable: { decrement: data.units } },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          organizationId: data.organizationId,
          transactionType: TransactionType.ISSUE,
          bloodGroup: data.bloodGroup,
          units: data.units,
          recipientHospitalId: data.recipientHospitalId,
          reason: data.reason,
          performedByUserId: data.performedByUserId,
        },
      });

      return transaction;
    });
  }

  static async getBatches(organizationId?: string) {
    return prisma.inventoryBatch.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        organization: {
          select: { name: true, city: true },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  static async getTransactions(organizationId?: string) {
    return prisma.inventoryTransaction.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        organization: { select: { name: true } },
        recipientHospital: { select: { name: true } },
        performedByUser: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}


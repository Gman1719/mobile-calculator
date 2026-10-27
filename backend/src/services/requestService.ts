import { prisma } from '../config/prisma';
import { BloodGroup, RequestUrgency, RequestStatus, ResponseStatus } from '../types/enums';

function normalizeBloodGroup(bg?: string): string | undefined {
  if (!bg) return undefined;
  const cleaned = bg.trim().toUpperCase();
  const map: Record<string, string> = {
    'A+': 'A_POSITIVE',
    'A-': 'A_NEGATIVE',
    'B+': 'B_POSITIVE',
    'B-': 'B_NEGATIVE',
    'AB+': 'AB_POSITIVE',
    'AB-': 'AB_NEGATIVE',
    'O+': 'O_POSITIVE',
    'O-': 'O_NEGATIVE',
  };
  return map[cleaned] || cleaned;
}

export class RequestService {
  static async createRequest(data: {
    requesterId: string;
    hospitalId?: string;
    bloodGroup: string;
    unitsRequired: number;
    urgency: RequestUrgency;
    hospitalName: string;
    town?: string;
    city: string;
    contactName: string;
    contactPhone: string;
    notes?: string;
    status?: string;
  }) {
    const normalizedBg = normalizeBloodGroup(data.bloodGroup) || data.bloodGroup;
    const request = await prisma.bloodRequest.create({
      data: {
        requesterId: data.requesterId,
        hospitalId: data.hospitalId,
        bloodGroup: normalizedBg,
        unitsRequired: Number(data.unitsRequired) || 1,
        urgency: data.urgency || RequestUrgency.MEDIUM,
        hospitalName: data.hospitalName || 'Local Medical Center',
        town: data.town || data.city || 'Central',
        city: data.city || 'Metropolis',
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        notes: data.notes,
        status: data.status || RequestStatus.OPEN,
      },
    });

    return request;
  }

  static async listRequests(filters: { bloodGroup?: string; city?: string; status?: RequestStatus }) {
    const normalizedBg = normalizeBloodGroup(filters.bloodGroup);
    return prisma.bloodRequest.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(normalizedBg
          ? {
              OR: [
                { bloodGroup: normalizedBg },
                { bloodGroup: filters.bloodGroup },
              ],
            }
          : {}),
        ...(filters.city ? { city: { contains: filters.city } } : {}),
      },
      include: {
        requester: {
          select: { fullName: true, phone: true, email: true },
        },
        hospital: {
          select: { id: true, name: true, city: true, phone: true },
        },
        responses: {
          include: {
            donor: { select: { fullName: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getRequestsByUser(userId: string) {
    return prisma.bloodRequest.findMany({
      where: { requesterId: userId },
      include: {
        requester: {
          select: { fullName: true, phone: true, email: true },
        },
        hospital: {
          select: { id: true, name: true, city: true, phone: true },
        },
        responses: {
          include: {
            donor: { select: { fullName: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async respondToRequest(requestId: string, donorId: string, responseStatus: ResponseStatus, notes?: string) {
    const response = await prisma.donorResponse.upsert({
      where: {
        requestId_donorId: { requestId, donorId },
      },
      update: {
        responseStatus,
        notes,
      },
      create: {
        requestId,
        donorId,
        responseStatus,
        notes,
      },
    });

    if (responseStatus === ResponseStatus.ACCEPTED) {
      await prisma.bloodRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.RESPONSES_RECEIVED },
      });
    }

    return response;
  }

  static async updateRequestStatus(requestId: string, status: RequestStatus) {
    return prisma.bloodRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }
}

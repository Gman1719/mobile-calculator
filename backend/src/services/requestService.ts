import { prisma } from '../config/prisma';
import { BloodGroup, RequestUrgency, RequestStatus, ResponseStatus } from '../types/enums';

export class RequestService {
  static async createRequest(data: {
    requesterId: string;
    hospitalId?: string;
    bloodGroup: BloodGroup;
    unitsRequired: number;
    urgency: RequestUrgency;
    hospitalName: string;
    town: string;
    city: string;
    contactName: string;
    contactPhone: string;
    notes?: string;
  }) {
    const request = await prisma.bloodRequest.create({
      data: {
        requesterId: data.requesterId,
        hospitalId: data.hospitalId,
        bloodGroup: data.bloodGroup,
        unitsRequired: data.unitsRequired,
        urgency: data.urgency,
        hospitalName: data.hospitalName,
        town: data.town,
        city: data.city,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        notes: data.notes,
        status: RequestStatus.OPEN,
      },
    });

    return request;
  }

  static async listRequests(filters: { bloodGroup?: BloodGroup; city?: string; status?: RequestStatus }) {
    return prisma.bloodRequest.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.bloodGroup ? { bloodGroup: filters.bloodGroup } : {}),
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

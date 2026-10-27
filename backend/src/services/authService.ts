import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { RoleName, BloodGroup, AccountStatus, OrganizationType } from '../types/enums';

export class AuthService {
  static async register(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    roles: RoleName[];
    donorInfo?: {
      bloodGroup: BloodGroup;
      town: string;
      city: string;
      isAvailable?: boolean;
    };
  }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email address is already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const userRolesToCreate = await prisma.role.findMany({
      where: { name: { in: data.roles } },
    });

    const newUser = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash,
        status: AccountStatus.ACTIVE,
        userRoles: {
          create: userRolesToCreate.map((role) => ({ roleId: role.id })),
        },
        ...(data.roles.includes(RoleName.DONOR) && data.donorInfo
          ? {
              donorProfile: {
                create: {
                  bloodGroup: data.donorInfo.bloodGroup,
                  town: data.donorInfo.town,
                  city: data.donorInfo.city,
                  isAvailable: data.donorInfo.isAvailable ?? true,
                },
              },
            }
          : {}),
      },
      include: {
        userRoles: { include: { role: true } },
        donorProfile: true,
      },
    });

    const roleNames = newUser.userRoles.map((ur) => ur.role.name);
    const tokenPayload = { userId: newUser.id, email: newUser.email, roles: roleNames };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      roles: roleNames,
      accessToken,
      refreshToken,
    };
  }

  static async registerOrganization(data: {
    orgType: 'HOSPITAL' | 'BLOOD_BANK';
    orgName: string;
    orgEmail: string;
    orgPhone: string;
    town: string;
    city: string;
    address: string;
    repName: string;
    repEmail: string;
    repPhone: string;
    password: string;
    licenseNo?: string;
    department?: string;
    position?: string;
    employeeId?: string;
  }) {
    // Check if representative email or organization email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.repEmail } });
    if (existingUser) {
      throw new Error('Representative email address is already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const targetRole = data.orgType === 'HOSPITAL' ? RoleName.HOSPITAL_STAFF : RoleName.BLOOD_BANK_OFFICER;

    const roleRecord = await prisma.role.findUnique({ where: { name: targetRole } });
    if (!roleRecord) {
      throw new Error(`Role ${targetRole} not found in database`);
    }

    // Create organization (pending verification) and staff user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.orgName,
          type: data.orgType,
          address: data.address,
          town: data.town,
          city: data.city,
          phone: data.orgPhone,
          email: data.orgEmail,
          isVerified: false, // Requires admin approval
        },
      });

      const user = await tx.user.create({
        data: {
          fullName: data.repName,
          email: data.repEmail,
          phone: data.repPhone,
          passwordHash,
          status: AccountStatus.PENDING_VERIFICATION, // Pending approval
          userRoles: {
            create: { roleId: roleRecord.id },
          },
          ...(data.orgType === 'HOSPITAL'
            ? {
                hospitalProfile: {
                  create: {
                    organizationId: org.id,
                    department: data.department || 'Blood Transfusion / ER',
                    position: data.position || 'Hospital Staff Representative',
                    employeeId: data.employeeId || 'HOSP-' + Math.floor(1000 + Math.random() * 9000),
                  },
                },
              }
            : {
                bloodBankProfile: {
                  create: {
                    organizationId: org.id,
                    officerLicenseNo: data.licenseNo || 'LIC-' + Math.floor(10000 + Math.random() * 90000),
                  },
                },
              }),
        },
      });

      // Log audit
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'ORGANIZATION_REGISTRATION_SUBMITTED',
          targetEntity: 'Organization',
          entityId: org.id,
          details: JSON.stringify({
            orgName: org.name,
            orgType: org.type,
            repEmail: user.email,
          }),
        },
      });

      return { org, user };
    });

    return {
      message: 'Organization registration submitted successfully. Your account is pending administrator approval.',
      organizationId: result.org.id,
      organizationName: result.org.name,
      status: 'PENDING_VERIFICATION',
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        userRoles: { include: { role: true } },
        hospitalProfile: { include: { organization: true } },
        bloodBankProfile: { include: { organization: true } },
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const roleNames = user.userRoles.map((ur) => ur.role.name as RoleName);

    // Enforce approval for Hospital Staff and Blood Bank Officers
    const isHospitalStaff = roleNames.includes(RoleName.HOSPITAL_STAFF);
    const isBloodBankOfficer = roleNames.includes(RoleName.BLOOD_BANK_OFFICER);

    let orgDetails: { id: string; name: string; type: string; city: string; town: string; isVerified: boolean } | null = null;

    if (isHospitalStaff && user.hospitalProfile) {
      const org = user.hospitalProfile.organization;
      orgDetails = {
        id: org.id,
        name: org.name,
        type: org.type,
        city: org.city,
        town: org.town,
        isVerified: org.isVerified,
      };
      if (!org.isVerified || user.status === AccountStatus.PENDING_VERIFICATION) {
        throw new Error('Your hospital organization account is pending administrator approval. Please wait for verification.');
      }
    } else if (isBloodBankOfficer && user.bloodBankProfile) {
      const org = user.bloodBankProfile.organization;
      orgDetails = {
        id: org.id,
        name: org.name,
        type: org.type,
        city: org.city,
        town: org.town,
        isVerified: org.isVerified,
      };
      if (!org.isVerified || user.status === AccountStatus.PENDING_VERIFICATION) {
        throw new Error('Your blood bank organization account is pending administrator approval. Please wait for verification.');
      }
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new Error('Your account has been suspended by system administrator. Please contact support.');
    }

    const tokenPayload = { userId: user.id, email: user.email, roles: roleNames };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        status: user.status,
        roles: roleNames,
        organization: orgDetails,
      },
      accessToken,
      refreshToken,
    };
  }
}

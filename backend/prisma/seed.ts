import { PrismaClient } from '@prisma/client';
import { RoleName, AccountStatus, BloodGroup, RequestUrgency, RequestStatus, OrganizationType } from '../src/types/enums';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data and reseeding with clean @gmail.com accounts...');

  // 0. Clean existing data
  await prisma.donorResponse.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.bloodInventory.deleteMany();
  await prisma.hospitalProfile.deleteMany();
  await prisma.bloodBankProfile.deleteMany();
  await prisma.donorProfile.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Create Roles
  const roles: RoleName[] = [
    RoleName.DONOR,
    RoleName.REQUESTER,
    RoleName.HOSPITAL_STAFF,
    RoleName.BLOOD_BANK_OFFICER,
    RoleName.SYSTEM_ADMINISTRATOR,
  ];

  const roleMap = new Map<RoleName, string>();

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleMap.set(roleName, role.id);
  }

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 2. System Administrator Account
  await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: 'admin@gmail.com',
      phone: '+1000000000',
      passwordHash: hashedPassword,
      status: AccountStatus.ACTIVE,
      userRoles: {
        create: {
          roleId: roleMap.get(RoleName.SYSTEM_ADMINISTRATOR)!,
        },
      },
    },
  });

  // 3. Hospital Staff Account
  const hospitalOrg = await prisma.organization.create({
    data: {
      name: 'City Central Hospital',
      type: OrganizationType.HOSPITAL,
      address: '123 Health Ave',
      town: 'Downtown',
      city: 'Metropolis',
      phone: '+15550100',
      email: 'hospital.org@gmail.com',
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      fullName: 'Dr. Sarah Connor',
      email: 'hospital@gmail.com',
      phone: '+15550101',
      passwordHash: hashedPassword,
      status: AccountStatus.ACTIVE,
      userRoles: {
        create: {
          roleId: roleMap.get(RoleName.HOSPITAL_STAFF)!,
        },
      },
      hospitalProfile: {
        create: {
          organizationId: hospitalOrg.id,
          department: 'Emergency & Surgery',
          position: 'Blood Sourcing Officer',
          employeeId: 'HOSP-EMP-9021',
        },
      },
    },
  });

  // 4. Blood Bank Officer Account
  const bloodBankOrg = await prisma.organization.create({
    data: {
      name: 'Metropolis Central Blood Bank',
      type: OrganizationType.BLOOD_BANK,
      address: '456 Red Cross Blvd',
      town: 'Midtown',
      city: 'Metropolis',
      phone: '+15550200',
      email: 'bloodbank.org@gmail.com',
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      fullName: 'Marcus Vance',
      email: 'bloodbank@gmail.com',
      phone: '+15550201',
      passwordHash: hashedPassword,
      status: AccountStatus.ACTIVE,
      userRoles: {
        create: {
          roleId: roleMap.get(RoleName.BLOOD_BANK_OFFICER)!,
        },
      },
      bloodBankProfile: {
        create: {
          organizationId: bloodBankOrg.id,
          officerLicenseNo: 'LIC-BB-88392',
        },
      },
    },
  });

  // Create initial blood inventory for Blood Bank
  const bloodGroups = Object.values(BloodGroup);
  for (const bg of bloodGroups) {
    const initialUnits = bg === BloodGroup.O_POSITIVE || bg === BloodGroup.A_POSITIVE ? 15 : 5;
    await prisma.bloodInventory.create({
      data: {
        organizationId: bloodBankOrg.id,
        bloodGroup: bg,
        unitsAvailable: initialUnits,
      },
    });

    // Create batch
    await prisma.inventoryBatch.create({
      data: {
        organizationId: bloodBankOrg.id,
        bloodGroup: bg,
        units: initialUnits,
        collectionDate: new Date(),
        expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days
        donorRef: 'DONOR-BATCH-INITIAL',
      },
    });
  }

  // 5. Donor Accounts
  await prisma.user.create({
    data: {
      fullName: 'John Donor',
      email: 'donor@gmail.com',
      phone: '+15550301',
      passwordHash: hashedPassword,
      status: AccountStatus.ACTIVE,
      userRoles: {
        create: {
          roleId: roleMap.get(RoleName.DONOR)!,
        },
      },
      donorProfile: {
        create: {
          bloodGroup: BloodGroup.O_POSITIVE,
          town: 'Downtown',
          city: 'Metropolis',
          isAvailable: true,
          allowNotifications: true,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      fullName: 'Alice Walker',
      email: 'donor2@gmail.com',
      phone: '+15550302',
      passwordHash: hashedPassword,
      status: AccountStatus.ACTIVE,
      userRoles: {
        create: {
          roleId: roleMap.get(RoleName.DONOR)!,
        },
      },
      donorProfile: {
        create: {
          bloodGroup: BloodGroup.A_NEGATIVE,
          town: 'Downtown',
          city: 'Metropolis',
          isAvailable: true,
          allowNotifications: true,
        },
      },
    },
  });

  // 6. Requester Account
  const requesterUser = await prisma.user.create({
    data: {
      fullName: 'Robert Requester',
      email: 'requester@gmail.com',
      phone: '+15550401',
      passwordHash: hashedPassword,
      status: AccountStatus.ACTIVE,
      userRoles: {
        create: {
          roleId: roleMap.get(RoleName.REQUESTER)!,
        },
      },
    },
  });

  await prisma.bloodRequest.create({
    data: {
      requesterId: requesterUser.id,
      bloodGroup: BloodGroup.O_POSITIVE,
      unitsRequired: 2,
      urgency: RequestUrgency.HIGH,
      status: RequestStatus.OPEN,
      hospitalName: 'City Central Hospital',
      town: 'Downtown',
      city: 'Metropolis',
      contactName: 'Robert Requester',
      contactPhone: '+15550401',
      notes: 'Urgent need for surgery patient.',
    },
  });

  console.log('Seeding completed successfully with simple @gmail.com accounts!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

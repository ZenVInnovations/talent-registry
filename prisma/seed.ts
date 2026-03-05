import { PrismaClient } from '@prisma/client';
import { ROLE_PERMISSIONS } from '../src/lib/permissions/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles and permissions...');

  // Create built-in roles
  const roleConfigs = [
    { name: 'STUDENT', scope: 'GLOBAL' as const, isDefault: true, position: 1 },
    { name: 'EMPLOYER', scope: 'EMPLOYER' as const, isDefault: false, position: 2 },
    { name: 'ZENV_BD', scope: 'GLOBAL' as const, isDefault: false, position: 3 },
    { name: 'ZENV_ADMIN', scope: 'GLOBAL' as const, isDefault: false, position: 4 },
  ];

  for (const roleConfig of roleConfigs) {
    const role = await prisma.role.upsert({
      where: { name: roleConfig.name },
      create: {
        name: roleConfig.name,
        scope: roleConfig.scope,
        isBuiltIn: true,
        isDefault: roleConfig.isDefault,
        position: roleConfig.position,
      },
      update: {
        scope: roleConfig.scope,
        isBuiltIn: true,
        isDefault: roleConfig.isDefault,
        position: roleConfig.position,
      },
    });

    console.log(`  Role: ${role.name} (${role.id})`);

    // Seed permissions for this role
    const permissions = ROLE_PERMISSIONS[roleConfig.name] || [];
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permission: {
            roleId: role.id,
            permission,
          },
        },
        create: {
          roleId: role.id,
          permission,
        },
        update: {},
      });
    }

    console.log(`    ${permissions.length} permissions assigned`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

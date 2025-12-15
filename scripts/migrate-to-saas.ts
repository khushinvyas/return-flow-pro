
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting SaaS Migration...');

    const users = await prisma.user.findMany({
        include: {
            memberships: true,
        },
    });

    console.log(`Found ${users.length} users to process.`);

    for (const user of users) {
        if (user.memberships.length > 0) {
            console.log(`User ${user.email} already has memberships. Skipping Org creation.`);
            continue;
        }

        console.log(`Creating Organization for ${user.name} (${user.email})...`);

        // 1. Create Organization
        const orgName = `${user.name}'s Organization`;
        // Create a slug from name (simplified)
        const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);

        const org = await prisma.organization.create({
            data: {
                name: orgName,
                slug: slug,
                members: {
                    create: {
                        userId: user.id,
                        role: 'OWNER',
                    },
                },
            },
        });

        console.log(`  ✅ Created Org: ${org.name} (ID: ${org.id})`);

        // 2. Migrate Data
        // We update all records owned by this user to belong to this new Org.

        const updateTickets = await prisma.ticket.updateMany({
            where: { userId: user.id },
            data: { organizationId: org.id }
        });
        console.log(`  - Migrated ${updateTickets.count} tickets`);

        const updateCustomers = await prisma.customer.updateMany({
            where: { userId: user.id },
            data: { organizationId: org.id }
        });
        console.log(`  - Migrated ${updateCustomers.count} customers`);

        const updateProducts = await prisma.product.updateMany({
            where: { userId: user.id },
            data: { organizationId: org.id }
        });
        console.log(`  - Migrated ${updateProducts.count} products`);

        const updateCompanies = await prisma.company.updateMany({
            where: { userId: user.id },
            data: { organizationId: org.id }
        });
        console.log(`  - Migrated ${updateCompanies.count} companies`);

        // TicketItems should ideally be migrated too, but they are linked to Tickets. 
        // However, for completeness/queries that access items directly:
        const updateItems = await prisma.ticketItem.updateMany({
            where: { userId: user.id },
            data: { organizationId: org.id }
        });
        console.log(`  - Migrated ${updateItems.count} ticket items`);
    }

    console.log('✅ Migration Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

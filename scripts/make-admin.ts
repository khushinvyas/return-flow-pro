import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address: npx tsx scripts/make-admin.ts <email>');
        process.exit(1);
    }

    const user = await prisma.user.update({
        where: { email },
        data: { isGlobalAdmin: true },
    });

    console.log(`User ${user.email} is now a Super Admin!`);
    console.log('You may need to logout and login again for changes to take effect.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

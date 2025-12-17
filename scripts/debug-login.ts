import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'khushinhvyas004@gmail.com';
    console.log(`🔍 Checking database connection and searching for user: ${email}...`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error('❌ User NOT FOUND in database!');
            console.log('This means the database is connected, but the user does not exist.');
        } else {
            console.log('✅ User FOUND!');
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   IsGlobalAdmin: ${user.isGlobalAdmin}`);

            // Optional: Verify password '123456'
            const isMatch = await bcrypt.compare('123456', user.password);
            console.log(`   Password '123456' match: ${isMatch ? '✅ YES' : '❌ NO'}`);
        }

    } catch (e) {
        console.error('❌ Database Connection FAILED:');
        console.error(e);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });

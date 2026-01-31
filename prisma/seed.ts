import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();

  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: 'Cannot login to account',
        description:
          'User reports being unable to log in with correct credentials. Investigate authentication service and reset password if necessary.',
        status: 'OPEN',
        priority: 'HIGH',
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Feature request: Dark mode',
        description:
          'Several users have requested a dark mode for the web application to reduce eye strain during night-time usage.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Typo on pricing page',
        description:
          'There is a small typo on the pricing page in the enterprise plan description. Needs correction for professionalism.',
        status: 'RESOLVED',
        priority: 'LOW',
      },
    }),
  ]);

  await prisma.comment.createMany({
    data: [
      {
        ticketId: tickets[0].id,
        authorName: 'Support Agent Alice',
        message: 'Hi, can you confirm if you recently changed your password?',
      },
      {
        ticketId: tickets[0].id,
        authorName: 'User Bob',
        message: 'No, I have not changed my password in the last 6 months.',
      },
      {
        ticketId: tickets[1].id,
        authorName: 'Product Manager Carol',
        message: 'Thanks for the suggestion! We have added dark mode to our roadmap.',
      },
    ],
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


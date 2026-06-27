require('dotenv').config();
const prisma = require('./dist/prisma.js').default;

const plans = [
  { name: 'A100', daily_rate: 0.5, days: 1, min_amount: 1000, max_amount: 2999 },
  { name: 'H200', daily_rate: 0.87, days: 3, min_amount: 3000, max_amount: 7999 },
  { name: 'GH350', daily_rate: 0.99, days: 7, min_amount: 8000, max_amount: 19999 },
  { name: 'V1', daily_rate: 1.2, days: 7, min_amount: 20000, max_amount: 50001 },
  { name: 'V8', daily_rate: 1.41, days: 14, min_amount: 50000, max_amount: 99999 },
  { name: 'V12', daily_rate: 1.56, days: 15, min_amount: 100000, max_amount: 200000 },
  { name: 'V16', daily_rate: 1.62, days: 20, min_amount: 200000, max_amount: 300000 },
  { name: 'A360', daily_rate: 1.76, days: 20, min_amount: 300000, max_amount: 500000 },
  { name: 'A3487', daily_rate: 1.86, days: 26, min_amount: 500000, max_amount: 999999 },
  { name: 'A3679', daily_rate: 3.1, days: 35, min_amount: 1000000, max_amount: 3000000 },
];

async function main() {
  console.log('Seeding Arbitrage Products...');
  
  for (const plan of plans) {
    const existing = await prisma.arbitrageProduct.findFirst({
      where: { name: plan.name }
    });
    
    const data = {
      ...plan,
      supported_currencies: JSON.stringify(['USDT','BTC','ETH']),
      is_active: true
    };
    
    if (existing) {
      await prisma.arbitrageProduct.update({
        where: { id: existing.id },
        data
      });
      console.log(`Updated ${plan.name}`);
    } else {
      await prisma.arbitrageProduct.create({
        data
      });
      console.log(`Created ${plan.name}`);
    }
  }
  
  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

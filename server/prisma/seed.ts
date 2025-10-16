import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성을 시작합니다...');

  // 기본 카테고리 삭제 (초기화)
  await prisma.category.deleteMany({
    where: { isDefault: true },
  });

  // 수입 카테고리
  const incomeCategories = [
    { name: '급여', icon: 'IconBriefcase', color: '#4CAF50' },
    { name: '보너스', icon: 'IconGift', color: '#8BC34A' },
    { name: '투자수익', icon: 'IconTrendingUp', color: '#00BCD4' },
    { name: '기타 수입', icon: 'IconCash', color: '#009688' },
  ];

  // 지출 카테고리
  const expenseCategories = [
    { name: '식비', icon: 'IconToolsKitchen2', color: '#FF5722' },
    { name: '교통비', icon: 'IconBus', color: '#FF9800' },
    { name: '쇼핑', icon: 'IconShoppingCart', color: '#E91E63' },
    { name: '문화생활', icon: 'IconMovie', color: '#9C27B0' },
    { name: '주거비', icon: 'IconHome', color: '#3F51B5' },
    { name: '의료비', icon: 'IconMedicalCross', color: '#F44336' },
    { name: '교육비', icon: 'IconBook', color: '#2196F3' },
    { name: '통신비', icon: 'IconDeviceMobile', color: '#00BCD4' },
    { name: '보험', icon: 'IconShield', color: '#607D8B' },
    { name: '기타 지출', icon: 'IconDots', color: '#9E9E9E' },
  ];

  // 수입 카테고리 생성
  console.log('📥 수입 카테고리 생성 중...');
  for (const category of incomeCategories) {
    await prisma.category.create({
      data: {
        ...category,
        type: CategoryType.INCOME,
        isDefault: true,
      },
    });
  }

  // 지출 카테고리 생성
  console.log('📤 지출 카테고리 생성 중...');
  for (const category of expenseCategories) {
    await prisma.category.create({
      data: {
        ...category,
        type: CategoryType.EXPENSE,
        isDefault: true,
      },
    });
  }

  console.log('✅ 시드 데이터 생성이 완료되었습니다!');
  console.log(`   - 수입 카테고리: ${incomeCategories.length}개`);
  console.log(`   - 지출 카테고리: ${expenseCategories.length}개`);
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

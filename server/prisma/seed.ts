import { PrismaClient, CategoryType, NoteType } from '@prisma/client';

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

  console.log('✅ 카테고리 시드 데이터 생성 완료!');
  console.log(`   - 수입 카테고리: ${incomeCategories.length}개`);
  console.log(`   - 지출 카테고리: ${expenseCategories.length}개`);

  // Notes 시스템 시드 데이터
  console.log('\n📝 메모 시스템 시드 데이터 생성 중...');

  // 기본 템플릿 생성
  console.log('📋 기본 템플릿 생성 중...');
  const templates = [
    {
      name: '회의록',
      description: '회의 내용을 기록하기 위한 템플릿',
      content: `# 회의록

## 일시
- 날짜:
- 시간:

## 참석자
-

## 안건
1.

## 논의 내용
-

## 결정 사항
-

## 다음 액션
- [ ] `,
      type: NoteType.MARKDOWN,
      isDefault: true,
    },
    {
      name: '업무 일지',
      description: '일일 업무 내용을 기록하기 위한 템플릿',
      content: `# 업무 일지 -

## 오늘의 할 일
- [ ]
- [ ]
- [ ]

## 완료한 작업
-

## 이슈/문제
-

## 내일 할 일
- [ ] `,
      type: NoteType.MARKDOWN,
      isDefault: true,
    },
    {
      name: '아이디어 메모',
      description: '새로운 아이디어를 빠르게 기록',
      content: `# 아이디어

## 핵심 아이디어


## 배경/동기


## 실행 방안
-

## 예상 결과
`,
      type: NoteType.MARKDOWN,
      isDefault: true,
    },
    {
      name: '할 일 목록',
      description: '체크리스트 형식의 할 일 목록',
      content: '',
      type: NoteType.CHECKLIST,
      isDefault: true,
    },
  ];

  for (const template of templates) {
    await prisma.noteTemplate.create({
      data: template,
    });
  }

  console.log(`✅ 템플릿 생성 완료: ${templates.length}개`);

  console.log('\n✨ 모든 시드 데이터 생성이 완료되었습니다!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

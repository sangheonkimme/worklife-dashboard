import { User, CategoryType } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { prisma } from '../lib/prisma';

// 기본 폴더 데이터 (Flutter 앱과 동일)
const DEFAULT_FOLDERS = [
  { name: '개인', color: '#7C8FFF', sortOrder: 0 },
  { name: '업무', color: '#4CAF50', sortOrder: 1 },
  { name: '학업', color: '#FFB74D', sortOrder: 2 },
  { name: '기타', color: '#FF7043', sortOrder: 3 },
];

// 기본 카테고리 데이터
const DEFAULT_INCOME_CATEGORIES = [
  { name: '급여', icon: 'IconBriefcase', color: '#4CAF50' },
  { name: '보너스', icon: 'IconGift', color: '#8BC34A' },
  { name: '투자수익', icon: 'IconTrendingUp', color: '#00BCD4' },
  { name: '기타 수입', icon: 'IconCash', color: '#009688' },
];

const DEFAULT_EXPENSE_CATEGORIES = [
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

/**
 * 새 사용자에게 기본 폴더와 카테고리를 생성합니다
 */
const createDefaultUserData = async (userId: string): Promise<void> => {
  // 기본 폴더 생성
  await prisma.folder.createMany({
    data: DEFAULT_FOLDERS.map((folder) => ({
      ...folder,
      userId,
    })),
  });

  // 기본 수입 카테고리 생성
  await prisma.category.createMany({
    data: DEFAULT_INCOME_CATEGORIES.map((cat) => ({
      ...cat,
      type: CategoryType.INCOME,
      userId,
    })),
  });

  // 기본 지출 카테고리 생성
  await prisma.category.createMany({
    data: DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
      ...cat,
      type: CategoryType.EXPENSE,
      userId,
    })),
  });
};

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export interface CreateGoogleUserData {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

/**
 * 사용자를 생성합니다
 * @param data 사용자 데이터
 * @returns 생성된 사용자 (비밀번호 제외)
 */
export const createUser = async (data: CreateUserData): Promise<Omit<User, 'password'>> => {
  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 기본 폴더와 카테고리 생성
  await createDefaultUserData(user.id);

  return user;
};

/**
 * 이메일로 사용자를 조회합니다
 * @param email 이메일
 * @returns 사용자 (비밀번호 포함)
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * ID로 사용자를 조회합니다 (비밀번호 제외)
 * @param id 사용자 ID
 * @returns 사용자 (비밀번호 제외)
 */
export const findUserById = async (id: string): Promise<Omit<User, 'password'> | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * ID로 사용자를 조회합니다 (비밀번호 포함)
 * @param id 사용자 ID
 * @returns 사용자 (비밀번호 포함)
 */
export const findUserByIdWithPassword = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * 사용자 정보를 업데이트합니다
 * @param id 사용자 ID
 * @param data 업데이트할 데이터
 * @returns 업데이트된 사용자 (비밀번호 제외)
 */
export const updateUser = async (
  id: string,
  data: UpdateUserData
): Promise<Omit<User, 'password'>> => {
  const updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

/**
 * 비밀번호를 검증합니다
 * @param plainPassword 평문 비밀번호
 * @param hashedPassword 해시된 비밀번호
 * @returns 일치 여부
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return comparePassword(plainPassword, hashedPassword);
};

/**
 * 이메일 중복을 확인합니다
 * @param email 이메일
 * @returns 중복 여부
 */
export const isEmailTaken = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return !!user;
};

/**
 * Google ID로 사용자를 조회합니다
 * @param googleId Google ID
 * @returns 사용자 (비밀번호 제외)
 */
export const findUserByGoogleId = async (googleId: string): Promise<Omit<User, 'password'> | null> => {
  return prisma.user.findUnique({
    where: { googleId },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Google 사용자를 생성합니다
 * @param data Google 사용자 데이터
 * @returns 생성된 사용자 (비밀번호 제외)
 */
export const createGoogleUser = async (data: CreateGoogleUserData): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      googleId: data.googleId,
      picture: data.picture,
      password: null, // Google 로그인은 비밀번호 불필요
    },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 기본 폴더와 카테고리 생성
  await createDefaultUserData(user.id);

  return user;
};

/**
 * 마지막 로그인 시간을 업데이트합니다
 * @param id 사용자 ID
 */
export const updateLastLoginAt = async (id: string): Promise<void> => {
  await prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
};

import { User } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { prisma } from '../lib/prisma';

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
      createdAt: true,
      updatedAt: true,
    },
  });

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
      createdAt: true,
      updatedAt: true,
    },
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

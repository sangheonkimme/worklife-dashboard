import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * 비밀번호를 해싱합니다
 * @param password 평문 비밀번호
 * @returns 해싱된 비밀번호
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * 비밀번호를 검증합니다
 * @param password 평문 비밀번호
 * @param hashedPassword 해싱된 비밀번호
 * @returns 일치 여부
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

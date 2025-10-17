import { z } from 'zod';

/**
 * 회원가입 검증 스키마
 */
export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ message: '이메일은 필수입니다' })
      .email('올바른 이메일 형식이 아닙니다'),
    password: z
      .string({ message: '비밀번호는 필수입니다' })
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'
      ),
    name: z
      .string({ message: '이름은 필수입니다' })
      .min(2, '이름은 최소 2자 이상이어야 합니다')
      .max(50, '이름은 최대 50자까지 가능합니다'),
  }),
});

/**
 * 로그인 검증 스키마
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: '이메일은 필수입니다' })
      .email('올바른 이메일 형식이 아닙니다'),
    password: z.string({ message: '비밀번호는 필수입니다' }),
  }),
});

/**
 * 프로필 업데이트 검증 스키마
 * 이메일은 로그인 ID로 사용되므로 변경 불가
 */
export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, '이름은 최소 2자 이상이어야 합니다')
      .max(50, '이름은 최대 50자까지 가능합니다')
      .optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'
      )
      .optional(),
  }),
});

// TypeScript 타입 추출
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];

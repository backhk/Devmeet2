import { z } from "zod";

// 회원가입 검증 스키마
export const RegisterSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식이 아닙니다." }),
  password: z.string().min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
  nickname: z.string().min(2, { message: "닉네임은 최소 2자 이상이어야 합니다." }),
});

// 로그인 검증 스키마
export const LoginSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식이 아닙니다." }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
});

// 게시글 작성 검증 스키마
export const CreatePostSchema = z.object({
  title: z.string().min(2, { message: "제목은 2자 이상 입력해주세요." }),
  content: z.string().min(5, { message: "본문은 5자 이상 입력해주세요." }),
  capacity: z.number().min(1, { message: "모집 인원은 최소 1명 이상이어야 합니다." }),
  techStack: z.array(z.string()).optional(),
  meetingType: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  contactLink: z.string().url({ message: "올바른 URL 형식이어야 합니다." }).optional().or(z.literal("")),
});

// 참여 신청 검증 스키마
export const CreateApplicationSchema = z.object({
  message: z.string().min(5, { message: "신청 한 줄 소개는 최소 5자 이상 입력해주세요." }),
});
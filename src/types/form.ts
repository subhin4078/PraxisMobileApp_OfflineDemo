import { TFunction } from "i18next";
import { z } from "zod";

import { NonEmptyString } from ".";

// Allowed symbols for password: !@#$%^&*()-_=+?[]{}|,.;:
const ALLOWED_SYMBOLS = "!@#$%^&*()\\-_=+?\\[\\]{}|,.;:";
const PASSWORD_CHAR_REGEX = new RegExp(`^[a-zA-Z0-9${ALLOWED_SYMBOLS}]+$`);

/* login */
export const createLoginFormSchema = (t: TFunction) =>
  z.object({
    userNameOrEmail: NonEmptyString(t("auth.usernameOrEmail")),
    password: z
      .string()
      .trim()
      .min(8, { message: t("auth.errors.passwordMinLength") })
      .max(64, { message: t("auth.errors.passwordMaxLength") })
      .regex(PASSWORD_CHAR_REGEX, {
        message: t("auth.errors.passwordFormat"),
      })
      .regex(/[A-Z]/, { message: t("auth.errors.passwordUppercase") })
      .regex(/[a-z]/, { message: t("auth.errors.passwordLowercase") })
      .regex(/[0-9]/, { message: t("auth.errors.passwordNumber") }),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginFormSchema>>;

/* register */
export const createRegisterFormSchema = (t: TFunction) =>
  z
    .object({
      username: z
        .string()
        .trim()
        .min(3, { message: t("auth.errors.usernameMinLength") })
        .max(10, { message: t("auth.errors.usernameMaxLength") })
        .regex(/^[a-zA-Z0-9]+$/, {
          message: t("auth.errors.usernameFormat"),
        }),
      email: z
        .string()
        .trim()
        .min(1, { message: `${t("auth.email")} is required` })
        .email(t("auth.errors.invalidEmail")),
      password: z
        .string()
        .trim()
        .min(8, { message: t("auth.errors.passwordMinLength") })
        .max(64, { message: t("auth.errors.passwordMaxLength") })
        .regex(PASSWORD_CHAR_REGEX, {
          message: t("auth.errors.passwordFormat"),
        })
        .regex(/[A-Z]/, { message: t("auth.errors.passwordUppercase") })
        .regex(/[a-z]/, { message: t("auth.errors.passwordLowercase") })
        .regex(/[0-9]/, { message: t("auth.errors.passwordNumber") }),
      confirmPassword: NonEmptyString(t("auth.confirmPassword")),
      fullName: z
        .string()
        .trim()
        .min(1, { message: t("auth.errors.required") })
        .max(60, { message: t("auth.errors.fullNameMaxLength") })
        .regex(/^[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaffA-Za-z\s]+$/, {
          message: t("auth.errors.fullNameFormat"),
        }),
      age: z
        .string()
        .trim()
        .min(1, { message: `${t("auth.age")} is required` })
        .regex(/^\d+$/, { message: t("auth.errors.invalidAge") })
        .refine(
          (val) => {
            const num = parseInt(val, 10);
            return num >= 6 && num <= 100;
          },
          { message: t("auth.errors.ageRange") },
        ),
      gender: z
        .string()
        .trim()
        .min(1, { message: `${t("auth.gender")} is required` }),
      grade: NonEmptyString(t("auth.grade")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.errors.passwordMismatch"),
      path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<
  ReturnType<typeof createRegisterFormSchema>
>;

/* edit profile */
export const createEditProfileFormSchema = (t: TFunction) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(1, { message: `${t("profile.fullName")} is required` })
      .max(60, { message: t("auth.errors.fullNameMaxLength") })
      .regex(/^[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaffA-Za-z\s]+$/, {
        message: t("auth.errors.fullNameFormat"),
      }),
    age: z
      .string()
      .trim()
      .min(1, { message: `${t("profile.age")} is required` })
      .regex(/^\d+$/, { message: t("profile.errors.invalidAge") })
      .refine(
        (val) => {
          const num = parseInt(val, 10);
          return num >= 6 && num <= 100;
        },
        { message: t("profile.errors.ageRange") },
      ),
    gender: z
      .string()
      .trim()
      .min(1, { message: `${t("profile.gender")} is required` }),
    grade: NonEmptyString(t("profile.grade")),
    school: z
      .string()
      .trim()
      .refine((val) => !val || /^[A-Za-z\s]+$/.test(val), {
        message: t("profile.errors.schoolFormat"),
      })
      .optional(),
    bio: z
      .string()
      .trim()
      .max(150, { message: t("auth.errors.bioMaxLength") })
      .optional(),
  });

export type EditProfileFormData = z.infer<
  ReturnType<typeof createEditProfileFormSchema>
>;

/* account */
export const createAccountFormSchema = (t: TFunction) =>
  z
    .object({
      username: z
        .string()
        .trim()
        .min(3, { message: t("auth.errors.usernameMinLength") })
        .max(10, { message: t("auth.errors.usernameMaxLength") })
        .regex(/^[a-zA-Z0-9]+$/, {
          message: t("auth.errors.usernameFormat"),
        }),
      email: z
        .string()
        .trim()
        .min(1, { message: `${t("auth.email")} is required` })
        .email(t("auth.errors.invalidEmail")),
      password: z
        .string()
        .trim()
        .min(8, {
          message: t("auth.errors.passwordMinLength"),
        })
        .max(64, { message: t("auth.errors.passwordMaxLength") })
        .regex(PASSWORD_CHAR_REGEX, {
          message: t("auth.errors.passwordFormat"),
        })
        .regex(/[A-Z]/, { message: t("auth.errors.passwordUppercase") })
        .regex(/[a-z]/, { message: t("auth.errors.passwordLowercase") })
        .regex(/[0-9]/, { message: t("auth.errors.passwordNumber") }),
      confirmPassword: NonEmptyString(t("auth.confirmPassword")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.errors.passwordMismatch"),
      path: ["confirmPassword"],
    });

export type AccountFormData = z.infer<
  ReturnType<typeof createAccountFormSchema>
>;

import { TestUserEntity } from "../types/test-user.dto.js";

/**
 * Test users.
 * These can be used to for any testing, and will be seeded before every test run.
 *
 * THIS IS THE ONLY PLACE WITH SOME COUPLING BETWEEN THE FRONT AND THE BACK END
 * IMPLEMENTATIONS AS THE USER PASSWORD AND SERVER PASSWORD ARE DIFFERENT, SO
 * CONSUMERS OF THIS DATA MUST DECIDE WHICH ONE THEY NEED TO USE FOR TESTING.
 *
 */
export const testUser1: TestUserEntity = Object.freeze({
	id: "90938b63-3b14-4b18-8185-b3cfa5de2d6a",
	email: "testUser1@example.com",
	displayName: "testUser1",
	password: "password1234!",
	verifiedAt: "2022-07-11T18:20:32.482Z",
	firstVerifiedAt: "2022-07-11T18:20:32.482Z",
	role: "user",
	createdAt: "2022-07-11T18:17:43.784Z",
	updatedAt: "2022-07-11T18:20:32.482Z",
	passwordHash: "$2b$12$QhS3GUhbHJHUEihg8onMiubZtdqgdXZS7wsBVKxbXUtoCTmduudTa",
});

export const testUser2Unverified: TestUserEntity = Object.freeze({
	id: "73852037-a8fc-42ec-bf8f-9e7314e1eabc",
	email: "testUser2Unverified@example.com",
	displayName: "testUser2Unverified",
	password: "amazingpassword42",
	verifiedAt: null,
	firstVerifiedAt: null,
	role: "user",
	createdAt: "2022-07-11T18:17:43.784Z",
	updatedAt: "2022-07-11T18:17:43.784Z",
	passwordHash: "$2b$12$9UhtDT8vPJaNXseHmJznhOTPTNKcDiV0mhHkNJJPm/QfDKER5S/CS",
});

export const testAdminUser1: TestUserEntity = Object.freeze({
	id: "98f4cb22-7815-4785-b659-3285fb06dacf",
	email: "testAdminUser1@example.com",
	displayName: "testAdminUser1",
	password: "amazingpassword42",
	verifiedAt: "2022-07-11T18:20:32.482Z",
	firstVerifiedAt: "2022-07-11T18:20:32.482Z",
	role: "admin",
	createdAt: "2022-07-11T18:17:43.784Z",
	updatedAt: "2022-07-11T19:25:43.784Z",
	passwordHash: "$2b$12$8x4e8E26Y.hpL.e5t.6LoOJvP7eCcxJbhFY3OT7xUQ3iEkyfbpyHm",
});

export const testAdminUser2Unverified: TestUserEntity = Object.freeze({
	id: "0e6d936b-e659-4c7a-99d5-a911dca14d33",
	email: "testAdminUser2Unverified@example.com",
	displayName: "testAdminUser2Unverified",
	password: "amazingpassword42",
	verifiedAt: null,
	firstVerifiedAt: null,
	role: "admin",
	createdAt: "2022-07-11T18:17:43.784Z",
	updatedAt: "2022-07-11T19:25:43.784Z",
	passwordHash: "$2b$12$32KFkBCMXOtE7dtyyMp1lugx6yCvEbxWGC87pIVAtjwFvbO3fOuIK",
});

/**
 * Example users.
 * These can be used for user creation tests etc.
 * They will not be seeded before every test, but will be cleaned up if found.
 *
 * THIS IS THE ONLY PLACE WITH SOME COUPLING BETWEEN THE FRONT AND THE BACK END
 * IMPLEMENTATIONS AS THE USER PASSWORD AND SERVER PASSWORD ARE DIFFERENT, SO
 * CONSUMERS OF THIS DATA MUST DECIDE WHICH ONE THEY NEED TO USE FOR TESTING.
 */
export const exampleUser1 = Object.freeze({
	email: "exampleUser1@example.com",
	displayName: "exampleUser1",
	password: "password1234!",
});

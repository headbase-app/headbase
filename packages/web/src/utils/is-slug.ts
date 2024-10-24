/**
 * Validate if a string is a slug
 *
 * A slug is defined as a string with lowercase chars and digits with optional dashes. There can be
 * no consecutive dashes or dashes at the start or end of the string.
 * For example 'example1' and 'example-test-one1'
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isValidSlug = /^[a-z0-9](-?[a-z0-9])*$/.test

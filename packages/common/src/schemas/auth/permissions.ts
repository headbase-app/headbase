import {z} from "zod"

/**
 * Permissions are used to control access to server resources and actions.
 *
 * All permissions have the following format as a convention:
 * 	<resource>:<action> OR <resource>:<action>:<access>
 * For example:
 * 	changes:create
 * 		- 'changes' is the resource
 * 		- 'create' is the action (could be any CRUD actions)
 * 		- there is no 'access' present, so this scope only grants permission to a users own changes.
 * 	changes:delete:all
 * 		- 'users' is the resource
 * 		- 'delete' is the action
 * 		- 'all' signifies that this scope grants permissions to the changes of any user.
 */
export const Permissions = z.enum([
	// Scopes limited to the current user
	"vaults:create",
	"vaults:retrieve",
	"vaults:update",
	"vaults:delete",

	"item:create",
	"item:retrieve",
	"item:delete",

	"users:create",
	"users:retrieve",
	"users:update",
	"users:delete",

	// Unscoped permissions giving access to all content
	"vaults:create:all",
	"vaults:retrieve:all",
	"vaults:update:all",
	"vaults:delete:all",

	"item:create:all",
	"item:retrieve:all",
	"item:delete:all",

	"users:create:all",
	"users:retrieve:all",
	"users:update:all",
	"users:delete:all",

	// Other permissions
	"server-settings:retrieve",
	"server-settings:update"
])
export type Permissions = z.infer<typeof Permissions>

/**
 * Roles are assigned to users and define a set of permissions.
 */
export const Roles = z.enum([
	"user",
	"admin"
]);
export type Roles = z.infer<typeof Roles>

/**
 * Defines the type of role permissions.
 */
export type RolePermissions = {
	[key in Roles]: {
		inherit?: Roles,
		permissions: Permissions[]
	};
};

/**
 * This object assigns permissions to each role.
 * Roles are able to inherit from other roles and also include their own permissions too.
 */
export const RolePermissions: RolePermissions = {
	user: {
		permissions: [
			"vaults:create",
			"vaults:retrieve",
			"vaults:update",
			"vaults:delete",

			"item:create",
			"item:retrieve",
			"item:delete",

			"users:create",
			"users:retrieve",
			"users:update",
			"users:delete",
		]
	},
	admin: {
		inherit: "user",
		permissions: [
			"vaults:create:all",
			"vaults:retrieve:all",
			"vaults:update:all",
			"vaults:delete:all",

			"item:create:all",
			"item:retrieve:all",
			"item:delete:all",

			"users:create:all",
			"users:retrieve:all",
			"users:update:all",
			"users:delete:all",

			"server-settings:retrieve",
			"server-settings:update"
		]
	}
}

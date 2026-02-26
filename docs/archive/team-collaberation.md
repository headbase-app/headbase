Consider adding team collaberation, allowing multiple users to share the same vault.

- The vault would still be client-side encrypted so users would still need to know the password
- Server could be edited to include `teams` table, `team_members` to link `users` to `teams` and then vaults have a `teamId` rather than an `ownerId`
- Should users be able to create personal vaults without teams?
- Should users just have a "personal" team? Can a user delete a personal team or create more?
- What would be the limits for creating teams? Would their be a limit to the number of users allowed in a team?
- I could experiment with adding some sort of seat based restriction? Could users have to pay for sharing features?
- Make it clear that local-first architecture means that once you've given access to a vault, a user may make their own copy 

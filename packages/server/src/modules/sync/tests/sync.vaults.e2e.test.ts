import {describe, test, beforeAll, beforeEach, afterAll, expect, afterEach } from "vitest";
import {Server} from "node:http";
import testSocket from "superwstest"

import {TestHelper} from "@testing/test-helper.js";
import {testUser1} from "@testing/data/users.js";
import {exampleVault1} from "@testing/data/vaults.js";

let server: Server;
const testHelper = new TestHelper();
beforeAll(async () => {
  await testHelper.beforeAll();
});
afterAll(async () => {
  await testHelper.afterAll()
});
beforeEach(async () => {
  await testHelper.beforeEach()
  server = testHelper.server.listen(42100);
});
afterEach(async () => {
  server.close()
});


describe.todo("Sync Module - Vault Events",() => {
  describe("/v1/sync [WEBSOCKET]", () => {
    test("When a vault is created by the same user with different sessions, an event should be received", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id)
      const accessToken2 = await testHelper.getUserAccessToken(testUser1.id)

      const {body} = await testHelper.client
          .get("/v1/sync/ticket")
          .set("Authorization", `Bearer ${accessToken}`)
          .send()

      const protocol = `headbase.ticket.${body.ticket}`

      await testSocket(server)
          .ws("/v1/sync", [protocol])
          .set("Origin", "http://localhost:42101") // todo: flaky on hardcoded values
          .expectJson({type: "welcome"})
          .exec(async () => {
            // Create example vault
            await testHelper.client
                .post("/v1/vaults")
                .set("Authorization", `Bearer ${accessToken2}`)
                .send({...exampleVault1, ownerId: testUser1.id});
          })
          .expectJson((event) => {
            expect(event).toEqual(expect.objectContaining({
              type: "vault-create",
              detail: {
                // todo: session id should be removed before emitting to clients?
                sessionId: expect.any(String),
                vault: {
                  ...exampleVault1,
                  ownerId: testUser1.id,
                }
              }
            }))
          })
    })

    test("When a vault is created by the same user using the same session, no event should be received", async () => {
      const accessToken = await testHelper.getUserAccessToken(testUser1.id)
      const {body} = await testHelper.client
          .get("/v1/sync/ticket")
          .set("Authorization", `Bearer ${accessToken}`)
          .send()

      const protocol = `headbase.ticket.${body.ticket}`
      await testSocket(server)
          .ws("/v1/sync", [protocol])
          .set("Origin", "http://localhost:42101") // todo: flaky on hardcoded values
          .expectJson({type: "welcome"})
          .exec(async (ws) => {
            ws.addEventListener("message", () => {
              throw new Error("Unexpectedly received message")
            })
          })
          // No event should be received after the next request, so add a listener now to fail the test if that occurs.
          .exec(async (ws) => {
            ws.on("message", () => {
              throw new Error("Unexpectedly received message")
            })
          })
          .exec(async () => {
            // Create example vault
            await testHelper.client
                .post("/v1/vaults")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({...exampleVault1, ownerId: testUser1.id});
          })
          // We wait just to make sure that the event is not going to be returned
          .wait(2000)
    })
  })
})

import {describe, expect, test} from "vitest";
import {RelayService} from "../relay.service.js";
import {ConfigOverride, ConfigService} from "../../../services/config/config.service.js";
import {LoggerService} from "../../../services/logger/logger.service.js";
import {testPeerIds} from "../../../../tests/helpers/data.js";

const MOCK_CONFIG = {relay: {accessSecret: null}} satisfies ConfigOverride
const configService = new ConfigService(MOCK_CONFIG);
const loggerService = new LoggerService();

describe("RelayService - msg/all messages", async () => {
    test("Should relay message to all connected peers", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.three, knownAs: "peer-3"})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "msg/all", data: "test"})
        expect(replies).toEqual([
            {
                peers: [testPeerIds.two, testPeerIds.three],
                message: {
                    kind: "msg/all",
                    data: "test",
                    from: testPeerIds.one,
                }
            }
        ])
    })

    test("Should not relay to sending peer", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-1"})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "msg/all", data: "test"})
        expect(replies.at(0)?.peers).not.toContain(testPeerIds.one)
    })

    test("Should add 'from' property to message", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-1"})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "msg/all", data: "test"})
        expect(replies.at(0)?.message).toEqual(expect.objectContaining({
            from: testPeerIds.one,
        }))
    })

    test("Should not leak message between relays", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"})
        await relayService.connect({rid: "relay-2", pid: testPeerIds.three, knownAs: "peer-3"})

        const replies = await relayService.processMessage(testPeerIds.three, {kind: "msg/all", data: "test"})
        expect(replies).toEqual([])
    })
})

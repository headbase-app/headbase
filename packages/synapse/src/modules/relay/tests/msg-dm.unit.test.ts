import {describe, expect, test} from "vitest";
import {RelayService} from "../relay.service.js";
import {ConfigOverride, ConfigService} from "../../../services/config/config.service.js";
import {LoggerService} from "../../../services/logger/logger.service.js";
import {testPeerIds} from "../../../../tests/helpers/data.js";

const MOCK_CONFIG = {relay: {accessSecret: null}} satisfies ConfigOverride
const configService = new ConfigService(MOCK_CONFIG);
const loggerService = new LoggerService();

describe("RelayService - msg/dm messages", async () => {
    test("Should send message to requested peer only", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.three, knownAs: "peer-3"})
        await relayService.connect({rid: "relay-2", pid: testPeerIds.four, knownAs: "peer-4"})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "msg/dm", to: [testPeerIds.two, testPeerIds.three], data: "test"})
        expect(replies).toEqual([
            {
                peers: [testPeerIds.two, testPeerIds.three],
                message: {
                    kind: "msg/dm",
                    to: [testPeerIds.two, testPeerIds.three],
                    from: testPeerIds.one,
                    data: "test",
                }
            }
        ])
    })

    test("Should add 'from' property to message", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"})
        await relayService.connect({rid: "relay-2", pid: testPeerIds.three, knownAs: "peer-3"})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "msg/dm", to: [testPeerIds.two], data: "test"})
        expect(replies.at(0)?.message).toEqual(expect.objectContaining({
            from: testPeerIds.one,
        }))
    })
})

import {describe, expect, test} from "vitest";

import {RelayService} from "../relay.service.js";
import {testPeerIds} from "../../../../tests/helpers/data.js";
import {ConfigOverride, ConfigService} from "../../../services/config/config.service.js";
import {LoggerService} from "../../../services/logger/logger.service.js";

const MOCK_CONFIG = {relay: {accessSecret: null}} satisfies ConfigOverride
const configService = new ConfigService(MOCK_CONFIG);
const loggerService = new LoggerService();

describe("RelayService - peers/* messages", () => {
    test("Should reply to peers/discover message with peers/list", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.three, knownAs: null})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "peers/discover"})
        expect(replies).toEqual([
            {
                peers: [testPeerIds.one],
                message: {
                    kind: "peers/list",
                    peers: [
                        {pid: testPeerIds.one, knownAs: "peer-1"},
                        {pid: testPeerIds.two, knownAs: "peer-2"},
                        {pid: testPeerIds.three, knownAs: null},
                    ]
                }
            }
        ])
    })

    test("Should not relay peers/discover message to other peers", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "peers/discover"})
        expect(replies.at(0)?.peers).toEqual([testPeerIds.one])
    })

    test("Should not leak peers/* messages to other relays", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
        await relayService.connect({rid: "relay-2", pid: testPeerIds.two, knownAs: "peer-2"})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "peers/discover"})
        expect(replies.at(0)?.peers).toEqual([testPeerIds.one])
    })
})

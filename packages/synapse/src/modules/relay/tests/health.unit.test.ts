import {describe, expect, test} from "vitest";
import {RelayService} from "../relay.service.js";
import {ConfigOverride, ConfigService} from "../../../services/config/config.service.js";
import {LoggerService} from "../../../services/logger/logger.service.js";
import {testPeerIds} from "../../../../tests/helpers/data.js";

const MOCK_CONFIG = {relay: {accessSecret: null}} satisfies ConfigOverride
const configService = new ConfigService(MOCK_CONFIG);
const loggerService = new LoggerService();

describe("RelayService - health/* messages", async () => {
    test("Should reply to health/ping message with health/pong", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "health/ping"})
        expect(replies).toEqual([{
            peers: [testPeerIds.one],
            message: { kind: "health/pong" }
        }])
    })

    test("Should not reply to pong messages", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})

        const replies = await relayService.processMessage(testPeerIds.one, {kind: "health/pong"})
        expect(replies).toEqual([])
    })

    describe("Should not relay health/* messages between peers", async () => {
        test("Should not relay health/ping", async () => {
            const relayService = new RelayService(configService, loggerService);
            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"})
            await relayService.connect({rid: "relay-2", pid: testPeerIds.three, knownAs: "peer-3"})

            const replies = await relayService.processMessage(testPeerIds.one, {kind: "health/ping"})
            expect(replies.at(0)?.peers).toEqual([testPeerIds.one])
        })

        test("Should not relay health/pong", async () => {
            const relayService = new RelayService(configService, loggerService);
            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"})
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"})
            await relayService.connect({rid: "relay-2", pid: testPeerIds.three, knownAs: "peer-3"})

            const replies = await relayService.processMessage(testPeerIds.one, {kind: "health/pong"})
            expect(replies).toEqual([])
        })
    })
})

import {describe, expect, test, vi} from "vitest";

import {RelayService} from "../relay.service.js";
import {testPeerIds} from "../../../../tests/helpers/data.js";
import {ConfigOverride, ConfigService} from "../../../services/config/config.service.js";
import {LoggerService} from "../../../services/logger/logger.service.js";

const MOCK_CONFIG = {relay: {accessSecret: "TESTING"}} satisfies ConfigOverride
const configService = new ConfigService(MOCK_CONFIG);
const loggerService = new LoggerService();

describe("RelayService - connect", () => {
    describe("Access Secret ", async () => {
        test("Given valid access secret, Then peer should be connected", async () => {
            const relayService = new RelayService(configService, loggerService);

            const connectSpy = vi.spyOn(relayService, "connect");
            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            expect(connectSpy).toHaveResolved()
        })

        test("Given invalid access secret, Then connection should be denied", async () => {
            const relayService = new RelayService(configService, loggerService);
            await expect(
                relayService.connect({
                    rid: "relay-1",
                    pid: testPeerIds.one,
                    knownAs: "peer-1"
                }, "INVALID")
            ).rejects.toThrow()
        })

        test("Given missing access secret, Then connection should be denied", async () => {
            const relayService = new RelayService(configService, loggerService);
            await expect(
                relayService.connect({
                    rid: "relay-1",
                    pid: testPeerIds.one,
                    knownAs: "peer-1"
                })
            ).rejects.toThrow()
        })
    })

    describe("Peer Data", async () => {
        test("Given unique peer ids, Then connections should succeed", async () => {
            const relayService = new RelayService(configService, loggerService);

            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)
        })

        test("Given duplicate peer IDs within same relay, Then connection should be denied", async () => {
            const relayService = new RelayService(configService, loggerService);

            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret);
            await expect(
                relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            ).rejects.toThrow();
        })

        test("Given duplicate peer IDs across different relays, Then connection should be denied", async () => {
            const relayService = new RelayService(configService, loggerService);

            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret);
            await expect(
                relayService.connect({rid: "relay-2", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            ).rejects.toThrow();
        })
    })

    describe("Connection 'peers/list' Response", () => {
        test("Given successful connection, a peer/list message should be returned", async () => {
            const relayService = new RelayService(configService, loggerService);

            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

            const replies = await relayService.connect({rid: "relay-1", pid: testPeerIds.three, knownAs: "peer-3"}, MOCK_CONFIG.relay.accessSecret)
            expect(replies).toEqual([{
                peers: [testPeerIds.one, testPeerIds.two, testPeerIds.three],
                message: {
                    kind: "peers/list",
                    peers: [
                        {
                            pid: testPeerIds.one,
                            knownAs: "peer-1"
                        },
                        {
                            pid: testPeerIds.two,
                            knownAs: "peer-2"
                        },
                        {
                            pid: testPeerIds.three,
                            knownAs: "peer-3"
                        }
                    ]
                }
            }])
        })

        test("Should not leak peer/list connection responses between relays", async () => {
            const relayService = new RelayService(configService, loggerService);

            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            const replies = await relayService.connect({rid: "relay-2", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

            expect(replies).toEqual([{
                peers: [testPeerIds.two],
                message: {
                    kind: "peers/list",
                    peers: [
                        {
                            pid: testPeerIds.two,
                            knownAs: "peer-2"
                        },
                    ]
                }
            }])
        })
    })
})
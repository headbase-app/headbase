import {describe, expect, test} from "vitest";
import {RelayService} from "../relay.service.js";
import {testPeerIds} from "../../../../tests/helpers/data.js";
import {ConfigOverride, ConfigService} from "../../../services/config/config.service.js";
import {LoggerService} from "../../../services/logger/logger.service.js";

const MOCK_CONFIG = {relay: {accessSecret: "TESTING"}} satisfies ConfigOverride
const configService = new ConfigService(MOCK_CONFIG);
const loggerService = new LoggerService();

describe("RelayService - topic/* messages", () => {
    describe("Should filter messages after 'topics/subscribe' sent", () => {
        test("Should match single topic condition", async () => {
            const relayService = new RelayService(configService, loggerService);
            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

            await relayService.topicSubscribe(testPeerIds.one, ["example"])

            const replies = await relayService.processMessage(testPeerIds.two, {
                kind: "msg/all", data: "test", topics: ["example"],
            })
            expect(replies).toEqual([
                {
                    peers: [testPeerIds.one],
                    message: {
                        kind: "msg/all",
                        data: "test",
                        from: testPeerIds.two,
                        topics: ["example"],
                    }
                }
            ])
        })

        test("Should match group topic condition", async () => {
            const relayService = new RelayService(configService, loggerService);
            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

            await relayService.topicSubscribe(testPeerIds.one, [["example", "example2"]])

            const replies = await relayService.processMessage(testPeerIds.two, {
                kind: "msg/all", data: "test", topics: ["example", "example2"],
            })
            expect(replies).toEqual([
                {
                    peers: [testPeerIds.one],
                    message: {
                        kind: "msg/all",
                        data: "test",
                        from: testPeerIds.two,
                        topics: ["example", "example2"],
                    }
                }
            ])
        })

        test("Should match if one of many conditions if met", async () => {
            const relayService = new RelayService(configService, loggerService);
            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

            await relayService.topicSubscribe(testPeerIds.one, ["example", "example2"])

            const replies = await relayService.processMessage(testPeerIds.two, {
                kind: "msg/all", data: "test", topics: ["example"],
            })
            expect(replies).toEqual([
                {
                    peers: [testPeerIds.one],
                    message: {
                        kind: "msg/all",
                        data: "test",
                        from: testPeerIds.two,
                        topics: ["example"],
                    }
                }
            ])
        })

        test("Should filter out if topics not met", async () => {
            const relayService = new RelayService(configService, loggerService);
            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

            await relayService.topicSubscribe(testPeerIds.one, ["example", "example2"])

            const replies = await relayService.processMessage(testPeerIds.two, {
                kind: "msg/all", data: "test", topics: ["example3"],
            })
            expect(replies).toEqual([])
        })

        test("Should filter out if only one of group met", async () => {
            const relayService = new RelayService(configService, loggerService);
            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

            await relayService.topicSubscribe(testPeerIds.one, ["example", ["example2", "example3"]])

            const replies = await relayService.processMessage(testPeerIds.two, {
                kind: "msg/all", data: "test", topics: ["example3"],
            })
            expect(replies).toEqual([])
        })

        test("Should filter out messages without topics", async () => {
            const relayService = new RelayService(configService, loggerService);
            await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
            await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

            await relayService.topicSubscribe(testPeerIds.one, ["example", ["example2", "example3"]])

            const replies = await relayService.processMessage(testPeerIds.two, {
                kind: "msg/all", data: "test",
            })
            expect(replies).toEqual([])
        })
    })

    test("Should clear subscription after 'topics/unsubscribe' sent", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

        await relayService.topicSubscribe(testPeerIds.one, ["example"])

        // Should not relay message with no topics
        const replies = await relayService.processMessage(testPeerIds.two, {kind: "msg/all", data: "test"})
        expect(replies).toEqual([])

        // Should not relay message with no topics
        await relayService.topicUnsubscribe(testPeerIds.one)

        // Should now relay message after unsubscribing
        const replies2 = await relayService.processMessage(testPeerIds.two, {kind: "msg/all", data: "test"})
        expect(replies2).toEqual([{
            message: {
                kind: "msg/all", data: "test", from: testPeerIds.two,
            },
            peers: [testPeerIds.one]
        }])
    })

    test("Should replace existing subscription after new 'topics/subscribe' sent", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
        await relayService.connect({rid: "relay-1", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

        await relayService.topicSubscribe(testPeerIds.one, ["example"])

        // Should relay "example" topic messages
        const replies = await relayService.processMessage(testPeerIds.two, {kind: "msg/all", data: "test", topics: ["example"]})
        expect(replies).toEqual([{peers: [testPeerIds.one], message: {kind: "msg/all", data: "test", topics: ["example"], from: testPeerIds.two}}])

        // Should NOT relay "example2" topic messages
        const replies2 = await relayService.processMessage(testPeerIds.two, {kind: "msg/all", data: "test", topics: ["example2"]})
        expect(replies2).toEqual([])

        // Should not relay message with no topic messages
        await relayService.topicSubscribe(testPeerIds.one, ["example2"])

        // Should NOT relay "example" topic messages
        const replies3 = await relayService.processMessage(testPeerIds.two, {kind: "msg/all", data: "test", topics: ["example"]})
        expect(replies3).toEqual([])

        // Should relay "example2" topic messages
        const replies4 = await relayService.processMessage(testPeerIds.two, {kind: "msg/all", data: "test", topics: ["example2"]})
        expect(replies4).toEqual([{peers: [testPeerIds.one], message: {kind: "msg/all", data: "test", topics: ["example2"], from: testPeerIds.two}}])
    })

    test.todo("Should not relay topic/* messages to other peers", async () => {
        // This is a valid behaviour test, but how to actually check?
        // relayService.topicSubscribe and related code can not ever do this.
    });

    test("Should not leak topic message between relays", async () => {
        const relayService = new RelayService(configService, loggerService);
        await relayService.connect({rid: "relay-1", pid: testPeerIds.one, knownAs: "peer-1"}, MOCK_CONFIG.relay.accessSecret)
        await relayService.connect({rid: "relay-2", pid: testPeerIds.two, knownAs: "peer-2"}, MOCK_CONFIG.relay.accessSecret)

        await relayService.topicSubscribe(testPeerIds.one, ["example"])
        await relayService.topicSubscribe(testPeerIds.two, ["example"])

        const replies = await relayService.processMessage(testPeerIds.two, {kind: "msg/all", data: "test", topics: ["example"]})
        expect(replies).toEqual([])
    });
})

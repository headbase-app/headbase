import {z} from "zod";

import {PeerSentMessageSchema, RelaySentMessageSchema} from "../../services/validation/messages.js";
import {ConfigService} from "../../services/config/config.service.js";
import {LoggerService} from "../../services/logger/logger.service.js";

export const PeerData = z.object({
	// The relay identifier used to connect peers together.
	rid: z.string(),
	// A unique identifier supplied by the peer, used for directing messages.
	pid: z.uuidv4(),
	// An optional human-readable name supplied by the peer
	knownAs: z.string().nullable(),
})
export type PeerData = z.infer<typeof PeerData>

export interface PeerConnectionData extends PeerData {
	topics: (string | string[])[]
}

export interface MessageReply {
	peers: string[]
	message: RelaySentMessageSchema
}

export type RelayLookup = Map<string, string[]>
export type PeerLookup = Map<string, PeerConnectionData>

export class RelayService {
	#relayLookup: RelayLookup;
	#peerLookup: PeerLookup;

	constructor(
		private readonly configService: ConfigService,
		private readonly loggerService: LoggerService,
	) {
		this.#relayLookup = new Map();
		this.#peerLookup = new Map();
	}

	async connect(peer: PeerData, accessSecret?: string) {
		if (this.configService.config().relay.accessSecret) {
			if (typeof accessSecret !== "string" || accessSecret !== this.configService.config().relay.accessSecret) {
				throw new Error("[connect] denied connection due to missing or invalid admin token")
			}
		}
		if (this.#peerLookup.get(peer.pid)) {
			throw new Error("[connect] denied connection due to existing peer with same id ")
		}

		const relay = this.#relayLookup.get(peer.rid) ?? []
		this.#relayLookup.set(peer.rid, [...relay, peer.pid]);
		this.#peerLookup.set(peer.pid, {
			...peer,
			topics: []
		})

		return [this.#createPeerListReply(peer.rid)]
	}

	async processMessage(from: string, message: PeerSentMessageSchema): Promise<MessageReply[]> {
		const peer = this.#peerLookup.get(from);
		if (!peer) {
			throw new Error("[messages] The sending 'from' peer could not be found.")
		}

		if (message.kind === "health/pong") {
			return []
		}
		if (message.kind === "health/ping") {
			return [{
				peers: [from],
				message: {kind: "health/pong"},
			}];
		}
		if (message.kind === "peers/discover") {
			return [this.#createPeerListReply(peer.rid, [from])]
		}
		if (message.kind === "topics/subscribe") {
			await this.topicSubscribe(peer.pid, message.topics)
			return []
		}
		if (message.kind === "topics/unsubscribe") {
			await this.topicUnsubscribe(peer.pid)
			return []
		}
		if (message.kind === "msg/dm") {
			return [{
				peers: message.to,
				message: {
					...message,
					from
				}
			}]
		}

		// Normal message relaying, including handling peer topic subscriptions.
		const pids = this.#relayLookup.get(peer.rid) ?? [];
		const targetPeers = pids
			.filter(pid => {
				if (pid === from) return false;

				const peer = this.#peerLookup.get(pid)!
				if (peer.topics.length === 0 || message.topics?.length === 0) {
					return true;
				}

				for (const topic of peer.topics) {
					if (typeof topic === "string") {
						if (message.topics?.includes(topic)) {
							return true;
						}
					}
					else if (new Set(topic).isSubsetOf(new Set(message.topics))) {
						return true;
                    }

				}

				return false;
			})

		if (targetPeers.length === 0) {
			return []
		}

		return [{
			peers: targetPeers,
			message: {
				...message,
				from
			}
		}]
	}

	async disconnect(pid: string) {
		const peer = this.#peerLookup.get(pid);
		if (!peer) {
			throw new Error("[messages] The requested peer to disconnect was not found.")
		}

		this.#peerLookup.delete(pid);
		const relayPids = this.#relayLookup.get(peer.rid) ?? [];
		this.#relayLookup.set(peer.rid, relayPids.filter(relayPid => relayPid !== pid));
	}

	async topicSubscribe(pid: string, subscriptions: PeerConnectionData['topics']) {
		const peer = this.#peerLookup.get(pid);
		if (!peer) {
			throw new Error("[messages] The requested peer for topic unsubscribe was not found.")
		}

		this.#peerLookup.set(pid, {
			...peer,
			topics: subscriptions,
		});
	}

	async topicUnsubscribe(pid: string) {
		const peer = this.#peerLookup.get(pid);
		if (!peer) {
			throw new Error("[messages] The requested peer for topic unsubscribe was not found.")
		}

		this.#peerLookup.set(pid, {
			...peer,
			topics: []
		});
	}

	#createPeerListReply(rid: string, replyPeers?: string[]): MessageReply {
		const pids = this.#relayLookup.get(rid) ?? [];
		const peers = pids.map(pid => this.#peerLookup.get(pid)!);

		return {
			peers: replyPeers ?? peers.map(peer => peer.pid),
			message: {
				kind: "peers/list",
				peers: peers.map(peer => ({pid: peer.pid, knownAs: peer.knownAs }))
			}
		}
	}
}

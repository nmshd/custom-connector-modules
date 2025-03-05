import { ConnectorRuntimeModule, ConnectorRuntimeModuleConfiguration, Envelope, HttpError } from "@nmshd/connector-types";
import { RelationshipChangedEvent } from "@nmshd/runtime";

export default class TheStuffTheDemoTeamDidModule extends ConnectorRuntimeModule<ConnectorRuntimeModuleConfiguration> {
    public init(): void {
        this.logger.info("Hello from the custom module!");

        this.runtime.infrastructure.httpServer.addEndpoint("post", "/university-X/send-degree", false, async (req, res) => {
            const services = this.runtime.getServices();

            const peer = req.body.peer;
            if (!peer) {
                res.status(400).send(Envelope.error(new HttpError("error.peer.missing", "the peer is missing in the request body"), this.connectorMode));
                return;
            }

            const request = await services.consumptionServices.outgoingRequests.create({
                peer,
                content: { items: [{ "@type": "AuthenticationRequestItem", mustBeAccepted: true, title: "hey :)" }] }
            });

            const message = await services.transportServices.messages.sendMessage({
                recipients: [peer],
                content: request.value.content
            });

            res.send(Envelope.ok(message.value));
        });
    }

    public async start(): Promise<void> {
        this.subscribeToEvent<RelationshipChangedEvent>(RelationshipChangedEvent, (event) => {
            this.logger.info("Relationship Changed", event.data);
        });
    }
}

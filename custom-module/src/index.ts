import { ConnectorRuntimeModule, ConnectorRuntimeModuleConfiguration, Envelope, HttpError } from "@nmshd/connector-types";
import { Mail, ResponseResult } from "@nmshd/content";
import { LocalRequestStatus, OutgoingRequestStatusChangedEvent } from "@nmshd/runtime";
import { randomDogName } from "dog-names";

export default class CustomModule extends ConnectorRuntimeModule<ConnectorRuntimeModuleConfiguration> {
    public init(): void {
        this.logger.info("Hello from the custom module!");

        this.runtime.infrastructure.httpServer.addEndpoint("post", "/university-X/2fa", true, async (req, res) => {
            const services = this.runtime.getServices();

            const peer = req.body.peer;
            if (!peer) {
                res.status(400).send(Envelope.error(new HttpError("error.peer.missing", "the peer is missing in the request body"), this.connectorMode));
                return;
            }

            const twoFactorText = req.body.twoFactorText;
            if (!twoFactorText) {
                res.status(400).send(Envelope.error(new HttpError("error.twoFactorText.missing", "the twoFactorText is missing in the request body"), this.connectorMode));
                return;
            }

            if (typeof twoFactorText !== "string") {
                res.status(400).send(Envelope.error(new HttpError("error.twoFactorText.invalid", "the twoFactorText must be a string"), this.connectorMode));
                return;
            }

            const request = await services.consumptionServices.outgoingRequests.create({
                peer,
                content: { items: [{ "@type": "AuthenticationRequestItem", mustBeAccepted: true, title: twoFactorText }] }
            });
            if (request.isError) throw request.error;

            const message = await services.transportServices.messages.sendMessage({
                recipients: [peer],
                content: request.value.content
            });
            if (message.isError) throw message.error;

            res.send(Envelope.ok(message.value));
        });

        this.runtime.infrastructure.httpServer.addEndpoint("get", "/dog", false, async (_, res) => {
            res.send(Envelope.ok({ dogName: randomDogName() }));
        });
    }

    public async start(): Promise<void> {
        this.subscribeToEvent<OutgoingRequestStatusChangedEvent>(OutgoingRequestStatusChangedEvent, async (event) => {
            const data = event.data;
            const request = data.request;

            if (data.newStatus !== LocalRequestStatus.Completed) return;

            if (request.content.items.length !== 1 || request.content.items[0]["@type"] !== "AuthenticationRequestItem") return;

            const services = this.runtime.getServices();
            if (request.response!.content.result === ResponseResult.Accepted) {
                await services.transportServices.messages.sendMessage({
                    recipients: [request.peer],
                    content: Mail.from({ to: [request.peer], subject: "Login Accepted", body: "We logged you in! Please check your browser to continue." }).toJSON()
                });
            } else {
                await services.transportServices.messages.sendMessage({
                    recipients: [request.peer],
                    content: Mail.from({
                        to: [request.peer],
                        subject: "Login Denied",
                        body: "We denied login, if you think someone else tried to access your account click on https://example.com/change-password to change your password."
                    }).toJSON()
                });
            }
        });
    }
}

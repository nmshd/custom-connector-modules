import { DataEvent } from "@js-soft/ts-utils";

export interface TwoFactorAuthenticationAcceptedEventData {
    peer: string;
}

export class TwoFactorAuthenticationAcceptedEvent extends DataEvent<TwoFactorAuthenticationAcceptedEventData> {
    constructor(data: TwoFactorAuthenticationAcceptedEventData) {
        super("university-x.2fa.accepted", data);
    }
}

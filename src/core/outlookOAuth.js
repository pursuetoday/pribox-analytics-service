import "isomorphic-fetch";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import MailboxModel from "../models/mailbox";
import { OUTLOOK_CREDS } from "../config";

function getRefreshToken(oAuthClient) {
	const tokenCache = oAuthClient.getTokenCache().serialize();
	const refreshTokenObject = JSON.parse(tokenCache).RefreshToken;
	const refreshToken =
		refreshTokenObject[Object.keys(refreshTokenObject)[0]]?.secret;
	return refreshToken;
}

class AuthProvider {
	constructor(mailboxId) {
		this.mailboxId = mailboxId;
	}

	async getAccessToken() {
		let mailbox;
		mailbox = await MailboxModel.findOne({ _id: this.mailboxId });

		const isAboutToExpire =
			new Date(mailbox.social.expiresAt).getTime() < Date.now();

		if (isAboutToExpire) {
			const oAuthClient = getOAuth2Client();
			const res = await oAuthClient.acquireTokenByRefreshToken({
				scopes: OUTLOOK_CREDS.scopes,
				refreshToken: mailbox.social.refreshToken,
			});
			const newRefreshToken = getRefreshToken(oAuthClient);

			MailboxModel.updateOne(
				{ _id: this.mailboxId },
				{
					$set: {
						"social.accessToken": res.accessToken,
						"social.expiresAt": res.expiresOn,
						"social.refreshToken":
							newRefreshToken || mailbox.social.refreshToken,
					},
				}
			).catch(() => {});

			return res.accessToken;
		}
		return mailbox.social.accessToken;
	}
}

function getOAuth2Client() {
	return new ConfidentialClientApplication({
		auth: {
			clientId: OUTLOOK_CREDS.client_id,
			authority: OUTLOOK_CREDS.authority,
			clientSecret: OUTLOOK_CREDS.client_secret,
		},
	});
}

export function getApiClient(mailboxId) {
	return Client.initWithMiddleware({
		authProvider: new AuthProvider(mailboxId),
	});
}

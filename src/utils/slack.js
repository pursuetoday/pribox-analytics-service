import axios from "axios";
import { serializeError } from "./error";
import { shortenedEnvs } from "../constant";

const SLACK_SERVICE_URL =
	"https://hooks.slack.com/services/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";

export default async function slack(message, pretext, variant = "none", extra) {
	try {
		if (process.env.NODE_ENV === "pre-dev") {
			return console.log(
				`${pretext}: ${parseMessage(message)}
			${extra ? parseMessage(extra) : ""}`
			);
		}

		const slackMessageBody = {
			attachments: [
				{
					title: `Pribox.Analytic.Service [${
						shortenedEnvs[process.env.NODE_ENV]
					}] ${variant === "error" ? "ERROR" : ""}: ${pretext}`,
					text: `${parseMessage(message)}
					${extra ? parseMessage(extra) : ""}`,
					color: getColorFromVariant(variant),
				},
			],
		};
		await axios({
			method: "POST",
			url: SLACK_SERVICE_URL,
			data: slackMessageBody,
			headers: { "content-type": "application/json" },
		});
	} catch (e) {
		console.log("slack error: ", e.message);
	}
}

function parseMessage(message) {
	if (typeof message === "string") {
		return message;
	}
	if (message instanceof Error) {
		return serializeError(message);
	} else if (typeof message === "object") {
		return JSON.stringify(message, null, 4);
	}
	return message;
}

function getColorFromVariant(variant) {
	switch (variant) {
		case "none":
			return "#5a29a7";
		case "error":
			return "#FF4842";
		default:
			return "#439FE0";
	}
}

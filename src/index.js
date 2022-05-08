const fs = require("node:fs");
const path = require("node:path");
const jsdom = require("jsdom");
const puppeteer = require("puppeteer");
const axios = require("axios").default;
const uuid = require("uuid");

const ABYA_NAME_VERSION = "Orca";
const ABYA_SUBSCRIPTION_PAGE_URL = "https://abya.gfn.la/pt-BR";

downloadAbyaSubscriptionPage();

async function downloadAbyaSubscriptionPage() {
	try {
		const site = await axios.get(ABYA_SUBSCRIPTION_PAGE_URL);
		const fileSystem = fs.promises;

		if (site.data) {
			const global = new jsdom.JSDOM(site.data, {
				runScripts: "dangerously",
				cookieJar: new jsdom.CookieJar(),
				pretendToBeVisual: true,
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
			});

			const staticText = global.window.document.body.innerHTML;
			const timestamp = new Date().getTime();
			const staticTempFolder = path.join(__dirname, "temp");
			const definePathName = path.join(__dirname, "temp", timestamp + ".html");
			const versionControlPath = path.join(__dirname, "version.json");

			if (!fs.existsSync(staticTempFolder)) {
				await fileSystem.mkdir(staticTempFolder);
			}

			// Save version control
			const versionControlObject = {
				id: uuid.v4(),
				name: ABYA_NAME_VERSION,
				filename: definePathName,
				url: site.config.url,
				timestamp: timestamp,
			};

			// Write to disk
			await fileSystem.writeFile(definePathName, staticText);
			await fileSystem.writeFile(versionControlPath, JSON.stringify(versionControlObject, null, 4));

			if (global.window) {
				// const document = global.window.document.body;
				// const planSection = document.querySelector("#plans");
				// console.log(document.innerHTML);
				// const importantNodes = planSection.querySelectorAll("div[data-name]");
				// const plans = Array.from(importantNodes).filter((node) => {
				// 	const dataAttr = node.getAttribute("data-name");
				// 	return uuid.validate(dataAttr.split("plan-")[1]);
				// });
			} else {
				const error = new Error();
				error.name = "DownloadError";
				error.message = "Could not download the abya subscription page";
				throw error;
			}
		} else {
			const error = new Error();
			error.name = "DownloadError";
			error.message = "Could not download the abya subscription page";
			throw error;
		}
	} catch (error) {
		if (error instanceof Error) {
			console.log("ErrorId:", uuid.v4());
			console.log("ErrorName:", error.name);
			console.log("ErrorMesssage:", error.message);
			console.error("ErrorDetails:", error);
		}
	}
}

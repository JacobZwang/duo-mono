import hotp from "./hotp";

(async () => {
	// retrieve prefrences or set to true if not found
	const prefs: {
		duoAutoLogin: boolean;
	} = await new Promise((resolve, reject) => {
		chrome.storage.sync.get(["duoAutoLogin"], (data) => {
			if (data.duoAutoLogin !== "false" && data.duoAutoLogin !== "true") {
				chrome.storage.sync.set({ duoAutoLogin: "true" });

				resolve({
					duoAutoLogin: true
				});
			} else {
				resolve({
					duoAutoLogin: data.duoAutoLogin === "true"
				});
			}
		});
	});

	// attempt to sign in if not create new device
	if (location.toString().includes("duosecurity.com/frame/prompt") && prefs.duoAutoLogin) {
		chrome.storage.sync.get(
			["hotp", "count"],
			async (secret: { count: string; hotp: string }) => {
				if (secret.hotp) {
					const count = parseInt(secret.count ?? "1");
					const token = await hotp(secret.hotp, count);

					const selectDevice = document.getElementsByName(
						"device"
					)[0] as HTMLSelectElement;

					const devices = Array.from(
						(document.getElementsByName("device")[0] as HTMLSelectElement).options
					);
					const device = devices.find((device) =>
						device.innerHTML.includes("ext-auto-login")
					);

					selectDevice.value = device.value;

					//@ts-expect-error I'm not sure why I'm setting like this, but since it works, I'm not inclined to change it
					device.selected = "selected";

					const button = document.getElementById("passcode");
					button.click();

					const input = document.activeElement as HTMLInputElement;

					input.value = token;

					document.getElementsByName("dampen_choice")[0].click();

					chrome.storage.sync.set({ count: (count + 1).toString() });

					button.click();
				} else {
					document.getElementById("new-device").click();
				}
			}
		);
	}

	// add help message for the user
	if (
		location.toString().includes("duosecurity.com/frame/enroll/pre_flow_prompt") &&
		prefs.duoAutoLogin
	) {
		const title = document.getElementById("header-title");
		title.style.fontWeight = "bold";
		title.style.marginBottom = "20px";
		title.style.fontSize = "16px";
		title.style.color = "black";
		title.style.border = "2px solid #63B246";
		title.style.borderRadius = "3px";
		title.style.padding = "5px";
		title.style.backgroundColor = "white";

		title.innerHTML = `
			Thanks for getting Duo Mono!
			<br/>
			<span style="font-size: 12px;">
				You'll need to authenticate yourself manually one last time so we can add a new device to your account.
			</span>
		`;
	}

	// choose to enroll device
	if (location.toString().includes("duosecurity.com/frame/enroll/flow") && prefs.duoAutoLogin) {
		Array.from(document.getElementsByName("flow"))
			.find((element: HTMLInputElement) => element.value === "tablet")
			.click();
		document.getElementById("continue").click();
	}

	// choose androind device platform
	if (
		location.toString().includes("duosecurity.com/frame/enroll/enrollplatform") &&
		prefs.duoAutoLogin
	) {
		Array.from(document.getElementsByName("platform"))
			.find((element: HTMLInputElement) => element.value === "Android")
			.click();
		document.getElementById("continue").click();
	}

	// choose duo installed to get qr code
	if (
		location.toString().includes("duosecurity.com/frame/enroll/install_mobile_app") &&
		prefs.duoAutoLogin
	) {
		document.getElementById("duo-installed").click();
	}

	// get host and code from qr code, fetch secret, and save secret to local storage
	if (
		location.toString().includes("duosecurity.com/frame/enroll/mobile_activate") &&
		prefs.duoAutoLogin
	) {
		const [host, code] = (
			document.getElementsByClassName("qr")[0] as HTMLImageElement
		).src.split("/frame/qr?value=");

		fetch(`${host}/push/v2/activation/${code.split("-")[0]}?customer_protocol=1`, {
			method: "POST"
		})
			.then((res) => res.json())
			.then((json) => {
				const secret = json.response.hotp_secret;

				chrome.storage.sync.set({ hotp: secret });

				if (secret) {
					chrome.storage.sync.set({ hotp: secret }, () => {
						return Promise.resolve(secret);
					});
				} else {
					throw new Error("failed to get secret");
				}
			})
			.then(() => {
				document.getElementById("continue").click();
			});
	}

	// set newly created device as default
	if (location.toString().includes("duosecurity.com/frame/enroll/finish") && prefs.duoAutoLogin) {
		const devices = document.getElementsByClassName("device-bar");

		(
			devices[devices.length - 1].getElementsByClassName("text-input")[0] as HTMLInputElement
		).value = "ext-auto-login";

		(
			devices[devices.length - 1].getElementsByClassName(
				"edit-submit"
			)[0] as HTMLButtonElement
		).click();

		const title = document.getElementById("header-title");

		title.innerHTML = `
		Setup Complete!
		<br/>
		<span style="font-size: 12px;">
			Reload this page and you should be automatically logged in.
		</span>
	`;

		title.style.fontWeight = "bold";
		title.style.marginBottom = "20px";
		title.style.fontSize = "16px";
		title.style.color = "black";
		title.style.border = "2px solid #63B246";
		title.style.borderRadius = "3px";
		title.style.padding = "5px";
		title.style.backgroundColor = "white";

		document.getElementById("continue-to-login").click();
	}
})();

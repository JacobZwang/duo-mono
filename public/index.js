let duo;
let erase;

window.addEventListener("DOMContentLoaded", () => {
	duo = document.getElementById("duo-auto-login");
	erase = document.getElementById("erase");

	duo.addEventListener("change", toggleDuoAutoLogin);
	erase.addEventListener("click", eraseHOTPSecret);

	chrome.storage.sync.get(["duoAutoLogin", "hotp"], (data) => {
		duo.checked = data.duoAutoLogin === "true";

		if (!data.hotp) erase.style.display = "none";
	});
});

function eraseHOTPSecret() {
	chrome.storage.sync.set({
		hotp: ""
	});

	erase.style.display = "none";
}

function toggleDuoAutoLogin() {
	chrome.storage.sync.set({
		duoAutoLogin: duo.checked ? "true" : "false"
	});
}

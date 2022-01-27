// Adapted from: https://github.com/khovansky-al/web-otp-demo/blob/master/src/hotp.js

export async function generateKey(secret: string, counter: number): Promise<ArrayBuffer> {
	const Crypto = window.crypto.subtle;
	const encoder = new TextEncoder();
	const secretBytes = encoder.encode(secret);
	const counterArray = padCounter(counter);
	const key = await Crypto.importKey(
		"raw",
		secretBytes,
		{ name: "HMAC", hash: { name: "SHA-1" } },
		false,
		["sign"]
	);

	const HS = await Crypto.sign("HMAC", key, counterArray);

	return HS;
}

export function padCounter(counter: number): ArrayBuffer {
	const buffer = new ArrayBuffer(8);
	const bView = new DataView(buffer);
	const byteString = "0".repeat(64); // 8 bytes
	const bCounter = (byteString + counter.toString(2)).slice(-64);

	for (let byte = 0; byte < 64; byte += 8) {
		const byteValue = parseInt(bCounter.slice(byte, byte + 8), 2);
		bView.setUint8(byte / 8, byteValue);
	}

	return buffer;
}

export function DT(HS: ArrayBuffer): string {
	const offset = HS[19] & 0b1111;
	const P =
		((HS[offset] & 0x7f) << 24) |
		(HS[offset + 1] << 16) |
		(HS[offset + 2] << 8) |
		HS[offset + 3];
	const pString = P.toString(2);

	return pString;
}

export function truncate(uKey: ArrayBuffer): number {
	const sBits = DT(uKey);
	const sNum = parseInt(sBits, 2);

	return sNum;
}

export default async function generateHOTP(secret: string, counter: number): Promise<string> {
	const key = await generateKey(secret, counter);
	const uKey = new Uint8Array(key);

	const sNum = truncate(uKey);
	const padded = ("000000" + (sNum % 10 ** 6)).slice(-6);

	return padded;
}

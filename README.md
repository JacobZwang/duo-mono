# Duo Mono

Automatically log into Duo 2fa using this Chrome extension. If you have Chrome sync turned on it will work anywhere you are signed into Chrome.


> status: Chrome extension in review

## How It Works

On your first sign in after installing the extension you will see a message telling you that you need to sign in with you usual authentication method. By signing in you are allowing Duo Mono to create a new authentication device. This device will say it is of type android device, however, it is actually just using this device to acquire a device token.

Duo Mono uses this token to query Duo's server to acquire an authentication secret. This secret is saved to you google sync storage and used to generate a login token each time it signs you in. It then sets your default authentication device to the android device it created. During this process you will see multiple pages be automatically filled in and then you will be redirected to you usual destination.

When your session runs out and you need to authenticate using Duo again, Duo Mono will automatically generate a token and submit it for you.

## Security Concerns

- Your Duo integrated service is now as secure as your chrome account. If your chrome account is compromised, remove the device Duo Mono created for you immediately because it could be used to sign into your account even if the infiltrator no longer has access to your chrome account. The device will be called ext-auto-login

## Info

- If you need log in manually or change something, open the extension popup in the top right and flip the switch off.

- This will not work with multiple Duo accounts at the same time (yet).

## I've Seen This Before
Although there are other projects which provide ways to avoid Duo's 2fa, none of them provide a fully automated solution like this project does. To my knowledge, this is also the only project that utilizes the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to securely generate token in your browser, not on an external (untrusted) server.

## Contributing
Install pnpm and dependencies
```bash
npm install pnpm -g
pnpm i
```
Build for production
```
pnpm run build
```
1. go to `chrome://extensions` and turn on turn on developer mode
3. click load unpacked and select the public folder in this repository
5. when you make an update, rebuild the extension with `pnpm run build` and click the reload button in `chrome://extensions`

## To Do
- CI/CD
- support multiple accounts (give each device a unique name and store it's name with the token)
- support Safari
import emailProvidersConfig from '../constant/emailProviders';
import { getDecryptedPassword } from '../utils/encryption';


export function getIMAPConfig(args, decrypt = true) {
	const providerObj = emailProvidersConfig[args.provider];
	const type = 'imap';
	const authTimeout = 30000;
	switch (args.provider) {
		case 'other':
		case 'custom':
			return {
				port: args[type].port,
				host: args[type].host,
				user: args[type].username,
				password: decrypt ? getDecryptedPassword(args[type].password) : args[type].password,
				authTimeout,
				tls: args[type].security === 'ssl/tls',
				tlsOptions: { servername: args[type].host, rejectUnauthorized: false },
			};
		case 'outlook':
			const auth2 = base64(`user=${args.email}^Aauth=Bearer ${args.social.accessToken}^A^A`);
			return {
				port: providerObj[type].port,
				host: providerObj[type].host,
				xoauth2: auth2,
				authTimeout,
				tls: true,
				tlsOptions: {
					servername: providerObj[type].host,
					rejectUnauthorized: false,
				},
			};
		default:
			return {
				port: providerObj[type].port,
				host: providerObj[type].host,
				user: args.email,
				password: decrypt ? getDecryptedPassword(args.password) : args.password,
				authTimeout,
				tls: true,
				tlsOptions: {
					servername: providerObj[type].host,
					rejectUnauthorized: false,
				},
			};
	}
}

export const base64 = (data) => Buffer.from(data).toString('base64');

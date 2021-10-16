declare var chrome: {
	storage: {
		sync: {
			set: (data: Record<string, any>, callback?: () => void) => void;
			get: (keys: string[], callback: (data: Record<string, any>) => void) => void;
		};
	};
};

declare module "*.css" {
	let css: string;
	export default css;
}

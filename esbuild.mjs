import esbuild from "esbuild";
import minimist from "minimist";
import chalk from "chalk";

const args = minimist(process.argv.slice(2));

esbuild.build({
	entryPoints: ["./src/main.ts"],
	outfile: "public/build/main.js",
	bundle: true,
	platform: "node",
	format: "cjs",
	loader: {
		".css": "text"
	},
	watch: args["watchbuild"]
		? {
				onRebuild(error, result) {
					if (error) console.error(chalk.red("error   :", error));
					else console.log(chalk.green("success :"), "built and bundled main.ts");

					if (args["watchstart"])
						console.log(chalk.red("error   :"), "watch:start is not implemented yet");
				}
		  }
		: undefined
});

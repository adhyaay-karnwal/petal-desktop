// Test mode: keep Petal behind other apps (no dock icon, no activation, no focus).
import { electron } from "../../../__bundle__/_preamble.js";

if (process.env.PETAL_BACKGROUND === "1") {
	if (process.platform === "darwin") electron.app.setActivationPolicy("accessory");
	const proto = electron.BrowserWindow.prototype;
	proto.show = function() {
		this.showInactive();
	};
	proto.focus = function() {};
	proto.moveTop = function() {};
	electron.app.focus = () => {};
	electron.app.on("web-contents-created", (_e, contents) => {
		contents.focus = () => {};
		contents.openDevTools = () => {};
	});
}

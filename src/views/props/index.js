import "./color-prop.js";
import "./compound-prop-view.js";
import "./linked-remote-prop.js";
import "./named-localremote-prop.js";
import "./string-prop.js";
import "./unhandled-prop-type.js";

import { INVALID, VALID, FALLBACK, PREFERRED, registerView } from "../view-registry.js";

registerView("unhandled-prop-type", () => FALLBACK);

registerView("string-prop", x => x.dataType === "string" ? VALID : INVALID);
registerView("color-prop", x => x.compactField === "color" ? PREFERRED : INVALID);

registerView("named-localremote-prop", x => (x.dataType === "Goal" && x.localRemote) ? PREFERRED : INVALID);
registerView("linked-remote-prop", x => x.remote ? PREFERRED : INVALID);
registerView("compound-prop-view", x => x.compoundType ? PREFERRED : INVALID);


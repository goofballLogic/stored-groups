import "./color-prop.js";
import "./compound-prop-view.js";
import "./string-prop.js";
import "./unhandled-prop-type.js";
import { INVALID, VALID, FALLBACK, PREFERRED, registerView } from "../view-registry.js";

registerView("unhandled-prop-type", () => FALLBACK);
registerView("string-prop", x => x.dataType === "string" ? VALID : INVALID);
registerView("compound-prop-view", x => x.compoundType ? PREFERRED : INVALID);
registerView("color-prop", x => x.compactField === "color" ? PREFERRED : INVALID);
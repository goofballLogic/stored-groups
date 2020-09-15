import config from "./config.js";
import { subscribe } from "./bus.js";

subscribe(config.bus.ERROR, console.error.bind(console));

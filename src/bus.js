import uuid from "./uuid.js";

const sinks = {};

export function subscribe(topic, callback) {
    if (!(topic in sinks)) sinks[topic] = { subscriptions: {} };
    const subscriptions = sinks[topic].subscriptions;
    const id = uuid();
    subscriptions[id] = callback;
    return id;
}

export function publish(topic, payload) {
    if (!topic) throw new Error("Topic not specified");
    console.log("publishing", topic, payload);
    const subscriptions = sinks[topic] && sinks[topic].subscriptions;
    if (!subscriptions) return;
    const callbacks = Object.values(subscriptions);
    setTimeout(function () {

        callbacks.forEach(callback => callback(topic, payload));

    });
    return callbacks.length;
}

window.bus_publish = publish;
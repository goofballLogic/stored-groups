import uuid from "./uuid.js";

const sinks = {};

export function subscribe(topic, callback) {
    if (!(topic in sinks)) sinks[topic] = { subscriptions: {} };
    const subscriptions = sinks[topic].subscriptions;
    const id = uuid();
    subscriptions[id] = callback;
    console.log({ subscribed: callback }, topic);
    return id;
}

export function publish(topic, payload) {
    console.log("Publishing message", topic, payload);
    const subscriptions = sinks[topic] && sinks[topic].subscriptions;
    if (!subscriptions) return;
    const callbacks = Object.values(subscriptions);
    setTimeout(function () {

        callbacks.forEach(callback => callback(topic, payload));

    });
    return callbacks.length;
}

window.bus_publish = publish;